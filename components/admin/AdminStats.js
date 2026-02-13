'use client';

export default function AdminStats({ stats }) {
  const statCards = [
    {
      icon: '🏪',
      label: 'Total Shops',
      value: stats.totalShops,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      icon: '✅',
      label: 'Active Shops',
      value: stats.activeShops,
      color: 'bg-green-100 text-green-800',
    },
    {
      icon: '❌',
      label: 'Inactive Shops',
      value: stats.inactiveShops,
      color: 'bg-red-100 text-red-800',
    },
    {
      icon: '👥',
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      icon: '👁️',
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      color: 'bg-orange-100 text-orange-800',
    },
    {
      icon: '🗺️',
      label: 'Map Clicks',
      value: stats.totalMapClicks.toLocaleString(),
      color: 'bg-teal-100 text-teal-800',
    },
    {
      icon: '🔗',
      label: 'Unique Visitors',
      value: stats.totalUniqueVisitors.toLocaleString(),
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      icon: '📊',
      label: 'Avg Click Rate',
      value: stats.totalViews > 0 
        ? `${((stats.totalMapClicks / stats.totalViews) * 100).toFixed(1)}%`
        : '0%',
      color: 'bg-pink-100 text-pink-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl ${stat.color} flex items-center justify-center text-3xl`}>
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-coffee-medium mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-coffee-dark">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
