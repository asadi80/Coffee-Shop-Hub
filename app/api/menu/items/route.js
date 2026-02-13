import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Shop from '@/models/Shop';

// GET menu items for a shop
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const categoryId = searchParams.get('categoryId');

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      );
    }

    const query = { shopId };
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const items = await MenuItem.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST create menu item
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
    const { shopId, categoryId, name, description, price, imageUrl } = data;

    if (!shopId || !categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Shop ID, category ID, name, and price are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify shop ownership
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.ownerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const item = await MenuItem.create({
      shopId,
      categoryId,
      name,
      description,
      price,
      imageUrl,
    });

    return NextResponse.json(
      {
        message: 'Menu item created successfully',
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create menu item error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}


// PUT update menu item
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { name, description, price, imageUrl, categoryId, isAvailable } = data;

    await connectDB();

    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Verify shop ownership
    const shop = await Shop.findById(item.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (
      shop.ownerId.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update fields if provided
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (categoryId !== undefined) item.categoryId = categoryId;
    if (isAvailable !== undefined) item.isAvailable= isAvailable;
    await item.save();

    return NextResponse.json(
      {
        message: 'Menu item updated successfully',
        item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update menu item error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE menu item
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Verify shop ownership
    const shop = await Shop.findById(item.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (
      shop.ownerId.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await MenuItem.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete menu item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}

