# Coffee Shop Hub - Project Structure

```
coffee-shop-hub/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group route
│   │   │   ├── login/
│   │   │   │   └── page.js
│   │   │   └── signup/
│   │   │       └── page.js
│   │   ├── (dashboard)/              # Dashboard group route (protected)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.js           # Main dashboard
│   │   │   │   ├── shops/
│   │   │   │   │   ├── page.js       # Shop list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.js   # Create shop
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.js   # Edit shop
│   │   │   │   │       ├── menu/
│   │   │   │   │       │   └── page.js # Menu management
│   │   │   │   │       └── analytics/
│   │   │   │   │           └── page.js # Analytics
│   │   │   │   └── layout.js         # Dashboard layout
│   │   ├── shop/                     # Public shop pages
│   │   │   └── [slug]/
│   │   │       └── page.js           # Shop detail page
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.js
│   │   │   │   ├── login/
│   │   │   │   │   └── route.js
│   │   │   │   └── session/
│   │   │   │       └── route.js
│   │   │   ├── shops/
│   │   │   │   ├── route.js          # GET (list), POST (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js      # GET, PUT, DELETE
│   │   │   │   ├── nearby/
│   │   │   │   │   └── route.js      # GET nearby shops
│   │   │   │   └── analytics/
│   │   │   │       └── route.js      # Track views
│   │   │   ├── menu/
│   │   │   │   ├── categories/
│   │   │   │   │   └── route.js      # CRUD categories
│   │   │   │   └── items/
│   │   │   │       └── route.js      # CRUD menu items
│   │   │   └── upload/
│   │   │       └── route.js          # Cloudinary upload
│   │   ├── layout.js                 # Root layout
│   │   ├── page.js                   # Home page (Map view)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React Components
│   │   ├── auth/
│   │   │   ├── LoginForm.js
│   │   │   └── SignupForm.js
│   │   ├── dashboard/
│   │   │   ├── DashboardNav.js
│   │   │   ├── ShopForm.js
│   │   │   ├── MenuManager.js
│   │   │   ├── CategoryForm.js
│   │   │   ├── MenuItemForm.js
│   │   │   └── AnalyticsDashboard.js
│   │   ├── map/
│   │   │   ├── MapView.js
│   │   │   ├── ShopMarker.js
│   │   │   └── LocationPicker.js
│   │   ├── shop/
│   │   │   ├── ShopCard.js
│   │   │   ├── ShopDetail.js
│   │   │   ├── MenuDisplay.js
│   │   │   └── QRCodeGenerator.js
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── ImageUpload.js
│   │   │   └── Loader.js
│   │   └── layout/
│   │       ├── Navbar.js
│   │       └── Footer.js
│   │
│   ├── lib/                          # Utilities & Config
│   │   ├── mongodb.js                # MongoDB connection
│   │   ├── cloudinary.js             # Cloudinary config
│   │   ├── jwt.js                    # JWT utilities
│   │   └── middleware.js             # Auth middleware
│   │
│   ├── models/                       # Mongoose Models
│   │   ├── User.js
│   │   ├── Shop.js
│   │   ├── MenuCategory.js
│   │   └── MenuItem.js
│   │
│   └── utils/                        # Helper functions
│       ├── validation.js             # Input validation
│       ├── geocoding.js              # Location utilities
│       └── slugify.js                # Slug generation
│
├── public/                           # Static assets
│   ├── images/
│   └── icons/
│
├── .env.local                        # Environment variables
├── .gitignore
├── next.config.js                    # Next.js configuration
├── package.json
├── jsconfig.json                     # JavaScript configuration
└── README.md
```

## Key Directory Explanations

### `/src/app/`
- Uses Next.js 13+ App Router
- Route groups `(auth)` and `(dashboard)` for layout organization
- API routes in `/api/` subfolder

### `/src/components/`
- Organized by feature (auth, dashboard, map, shop, ui)
- Reusable UI components in `/ui/`
- Layout components separate

### `/src/lib/`
- Database connections
- Third-party service configurations
- Middleware and authentication logic

### `/src/models/`
- Mongoose schema definitions
- All database models centralized

### `/src/utils/`
- Pure utility functions
- Validation logic
- Helper functions

## Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Maps (Choose one)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
# OR
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
