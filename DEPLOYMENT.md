# 🚀 Coffee Shop Hub - Deployment Guide

## Prerequisites

1. **Node.js** (v18 or later)
2. **MongoDB Atlas Account** (free tier available)
3. **Cloudinary Account** (free tier available)
4. **Vercel Account** (free tier available)

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Add `/coffeeshop-hub` after the cluster address

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coffeeshop-hub?retryWrites=true&w=majority
```

## Step 2: Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Local Development Setup

1. Clone or create the project:
```bash
mkdir coffee-shop-hub
cd coffee-shop-hub
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAP_DEFAULT_LAT=37.7749
NEXT_PUBLIC_MAP_DEFAULT_LNG=-122.4194
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=12
```

4. Generate a secure NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

5. Add Environment Variables (same as `.env.local` but with production values):
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain, e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_MAP_DEFAULT_LAT`
   - `NEXT_PUBLIC_MAP_DEFAULT_LNG`
   - `NEXT_PUBLIC_MAP_DEFAULT_ZOOM`

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables:
```bash
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
# ... add all other variables
```

5. Redeploy with environment variables:
```bash
vercel --prod
```

## Step 5: Post-Deployment Configuration

1. Update `NEXTAUTH_URL` in Vercel environment variables to your production URL
2. Update MongoDB Atlas Network Access:
   - Go to Network Access
   - Add `0.0.0.0/0` to allow connections from anywhere (Vercel uses dynamic IPs)

3. Create Geospatial Index in MongoDB:
   - Connect to your MongoDB cluster via MongoDB Compass or shell
   - Run:
   ```javascript
   db.shops.createIndex({ location: "2dsphere" })
   ```

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test sign up functionality
3. Create a test coffee shop
4. Verify map displays correctly
5. Test image uploads
6. Test menu management

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: Check MongoDB Atlas Network Access allows Vercel IPs (0.0.0.0/0)

### Issue: "NextAuth configuration error"
**Solution**: Ensure `NEXTAUTH_URL` matches your production domain exactly

### Issue: "Images not uploading"
**Solution**: Verify all Cloudinary credentials are correct in environment variables

### Issue: "Map not loading"
**Solution**: Ensure Leaflet CSS is loaded in layout.js

### Issue: Build fails on Vercel
**Solution**: 
- Check all dependencies are in `package.json`
- Ensure no TypeScript errors if using JS
- Check build logs for specific errors

## Performance Optimization

### 1. Image Optimization
- Images are automatically optimized via Cloudinary
- Use lazy loading for gallery images

### 2. Database Indexes
Create these indexes for better performance:
```javascript
// Shops
db.shops.createIndex({ location: "2dsphere" })
db.shops.createIndex({ ownerId: 1, isActive: 1 })
db.shops.createIndex({ slug: 1 })

// Menu Categories
db.menucategories.createIndex({ shopId: 1, order: 1 })

// Menu Items
db.menuitems.createIndex({ shopId: 1, categoryId: 1 })
db.menuitems.createIndex({ shopId: 1, isAvailable: 1 })
```

### 3. Caching
- Static pages are cached by Vercel Edge Network
- API routes use connection pooling
- Consider adding Redis for session caching (optional)

## Monitoring & Maintenance

1. **Vercel Analytics**: Enable in Vercel dashboard for traffic insights
2. **MongoDB Atlas Monitoring**: Check database performance and slow queries
3. **Cloudinary Usage**: Monitor storage and transformation usage
4. **Error Tracking**: Consider adding Sentry for error monitoring

## Scaling Considerations

### When you outgrow free tiers:

1. **MongoDB Atlas**: Upgrade to M10+ for dedicated resources
2. **Cloudinary**: Upgrade for more transformations and storage
3. **Vercel**: Pro plan for better performance and analytics
4. **Add CDN**: Use Vercel Edge Network or Cloudinary CDN
5. **Database Sharding**: For very large datasets
6. **Rate Limiting**: Implement API rate limiting for production
7. **Caching Layer**: Add Redis for frequently accessed data

## Security Checklist

- [x] Environment variables secured
- [x] MongoDB connection uses SSL
- [x] Passwords hashed with bcrypt
- [x] JWT sessions secured
- [x] CORS configured
- [x] Input validation on all forms
- [x] File upload size limits
- [x] XSS protection
- [x] Rate limiting on API routes (implement as needed)

## Backup Strategy

1. **MongoDB Atlas**: Enable automated backups in Atlas
2. **Cloudinary**: Images are automatically backed up
3. **Code**: Keep Git repository as source of truth

## Support

For issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Review browser console for client errors
4. Check Next.js documentation
5. Review Cloudinary upload logs

## Next Steps After Deployment

1. Add custom domain in Vercel
2. Set up Google Analytics
3. Configure SEO metadata for public pages
4. Add sitemap generation
5. Implement email notifications (optional)
6. Add social sharing features
7. Create admin dashboard for platform management
8. Implement reviews and ratings system
9. Add multi-language support (i18n)
10. Create mobile apps using React Native (future)
