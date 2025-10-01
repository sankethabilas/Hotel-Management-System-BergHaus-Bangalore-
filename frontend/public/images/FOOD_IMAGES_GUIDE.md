# Food Images Setup Guide

## For Your Viva Demonstration:

### Step 1: Add Food Images
1. Create folders: `client/public/images/food/`
2. Add images with descriptive names:
   - `rice-curry.jpg`
   - `string-hoppers.jpg`
   - `kottu-roti.jpg`
   - `hoppers.jpg`
   - `lamprais.jpg`

### Step 2: Update Mock Data
Replace `/api/placeholder/400/300` with actual paths:
```typescript
image: "/images/food/rice-curry.jpg"
```

### Step 3: Admin Upload Feature
Add file upload in admin menu management:
```typescript
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  // In real app: upload to cloud storage
  // For demo: use local file path
}
```

## Sri Lankan Food Suggestions:
- Rice & Curry - Rs 1200
- String Hoppers - Rs 450
- Kottu Roti - Rs 800
- Hoppers with Egg - Rs 350
- Lamprais - Rs 1500
- Fish Curry - Rs 900
- Chicken Curry - Rs 1000
- Daal Curry - Rs 400

## Professional Implementation:
1. **Upload API**: `/api/upload/food-images`
2. **Image Validation**: File type, size limits
3. **Cloud Storage**: Automatic optimization
4. **Database**: Store only URLs, not files
