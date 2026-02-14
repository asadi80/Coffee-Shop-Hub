import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Shop from "@/models/Shop";
import MenuItem from "@/models/MenuItem";
import MenuCategory from "@/models/MenuCategory";
import { formatPrice, isShopOpen } from "@/lib/utils";
import {QRCodeSVG} from "qrcode.react";

async function getShopBySlug(slug) {
  await connectDB();
  const shop = await Shop.findOne({ slug, isActive: true }).lean();

  if (!shop) return null;

  // Track visit
  await Shop.findByIdAndUpdate(shop._id, {
    $inc: { "analytics.views": 1 },
  });

  return JSON.parse(JSON.stringify(shop));
}

async function getShopMenu(shopId) {
  await connectDB();

  const categories = await MenuCategory.find({ shopId })
    .sort({ order: 1 })
    .lean();

  const items = await MenuItem.find({ shopId })
    .populate("categoryId", "name")
    .lean();

  return {
    categories: JSON.parse(JSON.stringify(categories)),
    items: JSON.parse(JSON.stringify(items)),
  };
}

export default async function ShopPublicPage({ params }) {
  const { slug } = await params; // unwrap params

  const shop = await getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const { categories, items } = await getShopMenu(shop._id);
  const shopIsOpen = isShopOpen(shop.openingHours);

  // Group items by category
  const menuByCategory = categories.map((category) => ({
    ...category,
    items: items.filter(
      (item) =>
        item.categoryId._id.toString() === category._id.toString() &&
        item.isAvailable,
    ),
  }));

  // Generate the full URL for QR code
  const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://coffee-shop-hub.vercel.app'}/shop/${slug}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-coffee-dark via-coffee-medium to-coffee-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Logo */}
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-2xl flex items-center justify-center text-6xl border-4 border-white/20">
                ☕
              </div>
            )}

            {/* Shop Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
                {shop.name}
              </h1>

              {shop.description && (
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                  {shop.description}
                </p>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                {shopIsOpen !== null && (
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      shopIsOpen
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {shopIsOpen ? "🟢 Open Now" : "🔴 Closed"}
                  </span>
                )}
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-white/80 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{shop.address}</span>
                </div>
                {shop.phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a
                      href={`tel:${shop.phone}`}
                      className="hover:text-accent-orange transition-colors"
                    >
                      {shop.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Actions Card */}
              <div className="card p-6">
                <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
                  Visit Us
                </h2>

                <div className="space-y-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center inline-block"
                  >
                    🗺️ Get Directions
                  </a>
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="btn-secondary w-full text-center inline-block"
                    >
                      📞 Call Now
                    </a>
                  )}
                </div>
              </div>

              {/* QR Code Card */}
              <div className="card p-6">
                <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
                  Share This Page
                </h2>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <QRCodeSVG
                      value={shopUrl}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-coffee-medium mt-3 text-center">
                    Scan to view this page on your phone
                  </p>
                </div>
              </div>

              {/* Opening Hours */}
              {shop.openingHours && (
                <div className="card p-6">
                  <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
                    Opening Hours
                  </h2>

                  <div className="space-y-2 text-sm">
                    {Object.entries(shop.openingHours).map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium text-coffee-medium capitalize">
                          {day}
                        </span>
                        <span className="text-coffee-dark">
                          {hours.closed ? (
                            <span className="text-red-600">Closed</span>
                          ) : (
                            `${hours.open} - ${hours.close}`
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(shop.socialLinks?.website ||
                shop.socialLinks?.instagram ||
                shop.socialLinks?.facebook ||
                shop.socialLinks?.twitter) && (
                <div className="card p-6">
                  <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
                    Connect With Us
                  </h2>

                  <div className="space-y-3">
                    {shop.socialLinks.website && (
                      <a
                        href={shop.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-coffee-medium hover:text-accent-orange transition-colors"
                      >
                        <span className="text-xl">🌐</span>
                        <span className="font-medium">Website</span>
                      </a>
                    )}

                    {shop.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${shop.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-coffee-medium hover:text-accent-orange transition-colors"
                      >
                        <span className="text-xl">📸</span>
                        <span className="font-medium">
                          @{shop.socialLinks.instagram}
                        </span>
                      </a>
                    )}

                    {shop.socialLinks.facebook && (
                      <a
                        href={`https://facebook.com/${shop.socialLinks.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-coffee-medium hover:text-accent-orange transition-colors"
                      >
                        <span className="text-xl">👥</span>
                        <span className="font-medium">Facebook</span>
                      </a>
                    )}

                    {shop.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${shop.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-coffee-medium hover:text-accent-orange transition-colors"
                      >
                        <span className="text-xl">🐦</span>
                        <span className="font-medium">
                          @{shop.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {shop.images && shop.images.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-serif font-bold text-coffee-dark mb-4">
                    Gallery
                  </h2>

                  <div className="grid grid-cols-2 gap-2">
                    {shop.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${shop.name} - Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-bold text-coffee-dark mb-2">
                Our Menu
              </h2>
              <p className="text-coffee-medium">
                Discover our delicious offerings
              </p>
            </div>

            {menuByCategory.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-serif font-bold text-coffee-dark mb-2">
                  Menu Coming Soon
                </h3>
                <p className="text-coffee-medium">
                  We're working on our menu. Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {menuByCategory.map(
                  (category) =>
                    category.items.length > 0 && (
                      <div key={category._id} className="card p-6">
                        <h3 className="text-2xl font-serif font-bold text-coffee-dark mb-6 pb-3 border-b-2 border-cream-dark">
                          {category.name}
                        </h3>

                        <div className="space-y-4">
                          {category.items.map((item) => (
                            <div key={item._id} className="flex gap-4 group">
                              {/* Item Image */}
                              {/* Item Image */}
                              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-cream-dark">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    ☕
                                  </div>
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-lg text-coffee-dark group-hover:text-accent-orange transition-colors">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="text-sm text-coffee-medium mt-1 line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="font-bold text-lg text-accent-orange flex-shrink-0">
                                    {formatPrice(item.price)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-coffee-dark text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Visit {shop.name} Today!
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">{shop.address}</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-block"
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Shop Not Found",
    };
  }

  return {
    title: `${shop.name} - Coffee Shop Hub`,
    description: shop.description || `Visit ${shop.name} at ${shop.address}`,
    openGraph: {
      title: shop.name,
      description: shop.description || `Visit ${shop.name}`,
      images: shop.logoUrl ? [shop.logoUrl] : [],
    },
  };
}