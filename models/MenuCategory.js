import mongoose from 'mongoose';

const MenuCategorySchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
MenuCategorySchema.index({ shopId: 1, order: 1 });

export default mongoose.models.MenuCategory || mongoose.model('MenuCategory', MenuCategorySchema);
