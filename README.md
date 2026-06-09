# ShopHub E-Commerce Platform

This repository now contains the complete working e-commerce platform inside the `ecommerce-complete/` folder.

## Run the working app

1. Change into the app folder:
   ```bash
   cd ecommerce-complete
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the platform with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. Open in browser:
   - Customer site: http://localhost:3000
   - Admin dashboard: http://localhost:3001
   - Backend health: http://localhost:5000/health

## Folder structure

- `ecommerce-complete/`
  - `amazon-customer-website/` – Customer storefront
  - `admin-seller-dashboard/` – Admin panel
  - `backend-api/` – Express API backend
  - `docker-compose.yml` – Local dev container setup
  - `.env.example` – Environment template

## Notes

- The old root frontend/backend files have been cleaned up.
- Use `ecommerce-complete/` as the main project folder.
