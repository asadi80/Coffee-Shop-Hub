'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminShopList({ shops: initialShops }) {
  const router = useRouter();
  const [shops, setShops] = useState(initialShops);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(null);

  const filteredShops = shops
    .filter(shop => {
      if (filter === 'active') return shop.isActive;
      if (filter === 'inactive') return !shop.isActive;
      return true;
    })
    .filter(shop => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        shop.name.toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.ownerId?.name?.toLowerCase().includes(query) ||
        shop.ownerId?.email?.toLowerCase().includes(query)
      );
    });

  const handleToggleStatus = async (shopId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this shop?`)) {
      return;
    }

    setLoading(shopId);

    try {
      const response = await fetch(`/api/admin/shops/${shopId}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to update shop status');

      // Update local state
      setShops(shops.map(shop => 
        shop._id === shopId 
          ? { ...shop, isActive: !currentStatus }
          : shop
      ));

      router.refresh();
    } catch (error) {
      console.error('Error toggling shop status:', error);
      alert('Failed to update shop status');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteShop = async (shopId, shopName) => {
    if (!confirm(`Are you sure you want to permanently DELETE "${shopName}"? This action cannot be undone!`)) {
      return;
    }

    setLoading(shopId);

    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete shop');

      // Remove from local state
      setShops(shops.filter(shop => shop._id !== shopId));
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Failed to delete shop');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, address, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-coffee-dark text-white'
                  : 'bg-cream text-coffee-medium hover:bg-cream-dark'
              }`}
            >
              All ({shops.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-cream text-coffee-medium hover:bg-cream-dark'
              }`}
            >
              Active ({shops.filter(s => s.isActive).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-cream text-coffee-medium hover:bg-cream-dark'
              }`}
            >
              Inactive ({shops.filter(s => !s.isActive).length})
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-coffee-medium">
          Showing {filteredShops.length} of {shops.length} shops
        </div>
      </div>

      {/* Shop List */}
      <div className="space-y-4">
        {filteredShops.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-serif font-bold text-coffee-dark mb-2">
              No Shops Found
            </h3>
            <p className="text-coffee-medium">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div key={shop._id} className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-coffee-dark mb-1">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-coffee-medium">
                        {shop.address}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      shop.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shop.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>

                  {/* Owner Info */}
                  <div className="mb-4 p-3 bg-cream rounded-lg">
                    <p className="text-sm">
                      <strong className="text-coffee-dark">Owner:</strong>{' '}
                      <span className="text-coffee-medium">
                        {shop.ownerId?.name || 'Unknown'} ({shop.ownerId?.email || 'N/A'})
                      </span>
                    </p>
                  </div>

                  {/* Analytics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-cream rounded-lg p-3">
                      <div className="text-xs text-coffee-medium mb-1">Views</div>
                      <div className="text-xl font-bold text-coffee-dark">
                        {shop.analytics?.views || 0}
                      </div>
                    </div>
                    <div className="bg-cream rounded-lg p-3">
                      <div className="text-xs text-coffee-medium mb-1">Map Clicks</div>
                      <div className="text-xl font-bold text-coffee-dark">
                        {shop.analytics?.mapClicks || 0}
                      </div>
                    </div>
                    <div className="bg-cream rounded-lg p-3">
                      <div className="text-xs text-coffee-medium mb-1">Visitors</div>
                      <div className="text-xl font-bold text-coffee-dark">
                        {shop.analytics?.uniqueVisitors || 0}
                      </div>
                    </div>
                    <div className="bg-cream rounded-lg p-3">
                      <div className="text-xs text-coffee-medium mb-1">Click Rate</div>
                      <div className="text-xl font-bold text-coffee-dark">
                        {shop.analytics?.views > 0
                          ? `${((shop.analytics.mapClicks / shop.analytics.views) * 100).toFixed(1)}%`
                          : '0%'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`/shop/${shop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-coffee-dark text-white px-4 py-2 rounded-lg hover:bg-coffee-medium transition-colors font-medium"
                    >
                      👁️ View Public Page
                    </a>

                    <button
                      onClick={() => handleToggleStatus(shop._id, shop.isActive)}
                      disabled={loading === shop._id}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        shop.isActive
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {loading === shop._id ? (
                        'Processing...'
                      ) : shop.isActive ? (
                        '🚫 Deactivate Shop'
                      ) : (
                        '✅ Activate Shop'
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteShop(shop._id, shop.name)}
                      disabled={loading === shop._id}
                      className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                    >
                      🗑️ Delete
                    </button>

                    <a
                      href={`https://www.google.com/maps?q=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/90 transition-colors font-medium"
                    >
                      📍 View on Map
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
