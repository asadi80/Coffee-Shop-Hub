import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

export async function POST(request, { params }) {
  const { id } = await params; 
  try {
    await connectDB();

    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Increment map clicks
    shop.analytics.mapClicks += 1;
    await shop.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
