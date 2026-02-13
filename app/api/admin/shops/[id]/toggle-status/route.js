import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

export async function POST(request, { params }) {
  const { id } = await params; 
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

    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Toggle active status
    shop.isActive = !shop.isActive;
    await shop.save();

    return NextResponse.json(
      {
        success: true,
        isActive: shop.isActive,
        message: `Shop ${shop.isActive ? 'activated' : 'deactivated'} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Toggle shop status error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle shop status' },
      { status: 500 }
    );
  }
}
