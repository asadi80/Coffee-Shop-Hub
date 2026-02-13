'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  { ssr: false }
);

export default function AdminShopEditForm({ shop }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: shop.name || '',
    description: shop.description || '',
    address: shop.address || '',
    latitude: shop.location?.coordinates[1] || 37.7749,
    longitude: shop.location?.coordinates[0] || -122.4194,
    phone: shop.phone || '',
    website: shop.socialLinks?.website || '',
    instagram: shop.socialLinks?.instagram || '',
    facebook: shop.socialLinks?.facebook || '',
    twitter: shop.socialLinks?.twitter || '',
    logoUrl: shop.logoUrl || '',
    isActive: shop.isActive ?? true,
    openingHours: shop.openingHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '17:00', closed: false },
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value,
        },
      },
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', 'coffee-shop-hub/logos');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      setSuccess('Logo uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/shops/${shop._id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          phone: formData.phone,
          socialLinks: {
            website: formData.website,
            instagram: formData.instagram,
            facebook: formData.facebook,
            twitter: formData.twitter,
          },
          logoUrl: formData.logoUrl,
          openingHours: formData.openingHours,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update shop');
      }

      setSuccess('Shop updated successfully!');
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 animate-shake">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="card p-6">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
          Basic Information
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="label">
              Shop Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="address" className="label">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-coffee-dark border-cream-dark rounded focus:ring-coffee-dark"
              />
              <span className="font-semibold text-coffee-dark">
                Shop is Active (visible to public)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="card p-6">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
          Shop Logo
        </h2>

        <div className="space-y-4">
          {formData.logoUrl && (
            <div className="flex items-center gap-4">
              <img
                src={formData.logoUrl}
                alt="Shop logo"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, logoUrl: '' })}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          <div>
            <label className="block">
              <span className="btn-secondary inline-block cursor-pointer">
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card p-6">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
          Location
        </h2>

        <p className="text-sm text-coffee-medium mb-4">
          Click on the map to update shop location
        </p>

        <div className="h-96 rounded-lg overflow-hidden mb-4">
          <LocationPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationChange={handleLocationChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-coffee-medium">Latitude:</span>{' '}
            <span className="font-mono">{formData.latitude.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-coffee-medium">Longitude:</span>{' '}
            <span className="font-mono">{formData.longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="card p-6">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
          Opening Hours
        </h2>

        <div className="space-y-4">
          {Object.keys(formData.openingHours).map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28">
                <span className="font-medium text-coffee-dark capitalize">
                  {day}
                </span>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.openingHours[day].closed}
                  onChange={(e) =>
                    handleHoursChange(day, 'closed', e.target.checked)
                  }
                  className="w-4 h-4 text-coffee-dark border-cream-dark rounded"
                />
                <span className="text-sm text-coffee-medium">Closed</span>
              </label>

              {!formData.openingHours[day].closed && (
                <>
                  <input
                    type="time"
                    value={formData.openingHours[day].open}
                    onChange={(e) =>
                      handleHoursChange(day, 'open', e.target.value)
                    }
                    className="px-3 py-2 border-2 border-cream-dark rounded-lg"
                  />
                  <span className="text-coffee-medium">to</span>
                  <input
                    type="time"
                    value={formData.openingHours[day].close}
                    onChange={(e) =>
                      handleHoursChange(day, 'close', e.target.value)
                    }
                    className="px-3 py-2 border-2 border-cream-dark rounded-lg"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="card p-6">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
          Social Media & Website
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="website" className="label">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="label">
              Instagram Username
            </label>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg">
                @
              </span>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="input-field rounded-l-none flex-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="facebook" className="label">
              Facebook Page
            </label>
            <input
              type="text"
              id="facebook"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="label">
              Twitter/X Handle
            </label>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg">
                @
              </span>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="input-field rounded-l-none flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 justify-end">
        <a
          href="/admin"
          className="px-6 py-3 rounded-lg text-coffee-medium font-semibold hover:bg-cream-dark transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </form>
  );
}
