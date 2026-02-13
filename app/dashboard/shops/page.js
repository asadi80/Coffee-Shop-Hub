import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

async function getOwnerShops(ownerId) {
  await connectDB();
  const shops = await Shop.find({ ownerId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(shops));
}

export default async function ShopsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const shops = await getOwnerShops(session.user.id);

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-coffee-dark">
              My Coffee Shops
            </h1>
            <p className="text-coffee-medium mt-2">
              Manage your coffee shops and track performance
            </p>
          </div>
          <Link href="/dashboard/shops/new" className="btn-primary">
            + Create New Shop
          </Link>
        </div>

        {/* Shops List */}
        {shops.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-2">
              No Coffee Shops Yet
            </h2>
            <p className="text-coffee-medium mb-6">
              Create your first coffee shop to get started
            </p>
            <Link href="/dashboard/shops/new" className="btn-primary inline-block">
              Create Your First Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {shops.map((shop) => (
              <div key={shop._id} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {shop.logoUrl ? (
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-cream-dark rounded-lg flex items-center justify-center text-4xl">
                        ☕
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-coffee-dark">
                          {shop.name}
                        </h3>
                        <p className="text-coffee-medium text-sm">
                          {shop.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            shop.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {shop.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {shop.description && (
                      <p className="text-coffee-medium text-sm mb-4 line-clamp-2">
                        {shop.description}
                      </p>
                    )}

                    {/* Analytics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-cream rounded-lg p-3">
                        <div className="text-2xl mb-1">👁️</div>
                        <div className="text-2xl font-bold text-coffee-dark">
                          {shop.analytics?.views || 0}
                        </div>
                        <div className="text-xs text-coffee-medium">
                          Total Views
                        </div>
                      </div>

                      <div className="bg-cream rounded-lg p-3">
                        <div className="text-2xl mb-1">🗺️</div>
                        <div className="text-2xl font-bold text-coffee-dark">
                          {shop.analytics?.mapClicks || 0}
                        </div>
                        <div className="text-xs text-coffee-medium">
                          Map Clicks
                        </div>
                      </div>

                      <div className="bg-cream rounded-lg p-3">
                        <div className="text-2xl mb-1">🔗</div>
                        <div className="text-2xl font-bold text-coffee-dark">
                          {shop.analytics?.uniqueVisitors || 0}
                        </div>
                        <div className="text-xs text-coffee-medium">
                          Unique Visitors
                        </div>
                      </div>

                      <div className="bg-cream rounded-lg p-3">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-2xl font-bold text-coffee-dark">
                          {((shop.analytics?.mapClicks || 0) / Math.max(shop.analytics?.views || 1, 1) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-coffee-medium">
                          Click Rate
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/shop/${shop.slug}`}
                        target="_blank"
                        className="text-sm text-accent-orange hover:text-coffee-dark font-medium flex items-center gap-1"
                      >
                        View Public Page →
                      </Link>
                      <Link
                        href={`/dashboard/shops/${shop._id}`}
                        className="text-sm text-coffee-medium hover:text-coffee-dark font-medium flex items-center gap-1"
                      >
                        Edit Details
                      </Link>
                      <Link
                        href={`/dashboard/shops/${shop._id}/menu`}
                        className="text-sm text-coffee-medium hover:text-coffee-dark font-medium flex items-center gap-1"
                      >
                        Manage Menu
                      </Link>
                      <Link
                        href={`/dashboard/shops/${shop._id}/analytics`}
                        className="text-sm text-coffee-medium hover:text-coffee-dark font-medium flex items-center gap-1"
                      >
                        View Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
