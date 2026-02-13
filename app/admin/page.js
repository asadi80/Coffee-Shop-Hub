import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';
import AdminMapView from '@/components/admin/AdminMapView';
import AdminStats from '@/components/admin/AdminStats';
import AdminShopList from '@/components/admin/AdminShopList';



async function getAdminData() {
  await connectDB();
  
  const [shops, users] = await Promise.all([
    Shop.find({})
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .lean(),
    User.find({}).select('-password').lean(),
  ]);

  return {
    shops: JSON.parse(JSON.stringify(shops)),
    users: JSON.parse(JSON.stringify(users)),
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { shops, users } = await getAdminData();

  // Calculate statistics
  const stats = {
    totalShops: shops.length,
    activeShops: shops.filter(s => s.isActive).length,
    inactiveShops: shops.filter(s => !s.isActive).length,
    totalUsers: users.length,
    totalOwners: users.filter(u => u.role === 'owner').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalViews: shops.reduce((sum, shop) => sum + (shop.analytics?.views || 0), 0),
    totalMapClicks: shops.reduce((sum, shop) => sum + (shop.analytics?.mapClicks || 0), 0),
    totalUniqueVisitors: shops.reduce((sum, shop) => sum + (shop.analytics?.uniqueVisitors || 0), 0),
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-coffee-dark to-coffee-medium text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-2">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-white/80">
            Manage all coffee shops and users across the platform
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <AdminStats stats={stats} />

        {/* Map View */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-coffee-dark">
                All Shops on Map
              </h2>
              <p className="text-coffee-medium mt-1">
                Global view of all coffee shops
              </p>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <AdminMapView shops={shops} />
          </div>
        </div>

        {/* Shop List */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-coffee-dark mb-6">
            Shop Management
          </h2>
          <AdminShopList shops={shops} />
        </div>
      </div>
    </div>
  );
}
