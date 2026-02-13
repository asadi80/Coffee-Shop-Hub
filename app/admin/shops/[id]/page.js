import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import AdminShopEditForm from '@/components/admin/AdminShopEditForm';

async function getShop(shopId) {
  await connectDB();
  const shop = await Shop.findById(shopId).populate('ownerId', 'name email').lean();
  
  if (!shop) return null;
  
  return JSON.parse(JSON.stringify(shop));
}

export default async function AdminManageShopPage({ params }) {
  const { id } = await params; 
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const shop = await getShop(id);

  if (!shop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-coffee-medium hover:text-accent-orange transition-colors mb-4"
          >
            <span>←</span> Back to Admin Dashboard
          </a>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-coffee-dark">
                Manage Shop
              </h1>
              <p className="text-coffee-medium mt-2">
                Edit shop details and settings as administrator
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              shop.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {shop.isActive ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
            Shop Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-coffee-medium">Shop Name</p>
              <p className="font-semibold text-coffee-dark">{shop.name}</p>
            </div>
            <div>
              <p className="text-sm text-coffee-medium">Slug</p>
              <p className="font-mono text-sm text-coffee-dark">{shop.slug}</p>
            </div>
            <div>
              <p className="text-sm text-coffee-medium">Owner</p>
              <p className="font-semibold text-coffee-dark">
                {shop.ownerId?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-coffee-medium">Owner Email</p>
              <p className="text-sm text-coffee-dark">
                {shop.ownerId?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-coffee-medium">Created</p>
              <p className="text-sm text-coffee-dark">
                {new Date(shop.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-coffee-medium">Last Updated</p>
              <p className="text-sm text-coffee-dark">
                {new Date(shop.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
            Analytics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cream rounded-lg p-4">
              <p className="text-sm text-coffee-medium mb-1">Total Views</p>
              <p className="text-2xl font-bold text-coffee-dark">
                {shop.analytics?.views || 0}
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <p className="text-sm text-coffee-medium mb-1">Map Clicks</p>
              <p className="text-2xl font-bold text-coffee-dark">
                {shop.analytics?.mapClicks || 0}
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <p className="text-sm text-coffee-medium mb-1">Unique Visitors</p>
              <p className="text-2xl font-bold text-coffee-dark">
                {shop.analytics?.uniqueVisitors || 0}
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <p className="text-sm text-coffee-medium mb-1">Click Rate</p>
              <p className="text-2xl font-bold text-coffee-dark">
                {shop.analytics?.views > 0
                  ? `${((shop.analytics.mapClicks / shop.analytics.views) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <AdminShopEditForm shop={shop} />

        {/* Quick Actions */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              👁️ View Public Page
            </a>
            <a
              href={`https://www.google.com/maps?q=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              📍 View on Google Maps
            </a>
            <a
              href={`/admin`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              ← Back to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
