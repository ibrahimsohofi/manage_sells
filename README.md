# Quincaillerie Jamal - Sales Management System

A comprehensive sales management system for hardware stores, built with React + Vite frontend and Express.js + MySQL backend.

## 🏗️ Architecture

### Frontend
- **React 18** + **Vite** for fast development
- **TailwindCSS** for responsive styling
- **Material UI** components
- **Chart.js** for analytics
- Advanced theming system (5 color schemes + dark/light modes)

### Backend
- **Express.js** REST API
- **MySQL** database with proper relationships
- **JWT** authentication ready
- Rate limiting and security headers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- MySQL 8.0+ server

### 1. Clone & Install
```bash
git clone https://github.com/ibrahimsohofi/manage_sells.git
cd manage_sells

# Install frontend dependencies
bun install

# Install backend dependencies
cd backend
npm install
```

### 2. Setup MySQL Database

#### Option A: Docker (Recommended)
```bash
docker run --name quincaillerie-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=quincaillerie_jamal \
  -p 3306:3306 \
  -d mysql:8.0
```

#### Option B: Local MySQL
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# macOS
brew install mysql
brew services start mysql

# Create database
mysql -u root -p
CREATE DATABASE quincaillerie_jamal;
```

#### Option C: Cloud Services
- **PlanetScale**: https://planetscale.com
- **Railway**: https://railway.app
- **AWS RDS** or **Google Cloud SQL**

### 3. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 4. Setup Database Schema
```bash
# Create tables and default data
npm run db:setup

# Add sample data
npm run db:seed
```

### 5. Start Servers
```bash
# Terminal 1: Backend (port 3001)
cd backend
npm start

# Terminal 2: Frontend (port 5173)
cd ..
bun dev
```

## 📊 Database Schema

### Tables Structure
- **categories** - Product categories management
- **stores** - Multiple store locations support
- **products** - Product catalog with pricing
- **inventory** - Real-time stock tracking
- **sales** - Transaction records
- **settings** - Application configuration

### Sample Data Included
- 6 product categories
- 8 products with barcodes
- Inventory with low stock alerts
- Sample sales transactions
- Multi-store support ready

## 🎨 Features

### Sales Management
- ✅ Quick sales entry form
- ✅ Barcode scanning ready
- ✅ Real-time inventory updates
- ✅ Transaction history
- ✅ Category-based organization

### Inventory Tracking
- ✅ Current stock levels
- ✅ Low stock alerts
- ✅ Min/max stock levels
- ✅ Cost and selling price tracking
- ✅ Multi-store inventory

### Reports & Analytics
- ✅ Daily/weekly/monthly sales reports
- ✅ Interactive charts
- ✅ Profit margin analysis
- ✅ Category performance
- ✅ CSV export functionality

### Advanced UI
- ✅ 5 color schemes (Blue, Green, Purple, Orange, Red)
- ✅ Dark/Light/Auto themes
- ✅ Responsive design
- ✅ Keyboard shortcuts
- ✅ Demo mode
- ✅ Accessibility features

## 🔧 Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start with nodemon
npm run db:setup   # Create database schema
npm run db:seed    # Add sample data
npm run db:demo    # Show MySQL configuration
npm run mysql:check # Test MySQL connection
```

### Frontend
```bash
bun dev           # Start development server
bun build         # Build for production
bun lint          # Run ESLint
```

## 🌐 API Endpoints

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `DELETE /api/sales/:id` - Delete sale

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/low-stock` - Get low stock items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory

### Categories & Stores
- `GET /api/categories` - Get all categories
- `GET /api/stores` - Get all stores

## 🔐 Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - API protection
- **CORS** configuration
- **Input validation**
- **SQL injection prevention**

## 📱 Responsive Design

Optimized for:
- 📱 Mobile devices
- 📟 Tablets
- 🖥️ Desktop computers
- 🎯 Point-of-sale systems

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
bun build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=quincaillerie_jamal
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For setup help or MySQL configuration issues, see:
- `backend/scripts/mysql-setup-instructions.md`
- Create an issue on GitHub
- Check the demo configuration: `npm run db:demo`
