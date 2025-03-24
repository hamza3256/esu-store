import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { getPayloadClient } from "@/get-payload";
import { Order, PromoCode } from "@/lib/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "./config";

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

interface ProductItem {
  quantity: number;
  product: {
    name: string;
    price: number;
    discountedPrice?: number;
  };
}

const drawText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: [number, number, number]
) => {
  page.drawText(text, { x, y, font, size, color: rgb(...color) });
};

const drawLine = (
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  thickness: number,
  color: [number, number, number]
) => {
  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    thickness,
    color: rgb(...color),
  });
};

const generateSKU = () => {
  const timestamp = Date.now().toString();
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `S-2410${timestamp.slice(-3)}-${randomPart}`;
};

export const generateInvoice = async (orderId: string, logoUrl?: string): Promise<Uint8Array> => {
  const payload = await getPayloadClient();
  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: { id: { equals: orderId } },
  });

  const order = orders[0] as Order;
  if (!order) throw new Error("Order not found");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();

  // Fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Colors (Updated to black theme)
  const primaryColor = [0, 0, 0] as [number, number, number]; // Black
  const secondaryColor = [0.3, 0.3, 0.3] as [number, number, number]; // Dark Gray
  const accentColor = [0.7, 0.7, 0.7] as [number, number, number]; // Light Gray
  const backgroundColor = [1, 1, 1] as [number, number, number]; // White

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: rgb(...backgroundColor),
  });

  // Logo
  const logoBytes = await fetch(logoUrl || `/esu.png`).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoAspectRatio = 563 / 307;
  const logoWidth = 120;
  const logoHeight = logoWidth / logoAspectRatio;
  page.drawImage(logoImage, {
    x: 50,
    y: height - 85,
    width: logoWidth,
    height: logoHeight,
  });

  // Company Info
  drawText(page, "ESU STORE LLC", 50, height - 115, helveticaBold, 16, primaryColor);
  drawText(page, "7901 4TH ST N # 16774", 50, height - 135, helvetica, 10, secondaryColor);
  drawText(page, "ST PETERSBURG FL 33702-4305", 50, height - 150, helvetica, 10, secondaryColor);
  drawText(page, "Phone: +1 (727) 405-6739", 50, height - 165, helvetica, 10, secondaryColor);
  drawText(page, "Email: info@esustore.com", 50, height - 180, helvetica, 10, secondaryColor);
  drawText(page, "Website: www.esustore.com", 50, height - 195, helvetica, 10, secondaryColor);

  // Invoice Title and Number
  drawText(page, "INVOICE", width - 200, height - 50, helveticaBold, 28, primaryColor);
  drawText(page, `#${order.orderNumber}`, width - 200, height - 80, helveticaBold, 14, secondaryColor);

  // Customer Info
  const shippingAddress = order.shippingAddress as ShippingAddressType;
  const userDetail = order.name ? order.name : order.email;
  let line2 = 0;
  drawText(page, "Bill To:", 50, height - 215, helveticaBold, 12, primaryColor);
  drawText(page, userDetail, 50, height - 235, helvetica, 10, secondaryColor);
  drawText(page, shippingAddress.line1, 50, height - 250, helvetica, 10, secondaryColor);
  if (shippingAddress.line2) {
    line2 = 15;
    drawText(page, shippingAddress.line2, 50, height - 265 - line2, helvetica, 10, secondaryColor);
  }
  const addressLine = `${shippingAddress.city}, ${
    shippingAddress.state ? shippingAddress.state + " " : ""
  }${shippingAddress.postalCode ? shippingAddress.postalCode : ""}`;
  drawText(page, addressLine, 50, height - 265 - line2, helvetica, 10, secondaryColor);
  drawText(page, (shippingAddress.country === 'PK' ? 'Pakistan' : shippingAddress.country) , 50, height - 280 - line2, helvetica, 10, secondaryColor);
  drawText(page, order.email, 50, height - 295 - line2, helvetica, 10, secondaryColor);
  drawText(page, order.phone, 50, height - 310 - line2, helvetica, 10, secondaryColor);

  // Order Details
  drawText(page, "Order Date:", width - 210, height - 250, helveticaBold, 10, primaryColor);
  drawText(page, new Date(order.createdAt as string).toLocaleDateString(), width - 120, height - 250, helvetica, 10, secondaryColor);

  drawText(page, "Payment Status:", width - 210, height - 270, helveticaBold, 10, primaryColor);
  const paymentStatus = order.paymentType === 'cod' ? (order._isPaid ? "Paid" : "Awaiting Payment") : (order._isPaid ? "Paid" : "Unpaid");
  drawText(page, paymentStatus, width - 120, height - 270, helvetica, 10, order._isPaid ? [0, 0.5, 0] : [0.8, 0, 0]);

  drawText(page, "Payment Method:", width - 210, height - 290, helveticaBold, 10, primaryColor);
  const paymentMethod = order.paymentType === 'cod' ? "Cash on Delivery" : "Credit Card";
  drawText(page, paymentMethod, width - 120, height - 290, helvetica, 10, secondaryColor);

  drawText(page, "Tracking Number:", width - 210, height - 310, helveticaBold, 10, primaryColor);
  drawText(page, order.trackingInfo?.trackingNumber ?? "N/A", width - 120, height - 310, helvetica, 10, secondaryColor);

  // Promo Code
  if (order.appliedPromoCode) {
    drawText(page, "Promo Code:", width - 210, height - 330, helveticaBold, 10, primaryColor);
    const promoCode = order.appliedPromoCode as PromoCode;
    drawText(page, `${promoCode.code} (${promoCode.discountPercentage}% OFF)`, width - 120, height - 330, helvetica, 10, secondaryColor);
  }

  // Table Headers
  const tableTop = height - 370;
  const tableHeaders = ["Item", "SKU", "Quantity", "Unit Price (Rs)", "Total (Rs)"];
  const columnWidths = [170, 100, 80, 90, 100];
  
  // Table background
  page.drawRectangle({
    x: 40,
    y: tableTop - 10,
    width: width - 80,
    height: 30,
    color: rgb(...primaryColor),
  });

  tableHeaders.forEach((header, index) => {
    let xPos = 50;
    for (let i = 0; i < index; i++) {
      xPos += columnWidths[i];
    }
    drawText(page, header, xPos, tableTop + 5, helveticaBold, 12, [1, 1, 1]);
  });

  // Table Content
  const orderProductItems = order.productItems as ProductItem[];
  let yPos = tableTop - 25;

  orderProductItems.forEach((item, index) => {
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 40,
        y: yPos - 5,
        width: width - 80,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    const productPrice = item.product.discountedPrice ?? item.product.price;

    drawText(page, item.product.name, 50, yPos, helvetica, 10, secondaryColor);
    drawText(page, generateSKU(), 220, yPos, helvetica, 10, secondaryColor);
    drawText(page, item.quantity.toString(), 320, yPos, helvetica, 10, secondaryColor);
    drawText(page, `${productPrice.toFixed(2)}`, 400, yPos, helvetica, 10, secondaryColor);
    drawText(page, `${(productPrice * item.quantity).toFixed(2)}`, 490, yPos, helvetica, 10, secondaryColor);
    yPos -= 20;
  });

  // Total
  const subtotal = orderProductItems.reduce(
    (acc, item) => acc + item.quantity * (item.product.discountedPrice ?? item.product.price), 
    0
  );

  const discountPercentage = order.appliedPromoCode ? (order.appliedPromoCode as PromoCode).discountPercentage : 0;
  const discountAmount = subtotal * (discountPercentage / 100);
  const discountedSubtotal = subtotal - discountAmount;

  const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = discountedSubtotal + shipping;

  yPos -= 20;
  drawLine(page, 50, yPos, width - 50, yPos, 1, secondaryColor);

  yPos -= 20;
  drawText(page, "Subtotal:", 400, yPos, helveticaBold, 10, primaryColor);
  drawText(page, `Rs ${subtotal.toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);

  if (discountPercentage > 0) {
    yPos -= 20;
    drawText(page, "Discount:", 400, yPos, helveticaBold, 10, primaryColor);
    drawText(page, `- Rs ${discountAmount.toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);
  }

  const shippingText = shipping === 0 ? "Free" : `Rs ${shipping.toFixed(2)}`;
  yPos -= 20;
  drawText(page, "Shipping:", 400, yPos, helveticaBold, 10, primaryColor);
  drawText(page, shippingText, 510, yPos, helvetica, 10, secondaryColor);

  yPos -= 25;
  page.drawRectangle({
    x: 390,
    y: yPos - 5,
    width: 190,
    height: 25,
    color: rgb(...primaryColor),
  });
  drawText(page, "Total:", 400, yPos, helveticaBold, 14, [1, 1, 1]);
  drawText(page, `Rs ${total.toFixed(2)}`, 490, yPos, helveticaBold, 14, [1, 1, 1]);

  // Footer
  const footerText = "Thank you for your business!";
  const footerTextWidth = helvetica.widthOfTextAtSize(footerText, 10);
  drawText(page, footerText, (width - footerTextWidth) / 2, 70, helveticaBold, 10, primaryColor);

  drawText(page, "Terms & Conditions", 50, 50, helveticaBold, 8, primaryColor);
  drawText(page, "If you have any questions about this invoice, please contact our customer service.", 50, 30, timesRoman, 8, secondaryColor);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
