import { z } from "zod";
import { router, privateProcedure, publicProcedure } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { PDFDocument } from "pdf-lib";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../lib/config";

const shippingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
});

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  productItems: ProductItem[];
}

interface ProductItem {
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

const phoneSchema = z.string().regex(/^03\d{9}$/, {
  message: "Phone number must start with '03' and be 11 digits long.",
});

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(); // Current timestamp in milliseconds
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
  return `ESU-2410${timestamp.slice(-3)}-${randomPart}`; // Use last 6 digits of timestamp + random number
};

export const orderRouter = router({
  getOrders: privateProcedure
    .input(z.object({ range: z.string().optional() })) 
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient();
      const now = new Date();

      let dateFilter: { greater_than?: string } = {};

      switch (input.range) {
        case "1_week":
          dateFilter = {
            greater_than: new Date(now.setDate(now.getDate() - 7)).toISOString(),
          };
          break;
        case "3_months":
          dateFilter = {
            greater_than: new Date(now.setMonth(now.getMonth() - 3)).toISOString(),
          };
          break;
        case "6_months":
          dateFilter = {
            greater_than: new Date(now.setMonth(now.getMonth() - 6)).toISOString(),
          };
          break;
        case "all":
        default:
          dateFilter = {}; // No filter for all-time
          break;
      }

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          user: { equals: ctx.user.id },
          ...(dateFilter.greater_than && {
            createdAt: {
              greater_than: dateFilter.greater_than,
            },
          }),
        },
        depth: 2,
      });

      return orders;
    }),

  // Get a single order by ID
  getOrderById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: input.id,
          },
          user: {
            equals: ctx.user.id, // Ensure the user only sees their own orders
          },
        },
        depth: 2, // Fetch relationships deeply (products, etc.)
      });

      const order = orders[0];
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return order;
    }),

    // Get a single order by ID
  getOrderByOrderNumber: privateProcedure
  .input(z.object({ orderNumber: z.string() }))
  .query(async ({ input, ctx }) => {
    const payload = await getPayloadClient();

    const { docs: orders } = await payload.find({
      collection: "orders",
      where: {
        id: {
          equals: input.orderNumber,
        },
        user: {
          equals: ctx.user.id,
        },
      },
      depth: 2, 
    });

    const order = orders[0];
    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    return order;
  }),

  // Admin: Update order status
  updateOrderStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update order status",
        });
      }

      const payload = await getPayloadClient();

      const updatedOrder = await payload.update({
        collection: "orders",
        id: input.id,
        data: {
          status: input.status,
        },
      });

      return updatedOrder;
    }),

    createPublicSession: publicProcedure
    .input(
      z.object({
        productItems: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number(),
          })
        ),
        shippingAddress: shippingAddressSchema,
        name: z.string(),
        email: z.string().email(), 
        phone: z.string(), 
      })
    )
    .mutation(async ({ input }) => {
      const { productItems, shippingAddress, email, phone, name } = input;

      if (productItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No products in the order",
        });
      }

      const payload = await getPayloadClient();

      // Fetch products to ensure they exist and have enough inventory
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productItems.map((item) => item.productId),
          },
        },
      });

      // Ensure products exist and have prices
      const filteredProductsHavePrice = products.filter((product) =>
        Boolean(product.priceId)
      );

      if (filteredProductsHavePrice.length !== productItems.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some products do not have prices or were not found",
        });
      }

      // Calculate the total and gather product details with priceAtPurchase
      const orderProductItems = productItems.map((item) => {
        const product = filteredProductsHavePrice.find(
          (p) => p.id === item.productId
        );
        if (!product) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Product with ID ${item.productId} not found`,
          });
        }
        
        const productPrice = (product.discountedPrice ?? product.price) as number;
        return {
          product: item.productId,
          quantity: item.quantity,
          priceAtPurchase: productPrice,  // Add priceAtPurchase here
        };
      });

      // Calculate the total price
      const total = orderProductItems.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0);

      // Generate unique order number
      const orderNumber = generateOrderNumber();

      // Step 1: Create the order without associating with a user (guest checkout)
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          _isPostexOrderCreated: false,
          productItems: orderProductItems,
          name,
          email, 
          phone,
          shippingAddress,
          orderNumber,
          total,
          paymentType: "card"
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Prepare line items for Stripe session
      for (const item of productItems) {
        const product = filteredProductsHavePrice.find(
          (p) => p.id === item.productId
        );
        if (product) {
          // Prepare line item for Stripe
          line_items.push({
            price: product.priceId!.toString(),
            quantity: item.quantity,
          });
        }
      }

      if (line_items.length === 0) {
        // Rollback the order if no valid products are found
        await payload.delete({
          collection: "orders",
          id: order.id,
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid products in the order.",
        });
      }

      // Create a guest customer in Stripe
      const customer = await stripe.customers.create({
        email,
        shipping: {
          name: name, // Use email as name for guests
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postalCode || '',
            country: shippingAddress.country,
          },
          phone: phone, // Include the phone number
        },
      });

      const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;

      // Step 2: Create Stripe session
      let stripeSession;
      try {
        stripeSession = await stripe.checkout.sessions.create({
          customer: customer.id,
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}&guestEmail=${email}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card"],
          mode: "payment",
          metadata: {
            orderId: order.id,
            userId: customer.id,
            orderNumber,
            name,
            email, 
            phone, 
          },
          line_items,
          shipping_address_collection: {
            allowed_countries: ["PK"], // Specify allowed shipping countries
          },
          shipping_options: isFreeShipping
            ? [
                {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                      amount: 0, // Free shipping
                      currency: "pkr",
                    },
                    display_name: "Free Shipping",
                    delivery_estimate: {
                      minimum: {
                        unit: "business_day",
                        value: 5,
                      },
                      maximum: {
                        unit: "business_day",
                        value: 7,
                      },
                    },
                  },
                },
              ]
            : [
                {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                      amount: SHIPPING_FEE * 100, 
                      currency: "pkr",
                    },
                    display_name: "Standard Shipping",
                    delivery_estimate: {
                      minimum: {
                        unit: "business_day",
                        value: 5,
                      },
                      maximum: {
                        unit: "business_day",
                        value: 7,
                      },
                    },
                  },
                },
              ],
        });
      } catch (error) {
        // Enhanced error logging for debugging
        console.error("Error creating Stripe session:", error);

        // Rollback the order if Stripe session creation fails
        await payload.delete({
          collection: "orders",
          id: order.id,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe session.",
        });
      }

      // // Step 3: Create the order in Postex
      // try {
      //   const postexOrderData = {
      //     order_number: order.orderNumber,
      //     customer_name: email,
      //     customer_address: `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.country}`,
      //     customer_phone: phone,
      //     items: productItems.map((item) => ({
      //       name: filteredProductsHavePrice.find((p) => p.id === item.productId)?.name || 'Unknown Product',
      //       quantity: item.quantity,
      //     })),
      //     total_amount: total,
      //   };

      //   // Create the order in Postex
      //   const postexResponse = await createPostexOrder(postexOrderData);
      //   console.log("Postex order created:", postexResponse);
      // } catch (error) {
      //   console.error("Error while creating order in Postex:", error);
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Failed to create order in Postex.",
      //   });
      // }

      // Step 4: Return the Stripe session URL for the client to redirect
      return { url: stripeSession.url };
    }),


    trackOrder: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          orderNumber: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { email, orderNumber } = input;
        const payload = await getPayloadClient();
    
        // Query to find the order by both email and orderNumber
        const { docs: orders } = await payload.find({
          collection: "orders",
          where: {
            orderNumber: { equals: orderNumber },
            email: { equals: email }, // Ensure the email matches as well
          },
        });
    
        // If no orders are found, return a 404 error
        if (orders.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
    
        const [order] = orders;
        return order;
      }),

      generateInvoice: publicProcedure
        .input(
          z.object({
            orderId: z.string(),
            logoUrl: z.string().optional(), // Logo URL for the invoice, optional
          })
        )
        .mutation(async ({ input }) => {
          const { orderId, logoUrl } = input;

          // Fetch order details using Payload CMS
          const payload = await getPayloadClient();
          const { docs: orders } = await payload.find({
            collection: "orders",
            depth: 2,
            where: { id: { equals: orderId } },
          });

          const order = orders[0];
          if (!order) throw new Error("Order not found");

          // Create a new PDF document
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([600, 800]);
          const { width, height } = page.getSize();
          const fontSize = 12;

          // Fetch and embed the logo (default to esu.png if not provided)
          const logoBytes = await fetch(
            logoUrl || `${process.env.NEXT_PUBLIC_SERVER_URL}/esu.png`
          ).then((res) => res.arrayBuffer());
          
          const logoImage = await pdfDoc.embedPng(logoBytes);
          page.drawImage(logoImage, {
            x: 50,
            y: height - 150,
            width: 100,
            height: 100,
          });

          // Company Address (hardcoded or configurable)
          const companyAddress = `
            ESU STORE LLC
            7901 4TH ST N # 16774
            ST PETERSBURG FL 33702-4305
          `;

          const optionalField = (field?: string | null) => {
            return field ? `${field}, ` : ""
          }

          const shippingAddress = order.shippingAddress as ShippingAddressType;
          const orderSummary = `
            Order Number: ${order.orderNumber}
            Date: ${new Date(order.createdAt as string).toLocaleDateString()}
            Status: ${order.status ?? "N/A"}
            Shipping Address: ${shippingAddress.line1}, 
            ${optionalField(shippingAddress.line2)}
            ${shippingAddress.city}, ${optionalField(shippingAddress.line2)} ${optionalField(shippingAddress.line2)}
          `;

          // Draw the invoice title and company address
          page.drawText("Invoice", { x: 50, y: height - 50, size: 20 });
          page.drawText(companyAddress, { x: 50, y: height - 200, size: fontSize });
          page.drawText(orderSummary, { x: 50, y: height - 300, size: fontSize });

          // Display the list of items
          page.drawText("Items:", { x: 50, y: height - 350, size: fontSize });
          let currentY = height - 380;

          // Loop through the product items
          const orderProductItems = order.productItems as ProductItem[];
          for (const item of orderProductItems) {
            page.drawText(
              `${item.quantity}x ${item.product.name} - $${item.product.price}`,
              { x: 50, y: currentY, size: fontSize }
            );
            currentY -= 20;
          }

          // Calculate and display the total amount
          const total = orderProductItems.reduce(
            (acc, item) => acc + item.quantity * item.product.price,
            0
          );
          page.drawText(`Total: $${total}`, { x: 50, y: currentY - 30, size: fontSize });

          // Finalize and save the PDF
          const pdfBytes = await pdfDoc.save();

          // Return the binary data of the PDF for download
          return pdfBytes;
        }),


  // Admin: Create an order (for testing purposes)
//   createOrder: privateProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         productItems: z.array(
//           z.object({
//             productId: z.string(),
//             quantity: z.number().min(1),
//           })
//         ),
//         shippingAddress: shippingAddressSchema,
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       if (ctx.user.role !== "admin") {
//         throw new TRPCError({
//           code: "UNAUTHORIZED",
//           message: "Only admins can create orders",
//         });
//       }

//       const payload = await getPayloadClient();

//       const total = productItems.reduce((acc, item) => {
//         const product = filteredProductsHavePrice.find((p) => p.id === item.productId);
//         if (product) {
//           return acc + product.price * item.quantity;
//         }
//         return acc;
//       }, 0);

//       const orderNumber = generateOrderNumber();

//       const createdOrder = await payload.create({
//         collection: "orders",
//         data: {
//           user: input.userId,
//           productItems: input.productItems.map((item) => ({
//             product: item.productId,
//             quantity: item.quantity,
//           })),
//           shippingAddress: input.shippingAddress,
//           _isPaid: false,
//           status: "pending",
//           orderNumber, // Save the generated order number
//         },
//       });

//       return createdOrder;
//     }),
});
