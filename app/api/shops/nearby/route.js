import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { calculateDistance } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude'));
    const longitude = parseFloat(searchParams.get('longitude'));
    const maxDistance = parseInt(searchParams.get('maxDistance')) || 10000; // Default 10km

    // Validation
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Find nearby shops using geospatial query
    const shops = await Shop.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance, // in meters
        },
      },
    })
      .limit(50)
      .populate('ownerId', 'name');

    // Add distance to each shop
    const shopsWithDistance = shops.map(shop => {
      const distance = calculateDistance(
        latitude,
        longitude,
        shop.location.coordinates[1],
        shop.location.coordinates[0]
      );

      return {
        ...shop.toObject(),
        distance, // in kilometers
      };
    });

    return NextResponse.json(
      {
        shops: shopsWithDistance,
        userLocation: { latitude, longitude },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Nearby shops error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby shops' },
      { status: 500 }
    );
  }
}
