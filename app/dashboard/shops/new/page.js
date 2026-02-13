"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  reverseGeocode,
  getCurrentLocation as getGeoLocation,
} from "@/lib/geocoding";

// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker"),
  { ssr: false },
);

export default function NewShopPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
    logoUrl: "",
    openingHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "17:00", closed: false },
      sunday: { open: "10:00", close: "17:00", closed: false },
    },
  });
  
  useEffect(() => {
 getCurrentLocation();
}, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        console.error("Location error:", error);
        alert("Unable to retrieve your location");
      },
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });

    // Reverse geocode to get address
    fetchAddressFromCoordinates(lat, lng);
  };

  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng);

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          address: result.formatted || result.displayName,
          latitude: lat,
          longitude: lng,
        }));
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      // Don't show error to user, just use coordinates without address
    }
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    setError("");

    try {
      const result = await getGeoLocation();

      if (result.success) {
        handleLocationChange(result.lat, result.lng);
      }
    } catch (error) {
      setError(
        "Unable to get your location. Please select manually on the map.",
      );
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
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "coffee-shop-hub/logos");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
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
    setError("");

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create shop");
      }

      router.push("/dashboard/shops");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/shops"
            className="inline-flex items-center gap-2 text-coffee-medium hover:text-accent-orange transition-colors mb-4"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold text-coffee-dark">
            Create New Coffee Shop
          </h1>
          <p className="text-coffee-medium mt-2">
            Fill in the details to add your coffee shop
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
                  placeholder="Blue Moon Coffee"
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
                  placeholder="Tell customers about your coffee shop..."
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
                  placeholder="123 Main St, San Francisco, CA"
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
                  placeholder="+1 (555) 123-4567"
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
                    onClick={() => setFormData({ ...formData, logoUrl: "" })}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div>
                <label className="block">
                  <span className="btn-secondary inline-block cursor-pointer">
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-coffee-light mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
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
                Click on the map to set your shop's location
              </p>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {gettingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Getting location...
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    Use My Location
                  </>
                )}
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
                <span className="text-coffee-medium">Latitude:</span>{" "}
                <span className="font-mono">
                  {formData.latitude
                    ? Number(formData.latitude).toFixed(6)
                    : "Not set"}
                </span>
              </div>
              <div>
                <span className="text-coffee-medium">Longitude:</span>{" "}
                <span className="font-mono">
                  {formData.longitude
                    ? Number(formData.longitude).toFixed(6)
                    : "Not set"}
                </span>
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
                        handleHoursChange(day, "closed", e.target.checked)
                      }
                      className="w-4 h-4 text-coffee-dark border-cream-dark rounded focus:ring-coffee-dark"
                    />
                    <span className="text-sm text-coffee-medium">Closed</span>
                  </label>

                  {!formData.openingHours[day].closed && (
                    <>
                      <input
                        type="time"
                        value={formData.openingHours[day].open}
                        onChange={(e) =>
                          handleHoursChange(day, "open", e.target.value)
                        }
                        className="px-3 py-2 border-2 border-cream-dark rounded-lg focus:outline-none focus:border-coffee-medium"
                      />
                      <span className="text-coffee-medium">to</span>
                      <input
                        type="time"
                        value={formData.openingHours[day].close}
                        onChange={(e) =>
                          handleHoursChange(day, "close", e.target.value)
                        }
                        className="px-3 py-2 border-2 border-cream-dark rounded-lg focus:outline-none focus:border-coffee-medium"
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
                  placeholder="https://yourshop.com"
                />
              </div>

              <div>
                <label htmlFor="instagram" className="label">
                  Instagram Username
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg text-coffee-medium">
                    @
                  </span>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="input-field rounded-l-none flex-1"
                    placeholder="yourshop"
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
                  placeholder="yourshop"
                />
              </div>

              <div>
                <label htmlFor="twitter" className="label">
                  Twitter/X Handle
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-cream-dark border-2 border-r-0 border-cream-dark rounded-l-lg text-coffee-medium">
                    @
                  </span>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="input-field rounded-l-none flex-1"
                    placeholder="yourshop"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/dashboard/shops"
              className="px-6 py-3 rounded-lg text-coffee-medium font-semibold hover:bg-cream-dark transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Coffee Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
