import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-cream-dark">
          <h1 className="text-4xl font-serif font-bold text-coffee-dark mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-coffee-medium">
            Welcome back, <span className="font-semibold">{session.user.name}</span>!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card p-6 flex items-center gap-4">
            <div className="text-5xl">🏪</div>
            <div className="flex-1">
              <p className="text-sm text-coffee-medium mb-1">Your Shops</p>
              <p className="text-3xl font-serif font-bold text-coffee-dark">0</p>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="text-5xl">📋</div>
            <div className="flex-1">
              <p className="text-sm text-coffee-medium mb-1">Menu Items</p>
              <p className="text-3xl font-serif font-bold text-coffee-dark">0</p>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="text-5xl">👁️</div>
            <div className="flex-1">
              <p className="text-sm text-coffee-medium mb-1">Total Views</p>
              <p className="text-3xl font-serif font-bold text-coffee-dark">0</p>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="text-5xl">🗺️</div>
            <div className="flex-1">
              <p className="text-sm text-coffee-medium mb-1">Map Clicks</p>
              <p className="text-3xl font-serif font-bold text-coffee-dark">0</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/shops/new"
              className="card p-8 text-center hover:border-2 hover:border-accent-orange transition-all"
            >
              <div className="text-5xl mb-4">➕</div>
              <h3 className="text-xl font-serif font-bold text-coffee-dark mb-2">
                Create New Shop
              </h3>
              <p className="text-coffee-medium text-sm">
                Add a new coffee shop to your collection
              </p>
            </Link>

            <Link
              href="/dashboard/shops"
              className="card p-8 text-center hover:border-2 hover:border-accent-orange transition-all"
            >
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="text-xl font-serif font-bold text-coffee-dark mb-2">
                Manage Shops
              </h3>
              <p className="text-coffee-medium text-sm">
                View and edit your existing shops
              </p>
            </Link>

            <Link
              href="/dashboard/settings"
              className="card p-8 text-center hover:border-2 hover:border-accent-orange transition-all"
            >
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-serif font-bold text-coffee-dark mb-2">
                Settings
              </h3>
              <p className="text-coffee-medium text-sm">
                Update your account preferences
              </p>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
            Getting Started
          </h2>

          <div className="card p-8">
            <div className="space-y-8 mb-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold text-coffee-dark mb-1">
                    Create Your First Shop
                  </h3>
                  <p className="text-coffee-medium">
                    Add your coffee shop details, location, and opening hours
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold text-coffee-dark mb-1">
                    Upload Images
                  </h3>
                  <p className="text-coffee-medium">
                    Add a logo and gallery photos to showcase your shop
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold text-coffee-dark mb-1">
                    Build Your Menu
                  </h3>
                  <p className="text-coffee-medium">
                    Create categories and add menu items with prices
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold text-coffee-dark mb-1">
                    Go Live
                  </h3>
                  <p className="text-coffee-medium">
                    Publish your shop and share it with customers
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8 border-t border-cream-dark text-center">
              <Link href="/dashboard/shops/new" className="btn-primary inline-block">
                Create Your First Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
