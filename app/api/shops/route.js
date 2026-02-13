import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { generateSlug } from '@/lib/utils';

// GET all shops (public) or user's shops (authenticated)
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    let query = {};

    if (owner === 'me' && session?.user?.id) {
      // Get current user's shops
      query.ownerId = session.user.id;
    } else {
      // Get all active shops (public)
      query.isActive = true;
    }

    const shops = await Shop.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ shops }, { status: 200 });
  } catch (error) {
    console.error('Get shops error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}

// POST create new shop (authenticated)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      openingHours,
      phone,
      socialLinks,
      logoUrl,
      images,
    } = data;

    // Validation
    if (!name || !address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Name, address, and coordinates are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await Shop.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Shop.findOne({ slug });
      counter++;
    }

    // Create shop
    const shop = await Shop.create({
      ownerId: session.user.id,
      name,
      slug,
      description,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      openingHours: openingHours || {},
      phone,
      socialLinks: socialLinks || {},
      logoUrl,
      images: images || [],
    });

    return NextResponse.json(
      {
        message: 'Shop created successfully',
        shop,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    );
  }
}
