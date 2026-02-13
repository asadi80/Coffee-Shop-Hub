import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

export async function POST(request, { params }) {
  const { id } = await params; 
  try {
    await connectDB();

    // Get visitor IP (use x-forwarded-for in production)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if this IP visited in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVisitor = shop.analytics.lastVisitors?.find(
      (visitor) => visitor.ip === ip && visitor.timestamp > oneDayAgo
    );

    // Increment views
    shop.analytics.views += 1;

    // If new unique visitor (hasn't visited in 24h)
    if (!recentVisitor) {
      shop.analytics.uniqueVisitors += 1;
      
      // Add to recent visitors list (keep last 100)
      if (!shop.analytics.lastVisitors) {
        shop.analytics.lastVisitors = [];
      }
      shop.analytics.lastVisitors.push({ ip, timestamp: new Date() });
      
      // Keep only last 100 visitors
      if (shop.analytics.lastVisitors.length > 100) {
        shop.analytics.lastVisitors = shop.analytics.lastVisitors.slice(-100);
      }
    }

    await shop.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Track visit error:', error);
    return NextResponse.json(
      { error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}
