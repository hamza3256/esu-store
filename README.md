# ESÜ Store - E-commerce Platform

Welcome to the **ESÜ Store** repository! This is a modern, high-performance, full-stack e-commerce platform built using the latest web development technologies. It provides a seamless shopping experience with a focus on premium jewelry, clothing, and accessories.

## 🚀 Features
Here are the key features of the ESÜ Store application:

- [x] **User Authentication**: Secure login and registration with session management
- [x] **Product Management**: Full CRUD operations for products with rich media support
- [x] **Dynamic Search**: Advanced product search and filtering capabilities
- [x] **Shopping Cart**: Real-time cart management with Zustand state management
- [x] **Secure Payments**: Stripe integration for secure payment processing
- [x] **Order Management**: Complete order lifecycle tracking
- [x] **Admin Dashboard**: Comprehensive admin interface using Payload CMS
- [x] **Email Notifications**: Automated emails via Resend API
- [x] **Image Optimization**: Cloudinary integration for media management
- [x] **Responsive Design**: Mobile-first approach using Tailwind CSS
- [x] **SEO Optimization**: Built-in SEO features with next-sitemap
- [x] **Real-time Updates**: Live notifications using Sonner
- [x] **Type Safety**: End-to-end type safety with tRPC and TypeScript

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/ui**: Accessible component system
- **Zustand**: State management
- **React Hook Form**: Form handling with Zod validation
- **Embla Carousel**: Modern carousel/slider
- **Framer Motion**: Animations
- **SWR**: Data fetching
- **Sonner**: Toast notifications

### Backend
- **Payload CMS**: Headless CMS and Admin dashboard
- **MongoDB**: Database (via @payloadcms/db-mongodb)
- **tRPC**: End-to-end typesafe API
- **Express**: Server framework
- **Stripe**: Payment processing
- **Resend**: Email service
- **Cloudinary**: Media management

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nodemon**: Development server
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## 💻 Getting Started

### Prerequisites
- Node.js (>= 18.x)
- Yarn package manager
- MongoDB instance
- Stripe account
- Cloudinary account
- Resend API account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/esu-store.git
   cd esu-store
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables in `.env`:
   ```env
   # App
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   
   # Database
   MONGODB_URL=your_mongodb_url
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Resend
   RESEND_API_KEY=your_resend_api_key
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Generate Payload types (when collections change):
   ```bash
   yarn generate:types
   ```

### Production Build

1. Build the application:
   ```bash
   yarn build
   ```

2. Start production server:
   ```bash
   yarn start
   ```

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## 📂 Project Structure

```
/src
  /app                 - Next.js app router pages
  /collections         - Payload CMS collections
  /components         - React components
  /config             - Configuration files
  /hooks              - Custom React hooks
  /lib                - Utility functions
  /product_files      - Product-related files
  /trpc               - tRPC router and procedures
  middleware.ts       - Next.js middleware
  payload.config.ts   - Payload CMS configuration
  server.ts           - Express server setup
```

## 🔧 Available Scripts

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn generate:types`: Generate Payload types
- `yarn lint`: Run ESLint
- `yarn postbuild`: Generate sitemap

## 📦 Key Dependencies

- Next.js 14.1.3
- React 18.x
- Payload CMS 2.11.2
- TypeScript 5.x
- Tailwind CSS 3.3.0
- Stripe 14.23.0
- tRPC 10.45.2

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📧 Support

For support or inquiries, please contact us at [info@esustore.com](mailto:info@esustore.com)

---

Built with ❤️ using Next.js, Payload CMS, and TypeScript 