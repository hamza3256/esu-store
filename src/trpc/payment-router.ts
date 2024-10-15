import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";
import { Product, User } from "@/payload-types";
import { Order, PromoCode } from "@/lib/types";
import { createPostexOrder } from "../lib/postex";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../lib/config";
import { OrderNotificationHtml } from "../components/emails/OrderNotification";
import { ReceiptEmailHtml } from "../components/emails/ReceiptEmail";
import { resend } from "../lib/resend";

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

interface ProductItemsType {
  product: string | Product;
  quantity: number;
  priceAtPurchase: number;
  id?: string | null;
}[];

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

interface ProductItem {
  product: string | Product;
  quantity: number;
  id?: string | null;
  priceAtPurchase: number;
}

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
        promoCode: z.string().optional(), // Adding promoCode input
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productItems, shippingAddress, phone, promoCode } = input;

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

      // Calculate the total and gather product details with priceAtPurchase
      let orderTotal = 0;
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
        orderTotal += productPrice * item.quantity;

        return {
          product: item.productId,
          quantity: item.quantity,
          priceAtPurchase: productPrice, // Add priceAtPurchase here
        };
      });

      // Validate and apply promo code if provided
      let discountPercentage = 0;
      let promo;
      let stripeCouponId: string | null = null;
      if (promoCode) {
        const now = new Date().toISOString();
        const { docs: promoCodes } = await payload.find({
          collection: "promo-codes",
          where: {
            code: {
              equals: promoCode,
            },
            validFrom: {
              less_than_equal: now,
            },
            validUntil: {
              greater_than_equal: now,
            },
          },
          limit: 1,
        });

        console.log("promoCodes: " + promoCodes )

        if (!promoCodes || promoCodes.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired promo code.",
          });
        }

        promo = promoCodes[0] as PromoCode;

        const currentUses = promo.currentUses ?? 0; // Ensure currentUses is initialized
        if (currentUses >= promo.maxUses) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This promo code has reached its usage limit.",
          });
        }

        discountPercentage = promo.discountPercentage;

        try {
          // Create a Stripe coupon with the applied promo code discount
          const coupon = await stripe.coupons.create({
            percent_off: promo.discountPercentage , // Use the discount percentage from the promo code
            duration: 'once', // This means the coupon applies only once
          });
      
          stripeCouponId = coupon.id;
        } catch (error) {
          console.error('Error creating Stripe coupon:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create Stripe coupon.",
          });
        }
      }

      // Apply the discount to the order total if applicable
      const discount = (discountPercentage / 100) * orderTotal;
      const total = Math.round(orderTotal - discount);

      // Generate unique order number
      const orderNumber = generateOrderNumber();
      const paymentType: "card" | "cod" = "card";
      const appliedPromoCode: (PromoCode | undefined) = promo

      // Step 1: Create the order but don't deduct inventory yet
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          _isPostexOrderCreated: false,
          productItems: orderProductItems,
          name: user.name ?? user.email,
          email: user.email,
          user: user.id,
          phone: phone,
          shippingAddress,
          orderNumber,
          total,
          paymentType: paymentType,
          appliedPromoCode: appliedPromoCode ? appliedPromoCode.id : undefined, // Only save the promo code ID
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Prepare line items for Stripe session
      for (const item of productItems) {
        const product = filteredProductsHavePrice.find(
          (p) => p.id === item.productId
        );
        if (product) {
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
              line2: shippingAddress.line2 || '', // Optional field
              city: shippingAddress.city,
              state: shippingAddress.state || '',
              postal_code: shippingAddress.postalCode || '',
              country: shippingAddress.country,
            },
            phone: phone,
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
            orderNumber: orderNumber,
            email: user.email,
            phone: phone,
          },
          line_items,
          shipping_address_collection: {
            allowed_countries: ['PK'],
          },
          shipping_options: isFreeShipping
            ? [
                {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                      amount: 0,
                      currency: "pkr",
                    },
                    display_name: "Free Shipping",
                    delivery_estimate: {
                      minimum: { unit: "business_day", value: 5 },
                      maximum: { unit: "business_day", value: 7 },
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
                      minimum: { unit: "business_day", value: 5 },
                      maximum: { unit: "business_day", value: 7 },
                    },
                  },
                },
              ],
          discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined, // Pass the coupon ID here
        });
      } catch (error) {
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
        
        if (promo) {
          await payload.update({
            collection: "promo-codes",
            id: promo.id,
            data: {
              currentUses: (promo.currentUses || 0) + 1,
            },
          });
        }
      }

      // Step 4: Return the Stripe session URL for the client to redirect
      return { url: stripeSession.url };
    }),

    // Inside your trpc mutation file
    createCODOrder: privateProcedure
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
  
      // Step 1: Create the order but don't deduct inventory yet
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          _isPostexOrderCreated: false,
          productItems: orderProductItems,
          name: user.name ?? user.email,
          email: user.email,
          user: user.id,
          phone: phone,
          shippingAddress,
          orderNumber,
          total,
          paymentType: "cod",
          status: "processing"
        },
      }) as Order;

      try {
          const orderShippingAddress = order.shippingAddress as ShippingAddressType;
          const deliveryAddress = orderShippingAddress.line1.concat(
            orderShippingAddress.line2 ? ", ".concat(orderShippingAddress.line2) : ""
          );
          const itemTotal = order.productItems.reduce(
            (count, item) => count + item.quantity,
            0
          );

          const orderDetail = order.productItems
            .map((item) => `${item.quantity}x ${item.product.name} (${item.product.category})`)
            .join(", ");

          const customerName = order.name ?? order.email

          // Prepare PostEx order data
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

          console.log("postex order data: " + postexOrderData)

          // Create order in PostEx
          const postexResponse = await createPostexOrder(postexOrderData);

          // Update order with PostEx tracking info
          await payload.update({
            collection: "orders",
            id: order.id,
            data: {
              _isPostexOrderCreated: true,
              trackingInfo: {
                trackingNumber: postexResponse.dist.trackingNumber,
                orderStatus: postexResponse.dist.orderStatus,
                orderDate: postexResponse.dist.orderDate,
              },
            },
          });

          console.log("PostEx order created:", postexResponse);
        } catch (error) {
          console.error("Error while creating order in PostEx:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create Postex order.",
          });
        }


      try {
      const orderProductItems = order.productItems as ProductItem[];

        const products = orderProductItems.map((item: any) => {
          if (typeof item.product === "string") {
            return {
              product: { id: item.product },
              quantity: item.quantity,
            };
          } else {
            return {
              product: item.product,
              quantity: item.quantity,
            };
          }
        }).filter((item: { product: null }) => item.product !== null);

        await resend.emails.send({
          from: "ESÜ TEAM <info@esustore.com>",
          to: [user.email],
          subject: "Thanks for your order! Here’s your receipt.",
          html: ReceiptEmailHtml({
            date: new Date(),
            email: user.email,
            orderId: order.id,
            products: products,
            orderNumber,
            shippingFee: SHIPPING_FEE,
            trackingNumber: order.trackingInfo?.trackingNumber || undefined,
            trackingOrderDate: order.trackingInfo?.orderDate || undefined,
            totalPrice: total
          }),
        });

        console.log("Receipt email sent successfully.");

        const notificationHtml = OrderNotificationHtml({
          customerEmail: order.email,
          customerName: order.name ?? order.email,
          date: new Date(),
          orderId: order.id,
          products: products,
          orderNumber: order.orderNumber,
          shippingFee: SHIPPING_FEE, 
          total: order.total, 
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingInfo?.trackingNumber ?? "", 
          
        });
    
        await resend.emails.send({
          from: "ESÜ STORE <info@esustore.com>",
          to: ["orders@esustore.com"],
          subject: `New Order Notification - Order #${order.orderNumber}`,
          html: notificationHtml,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send receipt email",
        });
      }

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
  
      return { order };
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
