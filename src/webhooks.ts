import express from "express";
import { WebhookRequest } from "./server";
import { stripe } from "./lib/stripe";
import type Stripe from "stripe";
import { getPayloadClient } from "./get-payload";
import { Product, User } from "./payload-types";
import { ReceiptEmailHtml } from "./components/emails/ReceiptEmail";
import { createPostexOrder } from "./lib/postex";
import { Order, PromoCode } from "./lib/types";
import { SHIPPING_FEE } from "./lib/config";
import { OrderNotificationHtml } from "./components/emails/OrderNotification";
import { resend } from "./lib/resend";

interface ProductItem {
  product: string | Product;
  quantity: number;
  id?: string | null;
}

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const stripeWebhookHandler = async (
  req: express.Request,
  res: express.Response
) => {
  const webhookRequest = req as any as WebhookRequest;
  const body = webhookRequest.rawBody;
  const signature = req.headers["stripe-signature"] || "";

  let event: Stripe.Event;

  // 1. Validate Stripe Webhook Signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error(`Webhook error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
    return res.status(400).send({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 3. Handle `checkout.session.completed` event
  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");
  
    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;
    const userEmail = session.metadata?.email;
  
    if (!orderId || !orderNumber || !userEmail) {
      return res.status(400).send({
        error: "Webhook Error: No orderId or email in metadata.",
      });
    }
  
    const payload = await getPayloadClient();
  
    try {
      const { docs: orders } = await payload.find({
        collection: "orders",
        depth: 2,
        where: {
          id: {
            equals: orderId,
          },
        },
      });
  
      const [order] = orders as Order[];
      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return res.status(404).json({ error: "Order not found." });
      }
  
      // Check if a promo code was applied to the order
      const appliedPromoCode = order.appliedPromoCode as PromoCode;
      if (appliedPromoCode) {
        try {
          // Fetch the promo code details
          const { docs: promoCodes } = await payload.find({
            collection: "promo-codes",
            where: {
              id: {
                equals: appliedPromoCode?.id,
              },
            },
          });
  
          const promo = promoCodes[0];
          if (promo) {
            const currentUses = promo.currentUses as number
            // Update the currentUses of the promo code
            await payload.update({
              collection: "promo-codes",
              id: promo.id,
              data: {
                currentUses: (currentUses || 0) + 1,
              },
            });
          }
        } catch (promoError) {
          console.error("Error updating promo code usage:", promoError);
          return res.status(500).json({ error: "Failed to update promo code usage." });
        }
      }
  
      // Check if PostEx order is already created
      if (!order._isPostexOrderCreated) {
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
  
          const customerName = order.name ?? order.email;
  
          // Prepare PostEx order data
          const postexOrderData = {
            cityName: orderShippingAddress.city,
            customerName,
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
  
          // Create order in PostEx
          const postexResponse = await createPostexOrder(postexOrderData);
  
          // Update order with PostEx tracking info
          await payload.update({
            collection: "orders",
            id: orderId,
            data: {
              _isPostexOrderCreated: true,
              trackingInfo: {
                trackingNumber: postexResponse.dist.trackingNumber,
                orderStatus: postexResponse.dist.orderStatus,
                orderDate: postexResponse.dist.orderDate,
              },
            },
          });
        } catch (error) {
          console.error("Error while creating order in PostEx:", error);
          return res.status(500).send({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order in PostEx.",
          });
        }
      }
  
      // Ensure email hasn't been sent already
      if (order._emailSent) {
        return res.status(200).json({ message: "Email already sent." });
      }
  
      // 4. Update the order as paid
      await payload.update({
        collection: "orders",
        id: orderId,
        data: {
          _isPaid: true,
          _isPostexOrderCreated: true,
          status: "processing",
        },
      });
  
      // Prepare product items for receipt email
      const orderProductItems = order.productItems as ProductItem[];
      const productItems = orderProductItems
        .map((item: any) => {
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
        })
        .filter((item: { product: null }) => item.product !== null);
  
      // 5. Send receipt email
      try {
        await resend.emails.send({
          from: "ESÜ TEAM <info@esustore.com>",
          to: [userEmail],
          subject: "Thanks for your order! Here’s your receipt.",
          html: ReceiptEmailHtml({
            date: new Date(),
            email: userEmail,
            orderId,
            products: productItems,
            orderNumber,
            shippingFee: SHIPPING_FEE,
            trackingNumber: order.trackingInfo?.trackingNumber || undefined,
            trackingOrderDate: order.trackingInfo?.orderDate || undefined,
          }),
        });
  
        console.log("Receipt email sent successfully.");
  
        const notificationHtml = OrderNotificationHtml({
          customerEmail: order.email,
          customerName: order.name ?? order.email,
          date: new Date(),
          orderId: order.id,
          products: productItems,
          orderNumber: order.orderNumber,
          shippingFee: SHIPPING_FEE, // Pass the same shipping fee used in receipt
          total: order.total, // Pass the total order amount
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingInfo?.trackingNumber ?? "", // Pass tracking info if available
        });
  
        await resend.emails.send({
          from: "ESÜ STORE <info@esustore.com>",
          to: ["gems@esustore.com", "orders@esustore.com"],
          subject: `New Order Notification - Order #${order.orderNumber}`,
          html: notificationHtml,
        });
  
        return res.status(200).json({ message: "Order updated, PostEx created, and email sent." });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(500).json({ error: "Failed to send receipt email." });
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: "Failed to process webhook." });
    }
  }
  
  // Respond with 200 OK if event type isn't relevant
  return res.status(200).send();  
};

// Step 10: Define the updateOrder function

const updateOrder = async (payload: any, orderId: string, order: any) => {
  try {
    // Update the order status to _isPaid = true
    const updatedOrder = await payload.update({
      collection: "orders",
      id: orderId,
      data: {
        _isPaid: true,
      },
    });

    // Deduct inventory for each product in the order
    for (const item of order.productItems) {
      const productId = typeof item.product === "string" ? item.product : item.product.id;
      const productQuantity = item.quantity;

      // Fetch the product
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            equals: productId,
          },
        },
      });

      const [product] = products;
      if (product) {
        // Deduct the inventory
        const updatedInventory = Math.max(product.inventory - productQuantity, 0);

        await payload.update({
          collection: "products",
          id: productId,
          data: {
            inventory: updatedInventory,
          },
        });
      }
    }

    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order or inventory: ${error}`);
    throw error;
  }
};
