# ESÜ Store - E-commerce Platform

Welcome to the **ESÜ Store** repository! This is a modern, high-performance, full-stack e-commerce platform built using the latest web development technologies. It provides a seamless shopping experience with a focus on premium jewelry, clothing, and accessories.

## 🚀 Features
Here are the key features of the ESÜ Store application:

- [x] **User Authentication**: Secure login and registration for users with session management.
- [x] **Product Listings**: Showcase a range of products, including images, descriptions, prices, and categories.
- [x] **Dynamic Search**: Users can search for products by name, category, and other filters.
- [x] **Shopping Cart**: Users can add items to the cart, modify quantities, and view the total.
- [x] **Checkout Process**: Supports checkout with options for cash on delivery (COD) or card payments via Stripe.
- [x] **Promo Codes**: Apply promotional codes for discounts at checkout.
- [x] **Order Tracking**: Customers can track their order statuses (Pending, Processing, Shipped, Delivered).
- [x] **Payment Integration**: Secure payments through Stripe for credit card transactions.
- [x] **Admin Panel**: Manage products, orders, and customers via a custom-built admin interface.
- [x] **Responsive Design**: Fully optimized for desktop, tablet, and mobile views.
- [x] **SEO Friendly**: Includes metadata, OpenGraph tags, and Twitter card support for social media sharing.
- [x] **Facebook Pixel Integration**: Tracks page views and conversions for Facebook ads.

## 🛠️ Technologies Used

### **Next.js 14**
Next.js powers the frontend of the application, offering server-side rendering (SSR), static site generation (SSG), and an app directory-based routing system for scalability and performance.

### **TypeScript**
TypeScript enhances the development experience with type checking, helping reduce errors and improve code quality.

### **tRPC**
We leverage tRPC to create typesafe APIs with minimal boilerplate, simplifying the integration between the client and server.

### **Stripe**
Stripe is integrated for handling secure online payments, both for credit card transactions and for managing subscriptions and invoices.

### **TailwindCSS**
TailwindCSS is used to rapidly design modern, responsive UIs. It helps maintain a consistent design language across the app without writing custom CSS.

### **Shadcn**
Shadcn provides a set of pre-built, accessible components for the user interface. It ensures components are fully customizable while maintaining accessibility best practices.

### **Cloudinary**
Cloudinary is used for image hosting and optimization. All product images are served via Cloudinary, ensuring fast loading times and image transformations (resizing, compression, etc.).

### **Sonner**
Sonner is used for managing toasts and notifications, ensuring a smooth UX experience by providing user feedback during actions such as form submissions, checkout processes, and error handling.

### **Lucide Icons**
Lucide is used for iconography, adding clear, scalable vector icons to the UI for a modern and clean look.

### **Resend API**
Emails such as order confirmations and invoices are sent using Resend API, ensuring reliable and trackable email delivery.

## 💻 Getting Started

### Prerequisites
- Node.js (>= 16.x)
- npm or Yarn

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/esu-store.git
   cd esu-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add the required environment variables:
   ```
   NEXT_PUBLIC_SERVER_URL=https://your-server-url
   STRIPE_SECRET_KEY=your-stripe-secret-key
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   NEXT_PUBLIC_FB_PIXEL_ID=your-facebook-pixel-id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Stripe Setup
To integrate Stripe for payments:
1. Sign up for a Stripe account.
2. Add your Stripe secret key to the `.env.local` file.
3. Ensure you have webhooks set up in your Stripe dashboard to handle payment events.

### Facebook Pixel Setup
To track page views and conversions with Facebook Pixel:
1. Set up a Facebook Pixel in your Facebook Ads Manager.
2. Add the `NEXT_PUBLIC_FB_PIXEL_ID` to your `.env.local`.

## 📂 Folder Structure

```
/src
  /app                 - Next.js app router pages
  /components          - Reusable UI components
  /lib                 - Utility functions and configuration
  /pages               - Traditional Next.js pages (if any)
  /public              - Static files (images, icons, etc.)
  /styles              - Global and component-specific styles
  /trpc                - tRPC API routes and server-side logic
  /utils               - Utility functions like formatters, helpers, etc.
```

## ⚙️ Deployment

This application can be deployed on any platform that supports Node.js (e.g., Vercel, Netlify, or any custom server). Vercel is highly recommended for its native support for Next.js.

## 📧 Contact
For support or inquiries, please contact us at [info@esustore.com](mailto:info@esustore.com).

---

Feel free to explore, raise issues, or contribute! 