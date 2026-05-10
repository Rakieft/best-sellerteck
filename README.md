# Best SellerTeck

Backend foundation for a premium Haitian electronics e-commerce platform built with Node.js, Express, and MySQL.

## Current scope

This first delivery includes only the professional backend foundation and the overall project structure. The frontend folders are present as placeholders for the next phase.

## Project structure

```text
best-sellerteck/
+-- backend/
¦   +-- src/
¦       +-- app.js
¦       +-- server.js
¦       +-- config/
¦       +-- controllers/
¦       +-- database/
¦       +-- middlewares/
¦       +-- models/
¦       +-- routes/
¦       +-- services/
¦       +-- utils/
¦       +-- validations/
+-- database/
¦   +-- schema.sql
¦   +-- seed.sql
+-- frontend/
+-- public/
+-- uploads/
+-- .env.example
+-- .gitignore
+-- package.json
```

## Features included in the backend

- JWT-based authentication
- Password hashing with bcryptjs
- Forgot/reset password flow scaffold
- Role-based authorization for `client` and `admin`
- Product, category, cart, review, order, payment, and admin routes
- MySQL schema with relations, foreign keys, and indexes
- Security middleware with `helmet`, `cors`, `hpp`, `compression`, and rate limiting
- Payment provider abstraction ready for MonCash, NatCash, PayPal, and card integrations
- Seed data for initial categories, product, and admin account

## Main API routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:token`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/categories`
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `POST /api/v1/reviews`
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/orders`

## Installation

1. Copy `.env.example` to `.env` and update your environment variables.
2. Install dependencies with `npm install`.
3. Create the database schema with `npm run db:schema` or import `database/schema.sql` manually.
4. Seed initial data with `npm run db:seed` or import `database/seed.sql` manually.
5. Start the server with `npm run dev`.

## Default seeded admin

- Email: `admin@best-sellerteck.ht`
- Password: `Admin123!`

## Notes

- Payment APIs are scaffolded but not yet connected to live providers.
- Upload handling is prepared structurally, but media workflows will be implemented in the next phase.
- The frontend, dashboard UI, and storefront UI are intentionally deferred for now.
