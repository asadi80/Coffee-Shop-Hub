# Geocoding & Location Features

The Coffee Shop Hub includes comprehensive geocoding and location features to make it easy for shop owners to set their location.

## Features

### 1. Automatic Address Lookup (Reverse Geocoding)
When you click on the map or use "Get My Location", the app automatically:
- Detects the coordinates (latitude & longitude)
- Fetches the full address from those coordinates
- Auto-fills the address field
- Works anywhere in the world

### 2. Use My Location Button
One-click location detection:
- Click "Use My Location" button
- Browser asks for permission
- Map zooms to your current location
- Address is automatically filled in
- Perfect for shop owners setting up their shop

### 3. Interactive Map Picker
- Click anywhere on the map to set location
- Draggable marker (future enhancement)
- Real-time coordinate display
- Smooth map animations when location changes

## How It Works

### Reverse Geocoding Flow
```
User clicks map
    ↓
Get coordinates (lat, lng)
    ↓
Call OpenStreetMap Nominatim API
    ↓
Receive address data
    ↓
Format and display address
    ↓
Auto-fill address field
```

### Current Location Flow
```
User clicks "Use My Location"
    ↓
Request browser geolocation permission
    ↓
Get user's coordinates
    ↓
Update map position (with animation)
    ↓
Reverse geocode to get address
    ↓
Auto-fill form
```

## API Used

### OpenStreetMap Nominatim
- **Service**: Free reverse geocoding API
- **No API Key**: No registration required
- **Rate Limit**: 1 request per second
- **Coverage**: Worldwide
- **Accuracy**: Street-level in most areas

### Endpoints Used

**Reverse Geocoding:**
```
GET https://nominatim.openstreetmap.org/reverse
Parameters:
  - format: json
  - lat: latitude
  - lon: longitude
  - zoom: 18 (street level)
  - addressdetails: 1
```

**Forward Geocoding (future):**
```
GET https://nominatim.openstreetmap.org/search
Parameters:
  - format: json
  - q: search query
  - addressdetails: 1
  - limit: 5
```

## Address Format

The system returns structured address data:

```json
{
  "road": "Main Street",
  "house_number": "123",
  "suburb": "Downtown",
  "city": "San Francisco",
  "state": "California",
  "postcode": "94102",
  "country": "United States"
}
```

Formatted display:
```
123 Main Street, Downtown, San Francisco, California, 94102, United States
```

## Usage in Code

### Basic Reverse Geocoding
```javascript
import { reverseGeocode } from '@/lib/geocoding';

const result = await reverseGeocode(37.7749, -122.4194);

if (result.success) {
  console.log(result.formatted); // "123 Main St, San Francisco, CA..."
  console.log(result.address.city); // "San Francisco"
}
```

### Get Current Location
```javascript
import { getCurrentLocation } from '@/lib/geocoding';

try {
  const result = await getCurrentLocation();
  console.log(result.lat, result.lng);
  console.log(result.accuracy); // Accuracy in meters
} catch (error) {
  console.error('Location access denied');
}
```

### Forward Geocoding (Search)
```javascript
import { forwardGeocode } from '@/lib/geocoding';

const results = await forwardGeocode("123 Main St, San Francisco");

if (results.success) {
  results.results.forEach(result => {
    console.log(result.displayName);
    console.log(result.lat, result.lng);
  });
}
```

## Privacy & Permissions

### Browser Geolocation
- **Permission Required**: Yes
- **User Control**: Users must approve location access
- **Data Sent**: Only coordinates to geocoding API
- **No Tracking**: Location is not stored server-side

### Nominatim API
- **Data Sent**: Only coordinates or search queries
- **Privacy Policy**: OpenStreetMap Foundation privacy policy applies
- **No Tracking**: No user tracking or analytics
- **Open Source**: API is open source

## Error Handling

The system gracefully handles errors:

1. **No Browser Support**
   - Falls back to manual map clicking
   - Shows helpful message

2. **Permission Denied**
   - Shows error message
   - Allows manual selection

3. **API Failure**
   - Uses coordinates without address
   - Address can be edited manually

4. **Slow Connection**
   - Shows loading state
   - 5-second timeout

## Best Practices

### For Shop Owners
1. Click "Use My Location" if you're at your shop
2. Or click the map at your shop's location
3. Fine-tune by clicking a more precise spot
4. Verify the address is correct
5. Edit address if needed

### For Developers
1. Always handle geocoding errors gracefully
2. Show loading states during API calls
3. Provide manual override options
4. Cache results to reduce API calls
5. Respect Nominatim's rate limits (1 req/sec)

## Future Enhancements

- [ ] Address search autocomplete
- [ ] Draggable marker
- [ ] Multiple address suggestions
- [ ] Save favorite locations
- [ ] Nearby landmarks display
- [ ] Street view integration
- [ ] Area/neighborhood detection
- [ ] Business hours based on timezone

## Rate Limiting

Nominatim API has usage policies:

- **Max 1 request per second**
- **No bulk geocoding**
- **Use caching when possible**
- **Set User-Agent header**

Our implementation:
- Caches addresses locally
- Debounces rapid requests
- Includes proper User-Agent
- Falls back gracefully on errors

## Testing

### Test Coordinates
```javascript
// San Francisco
reverseGeocode(37.7749, -122.4194)

// New York
reverseGeocode(40.7128, -74.0060)

// London
reverseGeocode(51.5074, -0.1278)

// Tokyo
reverseGeocode(35.6762, 139.6503)
```

### Browser Testing
1. Allow location access when prompted
2. Try in incognito mode (requires re-permission)
3. Test with location services disabled
4. Test on mobile devices
5. Test in different browsers

## Troubleshooting

### "Unable to get location"
- Check browser permissions
- Ensure HTTPS (required for geolocation)
- Try different browser
- Check location services enabled on device

### "Address not found"
- Remote/rural areas may have less detail
- Use manual address entry
- Coordinates still work for map display

### "Slow response"
- Nominatim can be slow during peak times
- User sees loading state
- Timeout after 5 seconds
- Manual entry still available

## Credits

- **Geocoding**: OpenStreetMap Nominatim
- **Map Tiles**: OpenStreetMap contributors
- **Map Library**: Leaflet.js
- **Icons**: Leaflet default markers
