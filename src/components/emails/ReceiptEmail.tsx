import { SHIPPING_FEE } from "../../lib/config";
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

interface ReceiptEmailProps {
  email: string;
  date: Date;
  orderId: string;
  products: Array<{ product: Product; quantity: number }>;
  orderNumber: string;
  shippingFee?: number;
  trackingNumber?: string;
  trackingOrderDate?: string;
  totalPrice?: number;
  promoCode?: string;  // Add promoCode as optional
  discountPercentage?: number;  // Add discountPercentage as optional
}

export const ReceiptEmail = ({
  email,
  date,
  orderId,
  products,
  orderNumber,
  shippingFee = SHIPPING_FEE,
  trackingNumber,
  trackingOrderDate,
  totalPrice,
  promoCode,
  discountPercentage = 0,  // Default to 0 if no discount
}: ReceiptEmailProps) => {
  
  // Calculate the subtotal
  const subtotal = totalPrice ?? products.reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  );

  // Calculate the discount based on promo code
  const discount = (discountPercentage / 100) * subtotal;
  const discountedTotal = subtotal - discount;

  // Final total including shipping fee
  const total = discountedTotal + shippingFee;

  // Tracking link generation
  const trackingLink = trackingNumber
    ? `https://www.trackingmore.com/track/en/${trackingNumber}?express=postex`
    : null;

  return (
    <Html>
      <Head />
      <Preview>Your ESÜ Shopping Receipt</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section>
            <Column>
              <Img
                src={`https://esu.london/esu-transparent.png`}
                height="100"
                alt="ESU BEAR"
              />
            </Column>

            <Column align="right" style={tableCell}>
              <Text style={heading}>Receipt</Text>
            </Column>
          </Section>

          {/* Order Info */}
          <Section style={informationTable}>
            <Row style={informationTableRow}>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>EMAIL</Text>
                <Link style={informationTableValue}>{email}</Link>
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
                {trackingOrderDate && (
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>TRACKING DATE</Text>
                    <Text style={informationTableValue}>
                      {format(new Date(trackingOrderDate), "dd MMM yyyy")}
                    </Text>
                  </Column>
                )}
              </Row>
            )}
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
                  {image?.url && (
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
                  {product.description && (
                    <Text style={productDescription}>
                      {product.description.length > 50
                        ? product.description.slice(0, 50) + "..."
                        : product.description}
                    </Text>
                  )}
                  <Link
                    href={`${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${orderId}`}
                    style={productLink}
                  >
                    Download Invoice
                  </Link>
                </Column>

                <Column style={productPriceWrapper} align="right">
                  <Text style={productPrice}>
                    {formatPrice(product.price * quantity)}
                  </Text>
                </Column>
              </Section>
            );
          })}

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

          {/* Shipping Fee */}
          <Section>
            <Column style={{ width: "64px" }}></Column>
            <Column style={{ paddingLeft: "40px", paddingTop: 20 }}>
              <Text style={productTitle}>Shipping Fee</Text>
            </Column>

            <Column style={productPriceWrapper} align="right">
              <Text style={productPrice}>
                {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
              </Text>
            </Column>
          </Section>

          {/* Total Section */}
          <Hr style={productPriceLine} />
          <Section align="right">
            <Column style={tableCell} align="right">
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>{formatPrice(total)}</Text>
            </Column>
          </Section>
          <Hr style={productPriceLineBottom} />

          {/* Footer */}
          <Text style={footerLinksWrapper}>
            <Link href={`${process.env.NEXT_PUBLIC_SERVER_URL}/about`}>Company</Link>{" "}
            •{" "}
            <Link href={`${process.env.NEXT_PUBLIC_SERVER_URL}/help-center`}>
              Help Center
            </Link>{" "}
            •{" "}
            <Link href={`${process.env.NEXT_PUBLIC_SERVER_URL}/privacy-policy`}>
              Privacy Policy
            </Link>
          </Text>
          <Text style={footerCopyright}>
            Copyright © 2024 ESÜ STORE LLC <br />{" "}
            <Link href="#">All rights reserved</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const ReceiptEmailHtml = (props: ReceiptEmailProps) =>
  render(<ReceiptEmail {...props} />, { pretty: true });

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

const productLink = {
  fontSize: "12px",
  color: "rgb(0,112,201)",
  textDecoration: "none",
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

const footerLinksWrapper = {
  margin: "8px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};
