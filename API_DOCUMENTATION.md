# API Endpoints Documentation

## Base URL
Development: `http://localhost:3000/api`
Production: `https://your-domain.vercel.app/api`

## Authentication

All protected endpoints require authentication via NextAuth session.

### Headers
```
Content-Type: application/json
Cookie: next-auth.session-token=<session-token>
```

## Endpoints

### Auth

#### Register User
Creates a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "65a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner"
  }
}
```

**Error Responses:**
- `400`: Missing fields or validation error
- `409`: Email already exists
- `500`: Server error

---

### Shops

#### Get All Shops
Returns all active shops (public) or user's shops (authenticated).

```http
GET /api/shops
GET /api/shops?owner=me  # Get current user's shops
```

**Success Response (200):**
```json
{
  "shops": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "name": "Blue Moon Coffee",
      "slug": "blue-moon-coffee",
      "description": "Artisan coffee roasted daily",
      "address": "123 Main St, San Francisco, CA",
      "location": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "openingHours": {
        "monday": { "open": "07:00", "close": "19:00", "closed": false }
      },
      "phone": "+1234567890",
      "socialLinks": {
        "instagram": "bluemooncoffee",
        "website": "https://bluemoon.com"
      },
      "logoUrl": "https://res.cloudinary.com/...",
      "images": ["https://res.cloudinary.com/..."],
      "isActive": true,
      "analytics": {
        "views": 150,
        "mapClicks": 45
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T15:45:00.000Z"
    }
  ]
}
```

---

#### Get Nearby Shops
Returns shops near specified coordinates.

```http
GET /api/shops/nearby?latitude=37.7749&longitude=-122.4194&maxDistance=5000
```

**Query Parameters:**
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `maxDistance` (optional): Max distance in meters (default: 10000)

**Success Response (200):**
```json
{
  "shops": [
    {
      ...shop_data,
      "distance": 2.3  // Distance in kilometers
    }
  ],
  "userLocation": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

---

#### Get Single Shop
Returns details of a specific shop.

```http
GET /api/shops/{shopId}
```

**Success Response (200):**
```json
{
  "shop": {
    ...shop_data
  }
}
```

**Error Responses:**
- `404`: Shop not found
- `500`: Server error

---

#### Create Shop
Creates a new coffee shop (requires authentication).

```http
POST /api/shops
```

**Request Body:**
```json
{
  "name": "Blue Moon Coffee",
  "description": "Artisan coffee roasted daily",
  "address": "123 Main St, San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "openingHours": {
    "monday": { "open": "07:00", "close": "19:00", "closed": false },
    "tuesday": { "open": "07:00", "close": "19:00", "closed": false }
  },
  "phone": "+1234567890",
  "socialLinks": {
    "website": "https://bluemoon.com",
    "instagram": "bluemooncoffee"
  },
  "logoUrl": "https://res.cloudinary.com/...",
  "images": ["https://res.cloudinary.com/..."]
}
```

**Success Response (201):**
```json
{
  "message": "Shop created successfully",
  "shop": {
    ...created_shop_data
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Unauthorized
- `500`: Server error

---

#### Update Shop
Updates an existing shop (requires ownership or admin role).

```http
PUT /api/shops/{shopId}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "message": "Shop updated successfully",
  "shop": {
    ...updated_shop_data
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not owner)
- `404`: Shop not found
- `500`: Server error

---

#### Delete Shop
Deletes a shop (requires ownership or admin role).

```http
DELETE /api/shops/{shopId}
```

**Success Response (200):**
```json
{
  "message": "Shop deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not owner)
- `404`: Shop not found
- `500`: Server error

---

### Menu Items

#### Get Menu Items
Returns menu items for a specific shop.

```http
GET /api/menu/items?shopId={shopId}&categoryId={categoryId}
```

**Query Parameters:**
- `shopId` (required): Shop ID
- `categoryId` (optional): Filter by category

**Success Response (200):**
```json
{
  "items": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "shopId": "65a1b2c3d4e5f6789012340",
      "categoryId": "65a1b2c3d4e5f6789012341",
      "name": "Cappuccino",
      "description": "Classic Italian coffee with steamed milk",
      "price": 4.5,
      "imageUrl": "https://res.cloudinary.com/...",
      "isAvailable": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### Create Menu Item
Creates a new menu item (requires shop ownership).

```http
POST /api/menu/items
```

**Request Body:**
```json
{
  "shopId": "65a1b2c3d4e5f6789012340",
  "categoryId": "65a1b2c3d4e5f6789012341",
  "name": "Cappuccino",
  "description": "Classic Italian coffee",
  "price": 4.5,
  "imageUrl": "https://res.cloudinary.com/..."
}
```

**Success Response (201):**
```json
{
  "message": "Menu item created successfully",
  "item": {
    ...created_item_data
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Unauthorized
- `403`: Forbidden (not shop owner)
- `404`: Shop not found
- `500`: Server error

---

### Image Upload

#### Upload Image
Uploads an image to Cloudinary (requires authentication).

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image file (required)
- `folder`: Cloudinary folder path (optional, default: "coffee-shop-hub")

**Success Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "coffee-shop-hub/abc123"
}
```

**Error Responses:**
- `400`: No file provided
- `401`: Unauthorized
- `500`: Upload failed

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement rate limiting middleware
- Recommended: 100 requests per hour per IP for authenticated routes
- Recommended: 1000 requests per hour for public read-only routes

## Error Response Format

All errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## Authentication Flow

1. User registers via `/api/auth/register`
2. User logs in via NextAuth (handled by `/api/auth/[...nextauth]`)
3. NextAuth sets session cookie
4. Protected requests include session cookie automatically
5. Middleware validates session on protected routes

## Pagination

Currently not implemented. For large datasets, implement:
- Query parameters: `page`, `limit`
- Response includes: `data`, `pagination` (total, page, pages)

Example future implementation:
```http
GET /api/shops?page=1&limit=20
```

## Filtering & Sorting

Future enhancements:
- `sort`: Field to sort by (e.g., `createdAt`, `name`)
- `order`: Sort order (`asc`, `desc`)
- `search`: Search query
- `filter`: Complex filtering

## WebSocket Support

Not currently implemented. Future real-time features:
- Live shop availability updates
- Real-time order tracking
- Chat with shop owners
