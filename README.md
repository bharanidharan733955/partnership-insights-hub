# Partnership Analytics System - Enterprise Hub

An industry-grade, production-ready SaaS application for organizations to monitor and analyze partnership performance with a unified full-stack architecture.

## 🚀 Unified Architecture

- **Root Frontend**: React 18, Vite, TypeScript, TailwindCSS, shadcn/ui.
- **Backend Service**: Node.js/Express (located in `/server`).
- **Data Layer**: Mock Prisma repository (extensible to MongoDB/SQL).
- **Design System**: High-contrast enterprise theme with premium analytics.

## 🛠️ Quick Start

### 1. External Dependencies
Ensure Node.js (v18+) is installed.

### 2. Startup Sequence
The system uses a consolidated root for the frontend and a dedicated server folder for the backend.

**Start Backend (Port 5000):**
```bash
cd server
npm install
npm run dev
```

**Start Frontend (Port 8080):**
```bash
# From the project root
npm install
npm run dev
```

### 3. Accessing the System
- **Web App**: [http://localhost:8080](http://localhost:8080)
- **API Status**: [http://localhost:5000/health](http://localhost:5000/health)

## 🔐 Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Global Analyst** | `analyst@enterprise.com` | `password123` |
| **Partner Manager** | `manager1@techsolutions.com` | `password123` |

## ✨ Key Features
- **High-End Analytics**: Area charts and bar comparisons using Recharts.
- **RBAC Security**: Role-based access control for Analysts vs Partners.
- **Daily Sales Ledger**: Streamlined data entry with instant history reconciliation.
- **Data Portability**: One-click CSV export for offline reporting.
