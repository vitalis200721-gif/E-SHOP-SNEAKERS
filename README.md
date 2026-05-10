# SOLEVAULT - Premium Sneaker Store

A fully functional modern e-commerce web application built with Next.js, Express, MongoDB, and Stripe.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Auth:** Google OAuth 2.0 (Passport.js)
- **Payments:** Stripe Checkout

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd etest
```

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   SESSION_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   STRIPE_SECRET_KEY=your_key
   CLIENT_URL=http://localhost:3000
   ```
4. Seed the database:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features
- **Modern UI:** Minimalist design inspired by Nike and Apple.
- **AI Recommendations:** Product suggestions based on user browsing.
- **Fully Responsive:** Optimized for all screen sizes.
- **Admin Panel:** Basic dashboard for inventory management.
- **Secure Payments:** Integrated with Stripe.

## Project Structure
- `/client`: Next.js application (App Router)
- `/server`: Express API and Database models
