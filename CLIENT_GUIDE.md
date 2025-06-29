# ShopEase E-commerce Platform - Client Guide

## 🚀 Overview

ShopEase is a full-stack e-commerce platform built with React + TypeScript frontend and Node.js microservices backend, powered by MySQL database. The platform includes a complete admin dashboard for managing products, orders, users, coupons, and customer inquiries.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Location**: `ecommerce-front/`
- **Port**: 5173
- **Features**: Modern UI with Tailwind CSS, responsive design, admin dashboard

### Backend Microservices
- **Product Service**: `ecommerce-back/produit-service/` (Port 4000)
- **Order Service**: `ecommerce-back/commande-service/` (Port 4001)
- **Auth Service**: `ecommerce-back/auth-service/` (Port 4002)
- **Admin Service**: `ecommerce-back/admin-service/` (Port 4003)

### Database
- **Type**: MySQL
- **Port**: 3306
- **Database**: `shopease_db`

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Database Setup
```bash
# Install MySQL if not already installed
# On Windows: Download from https://dev.mysql.com/downloads/mysql/
# On macOS: brew install mysql
# On Ubuntu: sudo apt install mysql-server

# Start MySQL service
# Windows: net start MySQL80
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql

# Create database (if not exists)
mysql -u root -p
CREATE DATABASE IF NOT EXISTS shopease_db;
```

### 2. Backend Setup
```bash
cd ecommerce-back

# Install dependencies for main backend
npm install

# Install dependencies for each service
cd auth-service && npm install && cd ..
cd produit-service && npm install && cd ..
cd commande-service && npm install && cd ..
cd admin-service && npm install && cd ..

# Initialize database with tables and sample data
npm run init-db
```

### 3. Frontend Setup
```bash
cd ecommerce-front
npm install
```

## 🚀 Running the Application

### 1. Start Backend Services
```bash
# Terminal 1 - Product Service
cd ecommerce-back/produit-service
npm start

# Terminal 2 - Order Service
cd ecommerce-back/commande-service
npm start

# Terminal 3 - Auth Service
cd ecommerce-back/auth-service
npm start

# Terminal 4 - Admin Service
cd ecommerce-back/admin-service
npm start
```

### 2. Start Frontend
```bash
# Terminal 5 - Frontend
cd ecommerce-front
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **Product Service**: http://localhost:4000
- **Order Service**: http://localhost:4001
- **Auth Service**: http://localhost:4002
- **Admin Service**: http://localhost:4003

## 👤 Admin Access

### Default Admin Account
- **Email**: admin@shopease.com
- **Password**: admin123
- **Role**: admin

### Admin Dashboard Features
1. **Dashboard Overview** (`/admin`)
   - Total users, orders, products, revenue statistics
   - Recent activity overview

2. **Product Management** (`/admin/products`)
   - Add, edit, delete products
   - Upload product images
   - Manage inventory and pricing
   - Toggle product status (active/inactive)

3. **Order Management** (`/admin/orders`)
   - View all customer orders
   - Update order status (pending, confirmed, shipped, delivered)
   - Add tracking information
   - Filter by status and search

4. **User Management** (`/admin/users`)
   - View all registered users
   - Block/unblock users
   - Reset user passwords
   - Search and filter users

5. **Coupon Management** (`/admin/coupons`)
   - Create discount coupons
   - Set percentage or fixed amount discounts
   - Configure usage limits and validity periods
   - Track coupon usage

6. **Contact Management** (`/admin/contact`)
   - View customer contact form submissions
   - Respond to inquiries
   - Update inquiry status and priority
   - Filter by status and priority

## 🛍️ Customer Features

### Public Features
- Browse products by category
- Search products
- View product details
- Add products to favorites
- Contact form for inquiries

### Customer Account Features (Registration Required)
- User registration and login
- Add products to cart
- Complete checkout process
- View order history
- Manage account information
- Add/remove favorites

## 📊 Database Schema

### Core Tables
- **users**: Customer and admin accounts
- **products**: Product catalog with images and inventory
- **orders**: Customer orders with status tracking
- **order_items**: Individual items in orders
- **favorites**: Customer favorite products
- **reviews**: Product reviews and ratings
- **addresses**: Customer shipping addresses
- **coupons**: Discount codes and promotions
- **contacts**: Customer contact form submissions

## 🔧 Configuration

### Environment Variables
Create `.env` files in each service directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopease_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Service Ports
PORT_ONE=4000  # Product Service
PORT_TWO=4001  # Order Service
PORT_THREE=4002 # Auth Service
PORT_FOUR=4003 # Admin Service
```

### Image Upload Configuration
- Product images are stored in `uploads/products/` directory
- Ensure the directory exists and has write permissions
- Images are served statically from the product service

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin/customer)
- Password hashing with bcrypt
- Protected routes for admin dashboard

### Data Validation
- Input validation on all forms
- SQL injection prevention with Sequelize ORM
- XSS protection with proper input sanitization

### Admin Security
- Admin-only endpoints with middleware protection
- Secure password reset functionality
- User blocking capabilities

## 📱 Mobile Responsiveness

The frontend is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Production Deployment

### Backend Deployment
1. Set up a production MySQL database
2. Configure environment variables for production
3. Use PM2 or similar process manager for Node.js services
4. Set up reverse proxy (nginx) for load balancing

### Frontend Deployment
1. Build the React application: `npm run build`
2. Serve static files with nginx or similar web server
3. Configure CORS for production domains

### Database Migration
1. Backup existing data
2. Run database migrations: `npm run init-db`
3. Verify all tables and relationships

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

2. **Service Not Starting**
   - Check if port is already in use
   - Verify all dependencies are installed
   - Check environment variables

3. **Image Upload Issues**
   - Ensure uploads directory exists
   - Check file permissions
   - Verify multer configuration

4. **Admin Access Issues**
   - Verify admin user exists in database
   - Check JWT token validity
   - Ensure proper role assignment

### Logs
- Check console logs for each service
- Monitor database connection logs
- Review frontend console for errors

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all prerequisites are met
4. Ensure proper configuration

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
1. **Database Backups**: Regular backups of MySQL database
2. **Log Rotation**: Manage application logs
3. **Security Updates**: Keep dependencies updated
4. **Performance Monitoring**: Monitor service performance

### Adding New Features
1. Create new database models if needed
2. Add corresponding API endpoints
3. Update frontend components
4. Test thoroughly before deployment

---

**ShopEase E-commerce Platform** - A complete, production-ready e-commerce solution with full admin capabilities and modern user experience. 