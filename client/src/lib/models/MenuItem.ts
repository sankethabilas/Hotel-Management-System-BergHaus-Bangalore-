import mongoose, { Document, Schema } from 'mongoose'

// Interface for MenuItem document
export interface IMenuItem extends Document {
  name: string
  description: string
  price: number
  category: 'starters' | 'mains' | 'desserts' | 'beverages' | 'specials'
  isAvailable: boolean
  image?: string
  ingredients: string[]
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: 'none' | 'mild' | 'medium' | 'hot' | 'very-hot'
  preparationTime: number
  calories?: number
  isPopular: boolean
  discount?: number
  tags: string[]
}

const menuItemSchema: Schema<IMenuItem> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['starters', 'mains', 'desserts', 'beverages', 'specials'],
    default: 'mains'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: '/images/food/default-food.jpg'
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'none'
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Index for search functionality
menuItemSchema.index({ name: 'text', description: 'text' })

// Export the model, handling Next.js hot reload
export const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);