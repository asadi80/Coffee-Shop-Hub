import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  address: {
    type: String,
    required: [false, 'Address is required'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates',
      },
    },
  },
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
  },
  phone: {
    type: String,
    trim: true,
  },
  socialLinks: {
    website: String,
    instagram: String,
    facebook: String,
    twitter: String,
  },
  logoUrl: {
    type: String,
  },
  images: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  analytics: {
    views: { type: Number, default: 0 },
    mapClicks: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    lastVisitors: [{ 
      ip: String, 
      timestamp: { type: Date, default: Date.now } 
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
ShopSchema.index({ location: '2dsphere' });

// Compound index for efficient owner queries
ShopSchema.index({ ownerId: 1, isActive: 1 });

// Update timestamp on save
ShopSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find nearby shops
ShopSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // in meters
      },
    },
  });
};

// Method to increment view count
ShopSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to increment map clicks
ShopSchema.methods.incrementMapClicks = async function() {
  this.analytics.mapClicks += 1;
  await this.save();
};

export default mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
