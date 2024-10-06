import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";
import { Product, User } from "@/payload-types";
import { Order } from "@/lib/types";
import { createPostexOrder } from "../lib/postex";
import { FREE_SHIPPING_THRESHOLD } from "../lib/config";

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

interface ProductItemType {
  product: Product; 
  quantity: number; 
}

// Function to generate a simple unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(); // Current timestamp in milliseconds
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
  return `ESU-2410${timestamp.slice(-3)}-${randomPart}`; // Use last 6 digits of timestamp + random number
};

const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^03\d{9}$/; // Starts with 03 and has exactly 11 digits
  return phoneRegex.test(phone);
};

const phoneSchema = z
  .string()
  .regex(/^03\d{9}$/, {
    message: "Phone number must start with '03' and be 11 digits long.",
  });

const createCustomer = async (
  email: string | null | undefined,
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    name: string;
  }
) => {
  const customerParams: Stripe.CustomerCreateParams = {
    // Only add email if it's not null or undefined
    ...(email ? { email } : {}),
    ...(shippingAddress
      ? {
          shipping: {
            name: shippingAddress.name,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || "",
              city: shippingAddress.city,
              state: shippingAddress.state || "",
              postal_code: shippingAddress.postalCode || "",
              country: shippingAddress.country,
            },
          },
        }
      : {}),
  };

  try {
    const customer = await stripe.customers.create(customerParams);
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error("Failed to create customer in Stripe.");
  }
};

export const paymentRouter = router({
  createSession: privateProcedure
  .input(
    z.object({
      productItems: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number(),
        })
      ),
      phone: z.string(),
      shippingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productItems, shippingAddress, phone } = input;

    if (!user || !user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

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

    // Calculate the total
    const total = productItems.reduce((acc, item) => {
      const product = filteredProductsHavePrice.find(
        (p) => p.id === item.productId
      );
      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product with ID ${item.productId} not found`,
        });
      }
    const productPrice = product.discountedPrice ?? product.price
      return acc + (productPrice as number) * item.quantity;
    }, 0);

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Step 1: Create the order but don't deduct inventory yet
    const order = await payload.create({
      collection: "orders",
      data: {
        _isPaid: false,
        _isPostexOrderCreated: false,
        productItems: productItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        name: user.name ?? user.email,
        email: user.email,
        user: user.id,
        phone: phone,
        shippingAddress,
        orderNumber,
        total,
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
    
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer if one doesn't exist
      const customer = await createCustomer(user.email, {
        ...shippingAddress,
        name: user.name || user.email,
      });

      customerId = customer.id;

      // Save the customer ID to the user's profile in Payload
      await payload.update({
        collection: "users",
        id: user.id,
        data: {
          stripeCustomerId: customerId,
        },
      });
    } else {
      await stripe.customers.update(customerId, {
        shipping: {
          name: user.name || user.email,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || '',  // Optional field
            city: shippingAddress.city,
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postalCode || '',
            country: shippingAddress.country,
          },
          phone: phone
        },
      });
    }

    let stripeSession;
    try {
      const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;

      stripeSession = await stripe.checkout.sessions.create({
        customer: customerId,
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
        payment_method_types: ["card"],
        mode: "payment",
        metadata: {
          userId: user.id,
          orderId: order.id,
          orderNumber,
          email: user.email,
          phone: phone,
        },
        line_items,
        shipping_address_collection: {
          allowed_countries: ['PK'], // Only Pakistan in this case
        },
        shipping_options: isFreeShipping
          ? [
              // Free shipping option
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
              // Standard shipping option with a cost of 250 PKR
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: 250 * 100, // 250 PKR in cents
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

    // Step 3: Deduct product inventory after Stripe session creation succeeds
    for (const item of productItems) {
      const product = filteredProductsHavePrice.find(
        (p) => p.id === item.productId
      );

      if (!product || !product.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product ID is missing for product: ${product?.name}`,
        });
      }

      // Check if product has enough inventory
      if ((product.inventory as number) < item.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient inventory for product: ${product.name}`,
        });
      }

      const updatedInventory = Math.max(
        (product.inventory as number) - item.quantity,
        0
      );

      // Deduct the quantity from the product's inventory
      await payload.update({
        collection: "products",
        id: product.id,
        data: {
          inventory: updatedInventory,
        },
      });
    }

    // Step 4: Return the Stripe session URL for the client to redirect
    return { url: stripeSession.url };
  }),

  pollOrderStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: { equals: orderId },
        },
      });

      if (orders.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const [order] = orders as Order[];
      
      // If the order is paid, create the order in Postex
      if (order._isPaid) {
        if (!order._isPostexOrderCreated) {
          try {
            const orderShippingAddress = order.shippingAddress as ShippingAddressType
            const deliveryAddress = orderShippingAddress.line1.concat(
              orderShippingAddress.line2 ? ", ".concat(orderShippingAddress.line2) : ""
            )
            const itemTotal = order.productItems.reduce((count, item) => count + item.quantity, 0);
            
            const orderDetail = order.productItems
              .map(item => `${item.quantity}x ${item.product.name} (${item.product.category})`)
              .join(', ');
            
            console.log("using payment router")
            const customerName = order.name ?? order.email
            
            const postexOrderData = {
              cityName: orderShippingAddress.city,
              customerName: customerName,
              customerPhone: order.phone,
              deliveryAddress,
              invoiceDivison: 0,
              invoicePayment: order.total.toString(),
              items: itemTotal,
              orderDetail,
              orderRefNumber: order.orderNumber,
              orderType: "Normal",
              pickupAddressCode: "001",
            };

            const postexResponse = await createPostexOrder(postexOrderData);
            console.log("Postex order created:", postexResponse);
          } catch (error) {
            console.error("Error while creating order in Postex:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create order in Postex.",
            });
          }
        }
        

        // Update the order status to processing
        await payload.update({
          collection: "orders",
          id: orderId,
          data: {
            status: "processing",
          },
        });
      }

      return { isPaid: order._isPaid };
    }),
});
