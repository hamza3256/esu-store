import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { getPayloadClient } from "@/get-payload";
import { Order } from "@/lib/types";

interface ShippingAddressType {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ProductItem {
  quantity: number;
  product: {
    name: string;
    price: number;
    discountedPrice?: number
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

  // Colors
  const primaryColor = [0.1, 0.1, 0.1] as [number, number, number];
  const secondaryColor = [0.4, 0.4, 0.4] as [number, number, number];
  const accentColor = [0.8, 0.6, 0.2] as [number, number, number];
  const backgroundColor = [0.98, 0.98, 0.98] as [number, number, number];

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
    y: height - 100,
    width: logoWidth,
    height: logoHeight,
  });

  // Company Info
  drawText(page, "ESU STORE LLC", 50, height - 130, helveticaBold, 16, primaryColor);
  drawText(page, "7901 4TH ST N # 16774", 50, height - 150, helvetica, 10, secondaryColor);
  drawText(page, "ST PETERSBURG FL 33702-4305", 50, height - 165, helvetica, 10, secondaryColor);
  drawText(page, "Phone: (800) 123-4567", 50, height - 180, helvetica, 10, secondaryColor);
  drawText(page, "Email: info@esustore.com", 50, height - 195, helvetica, 10, secondaryColor);
  drawText(page, "Website: www.esustore.com", 50, height - 210, helvetica, 10, secondaryColor);

  // Invoice Title and Number
  drawText(page, "INVOICE", width - 200, height - 50, helveticaBold, 28, accentColor);
  drawText(page, `#${order.orderNumber}`, width - 200, height - 80, helveticaBold, 14, primaryColor);

  // Customer Info
  const shippingAddress = order.shippingAddress as ShippingAddressType;
  drawText(page, "Bill To:", 50, height - 250, helveticaBold, 12, primaryColor);
  drawText(page, shippingAddress.line1, 50, height - 270, helvetica, 10, secondaryColor);
  if (shippingAddress.line2) {
    drawText(page, shippingAddress.line2, 50, height - 285, helvetica, 10, secondaryColor);
  }
  drawText(page, `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`, 50, height - 300, helvetica, 10, secondaryColor);
  drawText(page, shippingAddress.country, 50, height - 315, helvetica, 10, secondaryColor);

  // Order Details
  drawText(page, "Order Date:", width - 210, height - 250, helveticaBold, 10, primaryColor);
  drawText(page, new Date(order.createdAt as string).toLocaleDateString(), width - 120, height - 250, helvetica, 10, secondaryColor);

  drawText(page, "Payment Status:", width - 210, height - 270, helveticaBold, 10, primaryColor);
  drawText(page, order._isPaid ? "Paid" : "Unpaid", width - 120, height - 270, helvetica, 10, order._isPaid ? [0, 0.5, 0] : [0.8, 0, 0]);

  drawText(page, "Payment Method:", width - 210, height - 290, helveticaBold, 10, primaryColor);
  drawText(page, "Credit Card", width - 120, height - 290, helvetica, 10, secondaryColor);

  // Table Headers
  const tableTop = height - 350;
  const tableHeaders = ["Item", "SKU", "Quantity", "Unit Price", "Total"];
  const columnWidths = [200, 100, 80, 80, 80];
  
  // Table background
  page.drawRectangle({
    x: 40,
    y: tableTop - 10,
    width: width - 80,
    height: 30,
    color: rgb(...accentColor),
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
    const productPrice = item.product.discountedPrice ?? item.product.price

    drawText(page, item.product.name, 50, yPos, helvetica, 10, secondaryColor);
    drawText(page, generateSKU(), 250, yPos, helvetica, 10, secondaryColor);
    drawText(page, item.quantity.toString(), 350, yPos, helvetica, 10, secondaryColor);
    drawText(page, `$${productPrice.toFixed(2)}`, 430, yPos, helvetica, 10, secondaryColor);
    drawText(page, `$${(productPrice * item.quantity).toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);
    yPos -= 20;
  });

  // Total
  const subtotal = orderProductItems.reduce((acc, item) => acc + item.quantity * (item.product.discountedPrice 
    ?? item.product.price), 0);
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const shipping = 10; // Flat rate shipping
  const total = subtotal + tax + shipping;

  yPos -= 20;
  drawLine(page, 50, yPos, width - 50, yPos, 1, secondaryColor);
  
  yPos -= 20;
  drawText(page, "Subtotal:", 400, yPos, helveticaBold, 10, primaryColor);
  drawText(page, `$${subtotal.toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);

  yPos -= 20;
  drawText(page, "Tax (8%):", 400, yPos, helveticaBold, 10, primaryColor);
  drawText(page, `$${tax.toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);

  yPos -= 20;
  drawText(page, "Shipping:", 400, yPos, helveticaBold, 10, primaryColor);
  drawText(page, `$${shipping.toFixed(2)}`, 510, yPos, helvetica, 10, secondaryColor);

  yPos -= 25;
  page.drawRectangle({
    x: 390,
    y: yPos - 5,
    width: 170,
    height: 25,
    color: rgb(...accentColor),
  });
  drawText(page, "Total:", 400, yPos, helveticaBold, 14, [1, 1, 1]);
  drawText(page, `$${total.toFixed(2)}`, 510, yPos, helveticaBold, 14, [1, 1, 1]);

  // Footer
  const footerText = "Thank you for your business!";
  const footerTextWidth = helvetica.widthOfTextAtSize(footerText, 10);
  drawText(page, footerText, (width - footerTextWidth) / 2, 70, helveticaBold, 10, accentColor);

  drawText(page, "Terms & Conditions", 50, 50, helveticaBold, 8, primaryColor);
  drawText(page, "If you have any questions about this invoice, please contact our customer service.", 50, 30, timesRoman, 8, secondaryColor);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};