import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  imageUrl: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
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

// Compound indexes for efficient queries
MenuItemSchema.index({ shopId: 1, categoryId: 1 });
MenuItemSchema.index({ shopId: 1, isAvailable: 1 });

// Update timestamp on save
MenuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
