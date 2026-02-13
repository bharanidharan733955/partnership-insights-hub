# Partnership Analytics System - Enterprise Hub

An industry-grade, production-ready SaaS application for organizations to monitor and analyze partnership performance with a clean separation between frontend and backend.

## 🏗️ Architecture

This is a **monorepo** with separate frontend and backend applications:

```
partnership-insights-hub/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # Node.js + Express backend API
├── package.json       # Root workspace configuration
└── README.md          # This file
```

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: TailwindCSS
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors

### Backend Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB instance (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd partnership-insights-hub
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   
   Or install individually:
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

3. **Configure environment variables**
   
   **Backend** (`backend/.env`):
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and other settings
   ```
   
   **Frontend** (`frontend/.env`):
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env if needed (optional for this setup)
   ```

### Running the Application

#### Option 1: Run Both Together (Recommended for Development)
```bash
npm run dev
```
This starts both frontend (port 8080) and backend (port 5000) concurrently.

#### Option 2: Run Separately

**Start Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Start Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

### Accessing the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🔐 Default Credentials

| Role | Email | Password |
|:-----|:------|:---------|
| **Global Analyst** | analyst@enterprise.com | password123 |
| **Partner Manager** | manager1@techsolutions.com | password123 |

> **Note**: The analyst user is automatically created on first backend startup if it doesn't exist.

## 📁 Project Structure

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   │   ├── api.client.ts        # Axios instance with interceptors
│   │   ├── auth.service.ts      # Authentication services
│   │   └── partnership.service.ts # Partnership/sales services
│   ├── types/          # TypeScript type definitions
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── App.tsx         # Main app component
├── public/             # Static assets
└── package.json        # Frontend dependencies
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app configuration
│   └── index.js        # Server entry point
└── package.json        # Backend dependencies
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only
- `npm run build` - Build both projects
- `npm run install:all` - Install all dependencies
- `npm run clean` - Remove all node_modules and build files

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm test` - Run tests

## ✨ Key Features

- **Role-Based Access Control (RBAC)**: Separate dashboards for Analysts and Partners
- **Real-Time Analytics**: Interactive charts and visualizations using Recharts
- **Daily Sales Tracking**: Partners can log daily sales data
- **Performance Monitoring**: Analysts can view aggregated partnership metrics
- **Data Export**: CSV export functionality for offline reporting
- **Responsive Design**: Mobile-friendly interface
- **Type-Safe API**: Full TypeScript support with proper type definitions
- **Centralized Error Handling**: Consistent error responses across the application

## 🔧 Development

### API Service Layer

The frontend uses a centralized service layer for all API calls:

```typescript
import { authService, partnershipService } from '@/services';

// Authentication
await authService.login(email, password);
await authService.register(userData);
authService.logout();

// Sales & Partners
await partnershipService.getSalesHistory(params);
await partnershipService.submitSales(salesData);
await partnershipService.getPartners();
```

### Adding New API Endpoints

1. **Backend**: Add route in `backend/src/routes/`
2. **Backend**: Add controller in `backend/src/controllers/`
3. **Frontend**: Add method to appropriate service in `frontend/src/services/`
4. **Frontend**: Add TypeScript types in `frontend/src/types/api.types.ts`

## 🚢 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.):

```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment
The backend can be deployed to any Node.js hosting service (Heroku, Railway, DigitalOcean, etc.):

```bash
cd backend
npm start
```

**Environment Variables**: Make sure to set all required environment variables in your hosting platform.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
