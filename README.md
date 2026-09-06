# Gram2City

Modern logistics and delivery platform frontend built with Next.js, React, and TypeScript.

Gram2City provides a web-based experience for managing users, parcels, riders, finance, support, and administrative operations through a structured dashboard-driven interface.

## Overview

This repository contains the frontend application for the Gram2City platform.

The application is built with the Next.js App Router and uses a modular architecture with authentication, dashboards, API integration, state management, real-time communication, maps, payments, and reusable UI components.

## Features

* Responsive web application
* Authentication and protected routes
* User dashboard
* Administrative dashboard
* Parcel and delivery management
* Rider-related functionality
* Finance-related functionality
* Support functionality
* Real-time communication
* Interactive maps and location-based features
* Payment integration
* Form validation
* Data visualization
* Loading and error states
* Reusable component architecture
* API integration with the Gram2City backend
* Responsive layouts for desktop, tablet, and mobile

## Technology Stack

### Core

* Next.js
* React
* TypeScript
* Tailwind CSS

### State & Data Management

* TanStack React Query
* Zustand
* Axios

### Authentication & Services

* Firebase
* Firebase Authentication
* Stripe

### Real-Time & Maps

* Socket.IO Client
* Leaflet
* React Leaflet

### Forms & Validation

* React Hook Form
* Zod

### UI & Experience

* Radix UI
* Framer Motion
* Swiper
* Recharts
* Sonner
* React Hot Toast
* SweetAlert2
* Lucide React
* React Icons

### Development & Code Quality

* ESLint
* Prettier
* Husky
* lint-staged

## Application Architecture

```text
                         Gram2City
                             │
                     Next.js Frontend
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     Authentication      Dashboard          Public Pages
          │                  │                  │
       Firebase       ┌──────┼──────┐           │
                      │      │      │           │
                    User   Admin   Other     Marketing
                    Area   Area   Modules      Pages
                      │      │      │
                      └──────┼──────┘
                             │
                        API Layer
                             │
                             ▼
                    Gram2City Backend
```

## Project Structure

```text
gram2city/
├── public/
├── src/
│   ├── api/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (public)/
│   │   ├── dashboard/
│   │   ├── Providers.tsx
│   │   ├── AuthInitializer.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── store/
│   ├── types.ts
│   └── global.d.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Main Application Areas

The application is organized around several major areas:

### Public Area

Public-facing pages and platform information.

### Authentication

Authentication-related pages and application initialization.

Firebase is used for authentication and user identity management.

### Dashboard

Authenticated users can access dashboard functionality based on their role and permissions.

### Parcel Management

The frontend provides interfaces for parcel and delivery-related workflows.

### Rider Management

Rider-focused functionality is integrated into the application for delivery operations.

### Finance

Financial and payment-related interfaces are included for platform operations.

### Support

Support-related functionality is available for handling platform communication and assistance.

### Administration

Administrative functionality is organized separately within the dashboard.

## Environment Variables

Create an environment file based on the variables required by the application.

Example:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Use the actual environment variable names defined by the project configuration.

Never commit production credentials, API keys, service-account files, or other secrets.

## Getting Started

### Prerequisites

* Node.js
* npm
* Git

### Clone

```bash
git clone https://github.com/mrshanshuvo/gram2city.git
cd gram2city
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at the local development URL provided by Next.js.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Backend Integration

The frontend communicates with the dedicated Gram2City backend API.

```text
gram2city
     │
     │ HTTP / API
     ▼
gram2city-backend
     │
     ├── Authentication
     ├── Users
     ├── Parcels
     ├── Riders
     ├── Finance
     ├── Support
     └── Administration
```

## Security

The application uses multiple layers of client-side and service-level security, including:

* Firebase authentication
* Protected application routes
* Environment-based configuration
* API authentication
* Form validation
* Secure handling of application configuration

Sensitive values should always be stored in environment variables.

## Code Quality

The project uses:

* ESLint for code quality
* Prettier for formatting
* Husky for Git hooks
* lint-staged for pre-commit checks

Maintaining consistent formatting and validation helps keep the codebase maintainable.

## Project Status

Active development.

## License

This project is licensed under the MIT License.

## Author

**Shahid Hasan Shuvo**

Full Stack Developer
