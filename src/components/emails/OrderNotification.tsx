import { FREE_SHIPPING_THRESHOLD } from "../../lib/config";
import { formatPrice } from "../../lib/utils";
import { Media, Product } from "../../payload-types";
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  render,
} from "@react-email/components";
import { format } from "date-fns";
import * as React from "react";

interface OrderNotificationProps {
  customerEmail: string;
  customerName: string;
  date: Date;
  orderId: string;
  products: Array<{ product: Product; quantity: number }>;
  orderNumber: string;
  shippingFee: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  trackingNumber?: string;
  promoCode?: string; 
  discountPercentage?: number
}

export const OrderNotification = ({
  customerEmail,
  customerName,
  date,
  orderId,
  products,
  orderNumber,
  shippingFee,
  total,
  shippingAddress,
  trackingNumber,
  promoCode, // Adding promoCode to the props
  discountPercentage, // Adding discountPercentage to the props
}: OrderNotificationProps) => {

  // Calculate the original subtotal
  const subtotal = products.reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  );

  // Apply discount if promo code is used
  const discount = discountPercentage ? (subtotal * discountPercentage) / 100 : 0;
  const discountedTotal = subtotal - discount;

  // Calculate total including shipping fee
  const finalTotal = discountedTotal >= FREE_SHIPPING_THRESHOLD ? discountedTotal : discountedTotal + shippingFee;

  const trackingLink = trackingNumber
    ? `https://www.trackingmore.com/track/en/${trackingNumber}?express=postex`
    : null;

  return (
    <Html>
      <Head />
      <Preview>New Order Notification</Preview>

      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section>
            <Column>
              <Img
                src={`https://esu.london/esu-transparent.png`}
                height="100"
                alt="ESU BEAR"
              />
            </Column>

            <Column align="right" style={tableCell}>
              <Text style={heading}>New Order Notification</Text>
            </Column>
          </Section>

          {/* Customer & Order Info */}
          <Section style={informationTable}>
            <Row style={informationTableRow}>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>CUSTOMER EMAIL</Text>
                <Link
                  href={`mailto:${customerEmail}`}
                  style={informationTableValue}
                >
                  {customerEmail}
                </Link>
              </Column>

              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>CUSTOMER NAME</Text>
                <Text style={informationTableValue}>{customerName}</Text>
              </Column>

              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>INVOICE DATE</Text>
                <Text style={informationTableValue}>
                  {format(date, "dd MMM yyyy")}
                </Text>
              </Column>

              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>ORDER NUMBER</Text>
                <Text style={informationTableValue}>{orderNumber}</Text>
              </Column>
            </Row>

            {/* Tracking Info */}
            {trackingLink && (
              <Row style={informationTableRow}>
                <Column style={informationTableColumn}>
                  <Text style={informationTableLabel}>TRACKING NUMBER</Text>
                  <Link href={trackingLink} style={informationTableValue}>
                    {trackingNumber}
                  </Link>
                </Column>
              </Row>
            )}

            {/* Order Confirmation Link */}
            <Row style={informationTableRow}>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>ORDER CONFIRMATION</Text>
                <Link
                  href={`${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${orderId}`}
                  style={informationTableValue}
                >
                  View Order Confirmation
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Order Summary */}
          <Section style={productTitleTable}>
            <Text style={productsTitle}>Order Summary</Text>
          </Section>

          {products.map(({ product, quantity }) => {
            const image = product.images.find(({ image }) => {
                return typeof image === "object" && image.mimeType?.startsWith("image/");
              })?.image as Media;

            return (
              <Section key={product.id}>
                <Column style={{ width: "64px" }}>
                  {image.url && (
                    <Img
                      src={image.sizes?.thumbnail?.url ?? image.url}
                      width="64"
                      height="64"
                      alt="Product Image"
                      style={productIcon}
                    />
                  )}
                </Column>
                <Column style={{ paddingLeft: "22px" }}>
                  <Text style={productTitle}>{product.name}</Text>
                  {product.description ? (
                    <Text style={productDescription}>
                      {product.description.length > 50
                        ? product.description.slice(0, 50) + "..."
                        : product.description}
                    </Text>
                  ) : null}
                </Column>

                <Column style={productPriceWrapper} align="right">
                  <Text style={productPrice}>
                    {formatPrice(product.price * quantity)}
                  </Text>
                </Column>
              </Section>
            );
          })}

          {/* Shipping Fee Section */}
          <Section>
            <Column style={{ width: "64px" }}></Column>
            <Column style={{ paddingLeft: "40px", paddingTop: 20 }}>
              <Text style={productTitle}>Shipping Fee</Text>
            </Column>

            <Column style={productPriceWrapper} align="right">
              <Text style={productPrice}>
                {discountedTotal >= FREE_SHIPPING_THRESHOLD ? "Free" : formatPrice(shippingFee)}
              </Text>
            </Column>
          </Section>

          {/* Promo Code Section */}
          {promoCode && (
            <Section>
              <Column style={{ width: "64px" }}></Column>
              <Column style={{ paddingLeft: "40px", paddingTop: 20 }}>
                <Text style={productTitle}>Promo Code ({promoCode})</Text>
              </Column>

              <Column style={productPriceWrapper} align="right">
                <Text style={productPrice}>- {formatPrice(discount)}</Text>
              </Column>
            </Section>
          )}

          {/* Total Section */}
          <Hr style={productPriceLine} />
          <Section align="right">
            <Column style={tableCell} align="right">
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>{formatPrice(finalTotal)}</Text>
            </Column>
          </Section>
          <Hr style={productPriceLineBottom} />

          {/* Shipping Address Section */}
          <Section>
            <Text style={productsTitle}>Shipping Address</Text>
            <Text style={informationTableValue}>{shippingAddress.line1}</Text>
            {shippingAddress.line2 && (
              <Text style={informationTableValue}>
                {shippingAddress.line2}
              </Text>
            )}
            <Text style={informationTableValue}>
              {shippingAddress.city}, {shippingAddress.state || ""}{" "}
              {shippingAddress.postalCode || ""}
            </Text>
            <Text style={informationTableValue}>{shippingAddress.country}</Text>
          </Section>

          {/* Footer */}
          <Text style={footerCopyright}>
            Copyright © 2024 ESÜ STORE LLC <br />{" "}
            <Link href="#">All rights reserved</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const OrderNotificationHtml = (props: OrderNotificationProps) =>
  render(<OrderNotification {...props} />, { pretty: true });

/* Email Styles */

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: "#ffffff",
};

const resetText = {
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "660px",
};

const tableCell = { display: "table-cell" };

const heading = {
  fontSize: "28px",
  fontWeight: "300",
  color: "#888888",
};

const informationTable = {
  borderCollapse: "collapse" as const,
  borderSpacing: "0px",
  color: "rgb(51,51,51)",
  backgroundColor: "rgb(250,250,250)",
  borderRadius: "3px",
  fontSize: "12px",
  marginTop: "12px",
};

const informationTableRow = {
  height: "46px",
};

const informationTableColumn = {
  paddingLeft: "20px",
  borderStyle: "solid",
  borderColor: "white",
  borderWidth: "0px 1px 1px 0px",
  height: "44px",
};

const informationTableLabel = {
  ...resetText,
  color: "rgb(102,102,102)",
  fontSize: "10px",
};

const informationTableValue = {
  fontSize: "12px",
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: "30px 0 15px 0",
  height: "24px",
};

const productsTitle = {
  background: "#fafafa",
  paddingLeft: "10px",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const productIcon = {
  margin: "0 0 0 20px",
  borderRadius: "14px",
  border: "1px solid rgba(128,128,128,0.2)",
};

const productTitle = {
  fontSize: "12px",
  fontWeight: "600",
  ...resetText,
};

const productDescription = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  ...resetText,
};

const productPriceTotal = {
  margin: "0",
  color: "rgb(102,102,102)",
  fontSize: "10px",
  fontWeight: "600",
  padding: "0px 30px 0px 0px",
  textAlign: "right" as const,
};

const productPrice = {
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const productPriceLarge = {
  margin: "0px 20px 0px 0px",
  fontSize: "16px",
  fontWeight: "600",
  whiteSpace: "nowrap" as const,
  textAlign: "right" as const,
};

const productPriceWrapper = {
  display: "table-cell",
  padding: "0px 20px 0px 0px",
  width: "100px",
  verticalAlign: "top",
};

const productPriceLine = { margin: "30px 0 0 0" };

const productPriceVerticalLine = {
  height: "48px",
  borderLeft: "1px solid",
  borderColor: "rgb(238,238,238)",
};

const productPriceLargeWrapper = {
  display: "table-cell",
  width: "90px",
};

const productPriceLineBottom = { margin: "0 0 75px 0" };

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};
