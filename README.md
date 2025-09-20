# Sendify System

Sendify is a shipment and customer management platform for merchants and admins. It provides:

- Shipment creation, tracking, and label generation (PDF with QR code)
- Customer management with global scoring and history
- Admin dashboard for global shipment/customer management
- RESTful API backend (Laravel) and React frontend

## Features

- User authentication (merchants, admins)
- Create, view, and manage shipments
- Print shipment labels (PDF, QR code)
- Track shipments publicly
- Add, edit, and delete customers
- Global customer scoring (by phone/name)
- Admin: view and manage all shipments/customers

## Tech Stack

- Backend: Laravel (PHP)
- Frontend: React (Vite)
- PDF: dompdf
- Database: MySQL

## Setup

1. Clone the repo
2. Install backend dependencies:
   ```
   cd sendify/backend
   composer install
   cp .env.example .env
   php artisan key:generate
   # Set DB credentials in .env
   php artisan migrate --seed
   ```
3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   npm run dev
   ```
4. Access the app at http://localhost:5173 (frontend) and http://localhost:8000 (API)

## Development

- Backend code: `sendify/backend`
- Frontend code: `sendify/frontend`
- Plugins: `aramex/`, `marketplace/`, etc.

## License

MIT
