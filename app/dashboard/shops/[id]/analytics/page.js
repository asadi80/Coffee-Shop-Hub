import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Link from 'next/link';

async function getShop(shopId, userId) {
  await connectDB();
  const shop = await Shop.findOne({ _id: shopId, ownerId: userId }).lean();
  return shop ? JSON.parse(JSON.stringify(shop)) : null;
}

export default async function AnalyticsPage({ params }) {
  const { id } = await params; 
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const shop = await getShop(id, session.user.id);

  if (!shop) {
    redirect('/dashboard/shops');
  }

  const analytics = shop.analytics || {};
  const views = analytics.views || 0;
  const mapClicks = analytics.mapClicks || 0;
  const uniqueVisitors = analytics.uniqueVisitors || 0;
  const clickRate = views > 0 ? ((mapClicks / views) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/shops"
            className="inline-flex items-center gap-2 text-coffee-medium hover:text-accent-orange transition-colors mb-4"
          >
            <span>←</span> Back to My Shops
          </Link>
          <h1 className="text-4xl font-serif font-bold text-coffee-dark">
            Analytics Dashboard
          </h1>
          <p className="text-coffee-medium mt-2">{shop.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Views */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👁️</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-coffee-dark font-serif">
                  {views.toLocaleString()}
                </div>
                <div className="text-sm text-coffee-medium">Total Views</div>
              </div>
            </div>
            <div className="pt-4 border-t border-cream-dark">
              <p className="text-xs text-coffee-light">
                Number of times your shop page was viewed
              </p>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🔗</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-coffee-dark font-serif">
                  {uniqueVisitors.toLocaleString()}
                </div>
                <div className="text-sm text-coffee-medium">Unique Visitors</div>
              </div>
            </div>
            <div className="pt-4 border-t border-cream-dark">
              <p className="text-xs text-coffee-light">
                Different people who visited (24h window)
              </p>
            </div>
          </div>

          {/* Map Clicks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🗺️</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-coffee-dark font-serif">
                  {mapClicks.toLocaleString()}
                </div>
                <div className="text-sm text-coffee-medium">Map Clicks</div>
              </div>
            </div>
            <div className="pt-4 border-t border-cream-dark">
              <p className="text-xs text-coffee-light">
                Times "Get Directions" was clicked
              </p>
            </div>
          </div>

          {/* Click Rate */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📊</div>
              <div className="text-right">
                <div className="text-3xl font-bold text-coffee-dark font-serif">
                  {clickRate}%
                </div>
                <div className="text-sm text-coffee-medium">Click Rate</div>
              </div>
            </div>
            <div className="pt-4 border-t border-cream-dark">
              <p className="text-xs text-coffee-light">
                Percentage of views that clicked directions
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Engagement */}
          <div className="card p-6">
            <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
              Engagement Metrics
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-coffee-medium">Views to Unique Visitors</span>
                  <span className="font-semibold text-coffee-dark">
                    {uniqueVisitors > 0 ? (views / uniqueVisitors).toFixed(1) : 0}x
                  </span>
                </div>
                <div className="w-full bg-cream-dark rounded-full h-2">
                  <div
                    className="bg-accent-green h-2 rounded-full"
                    style={{
                      width: `${uniqueVisitors > 0 ? Math.min((views / uniqueVisitors) * 20, 100) : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-coffee-light mt-1">
                  Average views per unique visitor
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-coffee-medium">Direction Click Rate</span>
                  <span className="font-semibold text-coffee-dark">{clickRate}%</span>
                </div>
                <div className="w-full bg-cream-dark rounded-full h-2">
                  <div
                    className="bg-accent-orange h-2 rounded-full"
                    style={{ width: `${clickRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-coffee-light mt-1">
                  Visitors who wanted directions
                </p>
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="card p-6">
            <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
              Shop Status
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-coffee-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  shop.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-coffee-medium">Created</span>
                <span className="font-semibold text-coffee-dark">
                  {new Date(shop.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-coffee-medium">Last Updated</span>
                <span className="font-semibold text-coffee-dark">
                  {new Date(shop.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4 border-t border-cream-dark">
                <Link
                  href={`/shop/${shop.slug}`}
                  target="_blank"
                  className="text-accent-orange hover:text-coffee-dark font-medium flex items-center gap-2"
                >
                  View Public Page →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="card p-6">
          <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
            Performance Insights
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-cream rounded-lg">
              <div className="text-3xl mb-2">
                {clickRate >= 10 ? '🎉' : clickRate >= 5 ? '👍' : '💡'}
              </div>
              <h3 className="font-semibold text-coffee-dark mb-2">
                Direction Engagement
              </h3>
              <p className="text-sm text-coffee-medium">
                {clickRate >= 10
                  ? 'Excellent! Many visitors want directions'
                  : clickRate >= 5
                  ? 'Good engagement with your location'
                  : 'Consider highlighting your location more'}
              </p>
            </div>

            <div className="text-center p-6 bg-cream rounded-lg">
              <div className="text-3xl mb-2">
                {uniqueVisitors >= 50 ? '🚀' : uniqueVisitors >= 10 ? '📈' : '🌱'}
              </div>
              <h3 className="font-semibold text-coffee-dark mb-2">
                Visitor Growth
              </h3>
              <p className="text-sm text-coffee-medium">
                {uniqueVisitors >= 50
                  ? 'Great! You have strong visitor interest'
                  : uniqueVisitors >= 10
                  ? 'Growing! Share your shop page more'
                  : 'Just starting - promote your shop!'}
              </p>
            </div>

            <div className="text-center p-6 bg-cream rounded-lg">
              <div className="text-3xl mb-2">
                {views / Math.max(uniqueVisitors, 1) >= 2 ? '⭐' : '📊'}
              </div>
              <h3 className="font-semibold text-coffee-dark mb-2">
                Return Visitors
              </h3>
              <p className="text-sm text-coffee-medium">
                {views / Math.max(uniqueVisitors, 1) >= 2
                  ? 'People are returning to your page!'
                  : 'Build loyalty with regular updates'}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card p-6 mt-6 bg-gradient-to-br from-accent-orange to-coffee-medium text-white">
          <h2 className="text-2xl font-serif font-bold mb-4">
            💡 Tips to Increase Visibility
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Share your shop link on social media</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Keep your menu updated with photos and descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Ensure your opening hours are accurate</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Add high-quality photos of your shop</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Respond to customer inquiries promptly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
