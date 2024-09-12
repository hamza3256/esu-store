import express from "express";
import { WebhookRequest } from "./server";
import { stripe } from "./lib/stripe";
import type Stripe from "stripe";
import { getPayloadClient } from "./get-payload";
import { Resend } from "resend";
import { Product } from "./payload-types";
import { ReceiptEmailHtml } from "./components/emails/ReceiptEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // 2. Ensure metadata contains necessary information
  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    console.error("No userId or orderId in Stripe metadata.");
    return res.status(400).send({
      error: "Webhook Error: No userId or orderId in metadata.",
    });
  }

  const orderId = session.metadata.orderId;

  // 3. Handle `checkout.session.completed` event
  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");

    const payload = await getPayloadClient();

    try {
      // Fetch the user by ID
      const { docs: users } = await payload.find({
        collection: "users",
        where: {
          id: {
            equals: session.metadata.userId,
          },
        },
      });

      const [user] = users;
      if (!user) {
        console.error(`User not found for ID: ${session.metadata.userId}`);
        return res.status(404).json({ error: "User not found." });
      }

      // Fetch the order by ID
      const { docs: orders } = await payload.find({
        collection: "orders",
        depth: 2,
        where: {
          id: {
            equals: orderId,
          },
        },
      });

      const [order] = orders;
      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return res.status(404).json({ error: "Order not found." });
      }

      console.log("Order found, updating payment status...");

      // 4. Extract the shipping address from the session object
      const shippingAddress = session.shipping_details?.address;

      if (!shippingAddress) {
        console.error("No shipping address available in session");
        return res.status(400).send({ error: "No shipping address found in session" });
      }

      // 5. Update the order with the shipping address
      const updatedOrder = await payload.update({
        collection: "orders",
        id: orderId,
        data: {
          _isPaid: true,
          shippingAddress: {
            line1: shippingAddress.line1 || '',
            line2: shippingAddress.line2 || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postal_code || '',
            country: shippingAddress.country || '',
          },
        },
      });

      console.log("Order payment status updated and shipping address saved:", updatedOrder);

      // 6. Send a receipt email
      const productItems = order.productItems.map((item: any) => {
        if (typeof item.product === 'string') {
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
      }).filter((item: { product: null; }) => item.product !== null);
      
      try {
        await resend.emails.send({
          from: "ESÜ TEAM <info@esustore.com>",
          to: [user.email],
          subject: "Thanks for your order! Here’s your receipt.",
          html: ReceiptEmailHtml({
            date: new Date(),
            email: user.email,
            orderId: orderId,
            products: productItems,
          }),
        });

        console.log("Receipt email sent successfully.");

        // Respond with success
        return res.status(200).json({ message: "Order updated, inventory deducted, and email sent." });
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

        console.log(`Inventory for product ${productId} updated to ${updatedInventory}`);
      }
    }

    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order or inventory: ${error}`);
    throw error;
  }
};
