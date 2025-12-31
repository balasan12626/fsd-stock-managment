# Multi-Vendor E-commerce Application

Production-ready e-commerce platform with Customer Portal and Seller Portal.

## Tech Stack

### Backend
- Node.js + Express.js
- AWS S3 (image storage)
- AWS DynamoDB (NoSQL database)
- JWT Authentication
- Multer (file uploads)

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

## Project Structure

```
fsd_project/
├── backend/
│   ├── config/
│   │   └── awsConfig.js
│   ├── controllers/
│   │   ├── sellerController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── SellerRegister.jsx
    │   │   ├── SellerLogin.jsx
    │   │   ├── SellerDashboard.jsx
    │   │   ├── AddProduct.jsx
    │   │   └── EditProduct.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Setup Instructions

### 1. AWS Configuration

#### DynamoDB Tables

Create two tables in AWS DynamoDB (Region: ap-south-1):

**Table: Sellers**
- Partition Key: `sellerId` (String)

**Table: Products**
- Partition Key: `sellerId` (String)
- Sort Key: `productId` (String)

#### S3 Bucket

Create S3 bucket: `ecommerce-seller-assets`
- Region: ap-south-1
- Public read access for images
- Folders: `/logos` and `/products`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ecommerce-seller-assets
JWT_SECRET=your_jwt_secret_change_this
PORT=5000
```

Start server:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000
Backend runs on: http://localhost:5000

## API Endpoints

### Seller Routes
- `POST /api/seller/register` - Register new seller
- `POST /api/seller/login` - Login seller

### Product Routes (Protected)
- `POST /api/product/add` - Add product
- `PUT /api/product/update` - Update product
- `DELETE /api/product/delete` - Delete product
- `GET /api/product/seller-products` - Get seller's products

## Features

### Seller Portal
- ✅ Seller registration with company details
- ✅ Company logo upload to S3
- ✅ GST number validation
- ✅ JWT-based authentication
- ✅ Seller dashboard
- ✅ Add/Edit/Delete products
- ✅ Multiple product image uploads
- ✅ Stock quantity management
- ✅ Product expiry date tracking
- ✅ Image preview before upload
- ✅ Form validation
- ✅ Protected routes

## Security Features
- JWT token authentication
- Password hashing with bcrypt
- File size validation (5MB limit)
- Image-only upload restriction
- Environment variables for sensitive data
- Protected API routes

## Production Deployment

1. Set up AWS credentials with appropriate IAM permissions
2. Configure DynamoDB tables
3. Set up S3 bucket with proper CORS configuration
4. Update environment variables for production
5. Build frontend: `npm run build`
6. Deploy backend to your preferred hosting service
7. Deploy frontend build to CDN/hosting service

## Notes
- Ensure AWS credentials have DynamoDB and S3 permissions
- Update CORS settings in backend for production frontend URL
- Change JWT_SECRET to a strong random string
- Configure S3 bucket policy for public read access to images
