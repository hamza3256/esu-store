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
  const body = webhookRequest.rawBody; // Raw body for webhook validation
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
    console.error(`Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return res.status(400).send({ error: `Webhook Error: ${err.message}` });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 2. Ensure metadata contains necessary information
  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    console.error("No userId or orderId in Stripe metadata.");
    return res.status(400).send({
      error: "Webhook Error: No userId or orderId in metadata.",
    });
  }

  console.log(`Webhook event type: ${event.type}`); // Log the event type

  // 3. Handle checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");

    const payload = await getPayloadClient();

    try {
      // 4. Fetch the user by ID
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

      // 5. Fetch the order by ID
      const { docs: orders } = await payload.find({
        collection: "orders",
        depth: 2, // Fetch relationships deeply (for products, etc.)
        where: {
          id: {
            equals: session.metadata.orderId,
          },
        },
      });

      const [order] = orders;
      if (!order) {
        console.error(`Order not found for ID: ${session.metadata.orderId}`);
        return res.status(404).json({ error: "Order not found." });
      }

      console.log("Order found, updating payment status...");

      // 6. Update the order's _isPaid status to true
      const updatedOrder = await payload.update({
        collection: "orders",
        id: session.metadata.orderId, // Use `id` instead of `where` for single order
        data: {
          _isPaid: true,
        },
      });

      console.log("Order payment status updated:", updatedOrder);

      // Deduct product inventory and send email (rest of your code...)
      const productItems = order.productItems.map((item: any) => {
        const product =
          typeof item.product === "string" ? item.product : item.product;

        return {
          product: product as Product,
          quantity: item.quantity as number,
        };
      }).filter(Boolean); // Remove null values

      // 7. Send receipt email to the user
      try {
        await resend.emails.send({
          from: "ESÜ TEAM <info@esustore.com>",
          to: [user.email],
          subject: "Thanks for your order! Here’s your receipt.",
          html: ReceiptEmailHtml({
            date: new Date(),
            email: user.email,
            orderId: session.metadata.orderId,
            products: productItems,
          }),
        });

        console.log("Receipt email sent successfully.");

        // 8. Respond with success after sending email
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

  // Respond with 200 OK if event type isn't relevant to us
  return res.status(200).send();
};
