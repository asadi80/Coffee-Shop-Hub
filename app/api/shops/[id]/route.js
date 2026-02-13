import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { generateSlug } from '@/lib/utils';

// GET single shop by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const shop = await Shop.findById(params.id).populate('ownerId', 'name email');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await shop.incrementViews();

    return NextResponse.json({ shop }, { status: 200 });
  } catch (error) {
    console.error('Get shop error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}

// PUT update shop (owner only)
export async function PUT(request, { params }) {
  const { id } = await params; 
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find shop and verify ownership
    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.ownerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this shop' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // If name is being updated, regenerate slug
    if (data.name && data.name !== shop.name) {
      let newSlug = generateSlug(data.name);
      let slugExists = await Shop.findOne({ slug: newSlug, _id: { $ne: params.id } });
      let counter = 1;

      while (slugExists) {
        newSlug = `${generateSlug(data.name)}-${counter}`;
        slugExists = await Shop.findOne({ slug: newSlug, _id: { $ne: params.id } });
        counter++;
      }

      data.slug = newSlug;
    }

    // If coordinates are being updated, update location
    if (data.latitude && data.longitude) {
      data.location = {
        type: 'Point',
        coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
      };
      delete data.latitude;
      delete data.longitude;
    }

    // Update shop
    const updatedShop = await Shop.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        message: 'Shop updated successfully',
        shop: updatedShop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update shop error:', error);
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 }
    );
  }
}

// DELETE shop (owner only)
export async function DELETE(request, { params }) {
  const { id } = await params; 
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find shop and verify ownership
    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.ownerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this shop' },
        { status: 403 }
      );
    }

    await Shop.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Shop deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete shop error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 }
    );
  }
}
