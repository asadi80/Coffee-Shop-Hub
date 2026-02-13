import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import MenuItem from '@/models/MenuItem';
import MenuCategory from '@/models/MenuCategory';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const shop = await Shop.findById(params.id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Delete all associated menu items and categories
    await MenuItem.deleteMany({ shopId: params.id });
    await MenuCategory.deleteMany({ shopId: params.id });
    
    // Delete the shop
    await Shop.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Shop and all associated data deleted successfully',
      },
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
