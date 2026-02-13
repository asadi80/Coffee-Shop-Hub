# ⚡ Quick Start Guide

Get your Coffee Shop Hub running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free)
- Cloudinary account (free)

## Step 1: Clone and Install (2 minutes)

```bash
# Create project directory
mkdir coffee-shop-hub
cd coffee-shop-hub

# Copy all files from the provided source

# Install dependencies
npm install
```

## Step 2: Setup Environment Variables (2 minutes)

Create `.env.local` file:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffeeshop-hub

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Map defaults
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAP_DEFAULT_LAT=37.7749
NEXT_PUBLIC_MAP_DEFAULT_LNG=-122.4194
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=12
```

### Get MongoDB URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string

### Get Cloudinary Credentials:
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free
3. Dashboard shows: Cloud Name, API Key, API Secret

### Generate NextAuth Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test the Application

### 1. Register as Shop Owner
- Click "Get Started"
- Fill in name, email, password
- Click "Sign Up"

### 2. Create Your First Coffee Shop
- Login with credentials
- Click "Dashboard"
- Click "Create New Shop"
- Fill in shop details:
  - Name: "My Coffee Shop"
  - Address: Your address
  - Description: Brief description
  - Click map to set location
  - Add opening hours
- Click "Save"

### 3. Add Menu Items
- Go to shop management
- Click "Menu"
- Create category: "Drinks"
- Add item:
  - Name: "Cappuccino"
  - Price: 4.50
  - Description: "Classic Italian coffee"
- Click "Save"

### 4. View Public Page
- Go to homepage
- Allow location access
- See your shop on the map!
- Click marker to view details

## Common Issues

### MongoDB Connection Failed
**Problem:** Can't connect to MongoDB
**Solution:** 
1. Check MONGODB_URI in `.env.local`
2. Verify password in connection string
3. Add your IP to MongoDB Network Access (0.0.0.0/0 for development)

### Map Not Loading
**Problem:** Map shows blank or error
**Solution:**
1. Check browser console for errors
2. Ensure Leaflet CSS is loaded in layout.js
3. Clear browser cache

### Images Not Uploading
**Problem:** Upload fails or returns error
**Solution:**
1. Verify Cloudinary credentials
2. Check file size (keep under 10MB)
3. Ensure file is image format (jpg, png)

### Session/Auth Issues
**Problem:** Can't stay logged in
**Solution:**
1. Verify NEXTAUTH_SECRET is set
2. Clear browser cookies
3. Restart development server

## Development Tips

### Hot Reload
- Changes to components hot reload automatically
- API route changes require page refresh
- .env.local changes require server restart

### Database Inspection
Use MongoDB Compass to view your data:
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MONGODB_URI
3. Browse collections: users, shops, menuitems

### Testing API Routes
Use tools like:
- Postman
- Insomnia
- cURL
- Browser DevTools Network tab

Example cURL:
```bash
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Shop","address":"123 Main St"}'
```

## Next Steps

1. **Read Full Documentation**
   - README.md - Overview and features
   - ARCHITECTURE.md - Technical details
   - API_DOCUMENTATION.md - API reference
   - DEPLOYMENT.md - Production deployment

2. **Customize Design**
   - Edit `src/app/globals.css` for colors
   - Modify components in `src/components/`
   - Update fonts in globals.css

3. **Add Features**
   - Implement reviews system
   - Add customer favorites
   - Create admin dashboard
   - Build mobile app

4. **Deploy to Production**
   - Follow DEPLOYMENT.md guide
   - Deploy to Vercel
   - Configure production environment variables
   - Set up monitoring

## Project Structure Quick Reference

```
src/
├── app/              # Pages and API routes
│   ├── api/          # Backend API
│   ├── dashboard/    # Owner dashboard
│   └── page.js       # Homepage with map
├── components/       # Reusable components
│   ├── map/          # Map components
│   ├── layout/       # Layout components
│   └── ui/           # UI components
├── lib/              # Utilities and config
│   ├── mongodb.js    # Database connection
│   ├── auth.js       # NextAuth config
│   └── utils.js      # Helper functions
└── models/           # MongoDB models
```

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
```

## Getting Help

1. Check documentation files
2. Review browser console for errors
3. Check Vercel deployment logs
4. Review MongoDB Atlas logs
5. Search GitHub issues (if open source)

## Success Checklist

- [x] Project installed
- [x] Environment variables configured
- [x] Development server running
- [x] User registered
- [x] Coffee shop created
- [x] Menu items added
- [x] Shop visible on map
- [x] Public page accessible

Congratulations! Your Coffee Shop Hub is running! 🎉☕

## What's Next?

- Customize the design to match your brand
- Add more shops and menu items
- Test all features thoroughly
- Deploy to production (see DEPLOYMENT.md)
- Share with real coffee shop owners!
