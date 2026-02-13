# Coffee Shop Hub - Architecture & Workflow

## System Overview

Coffee Shop Hub is a full-stack SaaS platform built with Next.js 14, using the App Router for modern React development. The application follows a serverless architecture pattern, with API routes handling backend logic and MongoDB Atlas for data persistence.

## Architecture Layers

### 1. Presentation Layer (Client)
- **Technology**: React 18, Next.js 14 App Router
- **Styling**: CSS Modules, CSS-in-JS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Map Integration**: Leaflet + React Leaflet
- **Image Handling**: Next.js Image component with Cloudinary optimization

### 2. Application Layer (Server)
- **API Routes**: Next.js API Routes (serverless functions)
- **Authentication**: NextAuth.js with JWT strategy
- **Session Management**: HTTP-only cookies
- **Middleware**: Authentication and authorization checks

### 3. Data Layer
- **Primary Database**: MongoDB Atlas (NoSQL)
- **ODM**: Mongoose for schema validation and queries
- **Image Storage**: Cloudinary (CDN + cloud storage)
- **Session Store**: NextAuth session stored in JWT

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Pages  │  │  Components  │  │  Map (Leaflet)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP Requests    │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel)                         │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Middleware (Auth Check)                 │       │
│  └───────────────────┬──────────────────────────────┘       │
│                      │                                        │
│  ┌───────────────────▼──────────────────────────────┐       │
│  │              API Routes                           │       │
│  │  /auth  /shops  /menu  /upload  /analytics       │       │
│  └─────┬─────────────┬─────────────┬────────────────┘       │
└────────┼─────────────┼─────────────┼────────────────────────┘
         │             │             │
         │ MongoDB     │ Cloudinary  │ NextAuth
         │ Queries     │ API         │ JWT
         ▼             ▼             ▼
┌────────────┐  ┌──────────┐  ┌──────────┐
│  MongoDB   │  │Cloudinary│  │ Session  │
│   Atlas    │  │   CDN    │  │  Store   │
└────────────┘  └──────────┘  └──────────┘
```

## User Workflows

### Owner Workflow: Creating a Coffee Shop

```
1. Owner signs up/logs in
   └─> POST /api/auth/register
   └─> POST /api/auth/signin

2. Owner navigates to Dashboard
   └─> GET /dashboard (protected route)

3. Owner clicks "Create New Shop"
   └─> Navigate to /dashboard/shops/new

4. Owner fills shop form:
   - Basic info (name, description, address)
   - Location (interactive map picker)
   - Opening hours
   - Contact & social links

5. Owner uploads logo
   └─> POST /api/upload (multipart/form-data)
   └─> Cloudinary processes & returns URL

6. Owner submits form
   └─> POST /api/shops
   └─> Server validates ownership
   └─> Generate unique slug
   └─> Create MongoDB document
   └─> Return created shop

7. Owner manages menu
   └─> Navigate to /dashboard/shops/{id}/menu
   
8. Create menu categories
   └─> POST /api/menu/categories

9. Add menu items
   └─> POST /api/menu/items
   └─> Upload item images
   └─> Set prices and availability

10. Publish shop
    └─> PUT /api/shops/{id} { isActive: true }
```

### Customer Workflow: Finding Coffee Shops

```
1. Customer visits homepage
   └─> GET / (public route)

2. Browser requests geolocation
   └─> navigator.geolocation.getCurrentPosition()

3. Map loads with user location
   └─> MapContainer initializes
   └─> TileLayer fetches map tiles from OpenStreetMap

4. Fetch nearby shops
   └─> GET /api/shops/nearby?lat={lat}&lng={lng}&maxDistance={m}
   └─> MongoDB 2dsphere query finds shops within radius
   └─> Calculate distances using Haversine formula
   └─> Return sorted by distance

5. Display shop markers on map
   └─> Render Marker components for each shop
   └─> Custom coffee cup icon

6. Customer clicks shop marker
   └─> Popup displays shop preview
   └─> Shows: name, distance, address

7. Customer clicks "View Menu"
   └─> Navigate to /shop/{slug}
   └─> GET /api/shops/slug/{slug}
   └─> Increment view counter

8. Customer browses menu
   └─> GET /api/menu/items?shopId={id}
   └─> Display categorized menu items

9. Customer clicks "Get Directions"
   └─> Open Google Maps with shop coordinates
   └─> POST /api/shops/{id}/track-click
   └─> Increment mapClicks counter
```

## Database Query Patterns

### Geospatial Queries (Finding Nearby Shops)

```javascript
// 1. Create 2dsphere index (one-time setup)
db.shops.createIndex({ location: "2dsphere" })

// 2. Find shops within radius
db.shops.find({
  isActive: true,
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude]  // [lng, lat] order!
      },
      $maxDistance: 5000  // meters
    }
  }
})

// Results are automatically sorted by distance
```

### Performance Optimization Queries

```javascript
// 1. Index for owner's shop queries
db.shops.createIndex({ ownerId: 1, isActive: 1 })

// 2. Index for slug lookups
db.shops.createIndex({ slug: 1 })

// 3. Compound index for menu items
db.menuitems.createIndex({ shopId: 1, categoryId: 1 })
db.menuitems.createIndex({ shopId: 1, isAvailable: 1 })
```

## Authentication Flow

### Registration
```
1. User submits registration form
2. Client validates input
3. POST /api/auth/register with credentials
4. Server hashes password (bcrypt, 10 rounds)
5. Create user document in MongoDB
6. Return success (no auto-login)
7. Redirect to login page
```

### Login
```
1. User submits login credentials
2. POST to NextAuth signin endpoint
3. NextAuth calls authorize() function
4. Query MongoDB for user with email
5. Compare password hashes (bcrypt.compare)
6. If valid, create JWT token
7. Set HTTP-only session cookie
8. Redirect to dashboard
```

### Protected Route Access
```
1. Client requests protected route
2. Middleware checks for session cookie
3. If no session, redirect to /login
4. If session exists, decode JWT
5. Attach user data to request
6. Allow route access
```

## Image Upload Flow

```
1. User selects image file
2. Client validates file (type, size)
3. Convert file to base64 or FormData
4. POST /api/upload with file data
5. Server receives upload
6. Forward to Cloudinary API
7. Cloudinary:
   - Stores original
   - Generates transformations
   - Returns CDN URL
8. Server saves URL to MongoDB
9. Client displays uploaded image
```

## Error Handling Strategy

### Client-Side
```javascript
try {
  const response = await fetch('/api/shops', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  // Show user-friendly error message
  setError(error.message);
}
```

### Server-Side
```javascript
export async function POST(request) {
  try {
    // Validate input
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processData(data);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Scalability Considerations

### Current Architecture (MVP)
- Serverless functions (auto-scaling)
- MongoDB Atlas (shared cluster)
- Cloudinary free tier
- Vercel free tier

### When to Scale

#### Database (MongoDB Atlas)
**Upgrade when:**
- > 100,000 documents
- > 100 concurrent connections
- Need dedicated resources
- Require advanced analytics

**Action:**
- Upgrade to M10+ cluster
- Enable sharding for horizontal scaling
- Implement read replicas

#### Image Storage (Cloudinary)
**Upgrade when:**
- > 25 GB storage
- > 25,000 transformations/month
- Need video support

**Action:**
- Upgrade to paid plan
- Implement lazy loading everywhere
- Consider WebP format

#### Hosting (Vercel)
**Upgrade when:**
- > 100 GB bandwidth/month
- Need more build minutes
- Require advanced analytics

**Action:**
- Upgrade to Pro plan
- Implement edge caching
- Use ISR (Incremental Static Regeneration)

### Performance Optimization Checklist

- [x] Database indexes on frequently queried fields
- [x] Geospatial index for location queries
- [x] Connection pooling (MongoDB)
- [x] Image optimization (Cloudinary)
- [x] Lazy loading for images
- [ ] Redis caching layer (future)
- [ ] CDN for static assets (future)
- [ ] API response caching (future)
- [ ] Database query optimization (monitor slow queries)

## Security Measures

### Authentication Security
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for sessions
- ✅ HTTP-only cookies (prevent XSS)
- ✅ Secure flag on cookies in production
- ✅ CSRF protection via NextAuth

### API Security
- ✅ Input validation on all routes
- ✅ Mongoose schema validation
- ✅ Ownership verification before updates/deletes
- ✅ Role-based access control
- ⚠️ Rate limiting (implement for production)
- ⚠️ Request logging (implement for production)

### Data Security
- ✅ MongoDB connection over TLS
- ✅ Environment variables for secrets
- ✅ No sensitive data in client code
- ✅ Cloudinary signed uploads
- ✅ File type validation

## Monitoring & Logging

### What to Monitor

#### Application Metrics
- API response times
- Error rates
- User registration rate
- Shop creation rate
- Image upload success rate

#### Database Metrics
- Query performance
- Connection pool usage
- Slow queries
- Index usage

#### Infrastructure Metrics
- Vercel function execution time
- MongoDB Atlas CPU/memory
- Cloudinary bandwidth usage

### Logging Strategy

```javascript
// Structured logging example
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Shop created',
  userId: session.user.id,
  shopId: shop._id,
  duration: endTime - startTime
}));
```

### Error Tracking
Consider implementing:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance
- MongoDB Atlas monitoring for database

## Deployment Pipeline

### Development → Production

```
1. Local Development
   └─> npm run dev
   └─> Test features locally

2. Commit to Git
   └─> git add .
   └─> git commit -m "feature"
   └─> git push origin main

3. Vercel Auto-Deploy
   └─> Detects push to main
   └─> Runs build process
   └─> Deploys to edge network
   └─> Returns deployment URL

4. Verify Deployment
   └─> Check build logs
   └─> Test production URL
   └─> Monitor for errors

5. Database Migrations (if needed)
   └─> Connect to MongoDB Atlas
   └─> Run migration scripts
   └─> Create/update indexes
```

### CI/CD Best Practices

```yaml
# Future GitHub Actions workflow
name: CI/CD
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run lint
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/actions/cli@v1
        with:
          command: deploy --prod
```

## Future Enhancements Architecture

### Phase 2: Reviews & Ratings
- Add Reviews collection
- Aggregate rating calculations
- Review moderation system

### Phase 3: Real-time Features
- WebSocket server (Socket.io)
- Live shop availability
- Real-time order tracking

### Phase 4: Mobile App
- React Native mobile app
- Shared API backend
- Push notifications

### Phase 5: Advanced Analytics
- Google Analytics integration
- Custom analytics dashboard
- Heat maps for popular times
- Customer insights
