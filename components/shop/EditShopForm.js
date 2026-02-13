'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { reverseGeocode, getCurrentLocation as getGeoLocation } from '@/lib/geocoding';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  { ssr: false }
);

export default function EditShopForm({ shop }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: shop.name || '',
    description: shop.description || '',
    address: shop.address || '',
    latitude: shop.location?.coordinates?.[1] || 37.7749,
    longitude: shop.location?.coordinates?.[0] || -122.4194,
    phone: shop.phone || '',
    website: shop.socialLinks?.website || '',
    instagram: shop.socialLinks?.instagram || '',
    facebook: shop.socialLinks?.facebook || '',
    twitter: shop.socialLinks?.twitter || '',
    logoUrl: shop.logoUrl || '',
    isActive: shop.isActive !== undefined ? shop.isActive : true,
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
    fetchAddressFromCoordinates(lat, lng);
  };

  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng);
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          address: result.formatted || result.displayName,
          latitude: lat,
          longitude: lng,
        }));
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    }
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    setError('');

    try {
      const result = await getGeoLocation();
      if (result.success) {
        handleLocationChange(result.lat, result.lng);
      }
    } catch (error) {
      setError('Unable to get your location. Please select manually on the map.');
    } finally {
      setGettingLocation(false);
    }
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

    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('folder', 'coffee-shop-hub/logos');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
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

    try {
      console.log(formData);
      const response = await fetch(`/api/shops/${shop._id}`, {
        
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

      router.push('/dashboard/shops');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/shops/${shop._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shop');
      }

      router.push('/dashboard/shops');
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/shops"
          className="inline-flex items-center gap-2 text-coffee-medium hover:text-accent-orange transition-colors mb-4"
        >
          <span>←</span> Back to My Shops
        </Link>
        <h1 className="text-4xl font-serif font-bold text-coffee-dark">
          Edit Coffee Shop
        </h1>
        <p className="text-coffee-medium mt-2">
          Update your shop details
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Status Toggle */}
        <div className="card p-6">
          <h2 className="text-2xl font-serif font-bold text-coffee-dark mb-6">
            Shop Status
          </h2>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-accent-green transition-colors"></div>
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
            <div>
              <span className="font-semibold text-coffee-dark">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
              <p className="text-sm text-coffee-medium">
                {formData.isActive ? 'Your shop is visible to customers' : 'Your shop is hidden from customers'}
              </p>
            </div>
          </label>
        </div>

        {/* Basic Information - Same as create page */}
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
          </div>
        </div>

        {/* Logo Upload */}
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
            Location *
          </h2>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-coffee-medium">
              Click on the map to update your shop's location
            </p>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {gettingLocation ? 'Getting...' : '📍 Use My Location'}
            </button>
          </div>

          <div className="h-96 rounded-lg overflow-hidden">
            <LocationPicker
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
                    className="w-4 h-4"
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
              <label htmlFor="website" className="label">Website URL</label>
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
              <label htmlFor="instagram" className="label">Instagram Username</label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg">@</span>
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
              <label htmlFor="facebook" className="label">Facebook Page</label>
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
              <label htmlFor="twitter" className="label">Twitter/X Handle</label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg">@</span>
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Delete Shop
          </button>
          
          <div className="flex gap-4">
            <Link
              href="/dashboard/shops"
              className="px-6 py-3 rounded-lg text-coffee-medium font-semibold hover:bg-cream-dark transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
