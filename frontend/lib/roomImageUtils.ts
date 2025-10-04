/**
 * Utility functions for managing room images from organized folders
 */

// Room type to folder mapping
const ROOM_FOLDER_MAP: { [key: string]: string } = {
  'Double': 'Double Room with Mountain View(1 king bed)',
  'Family': 'Family Room with Mountain View',
  'Twin': 'Double or Twin Room with Mountain View',
  'Single': 'Double Room with Mountain View(1 queen bed)', // Using queen bed folder for single rooms
  'Suite': 'Family Room with Mountain View'
};

// Fallback images for each room type
const FALLBACK_IMAGES: { [key: string]: string[] } = {
  'Double': ['/IMG-20250815-WA0007.jpg'],
  'Family': ['/IMG-20250815-WA0008.jpg'],
  'Twin': ['/IMG-20250815-WA0009.jpg'],
  'Single': ['/IMG-20250815-WA0010.jpg'],
  'Suite': ['/IMG-20250815-WA0008.jpg']
};

/**
 * Get the folder path for a specific room type
 */
export function getRoomFolderPath(roomType: string): string {
  return ROOM_FOLDER_MAP[roomType] || 'Double Room with Mountain View(1 king bed)';
}

/**
 * Generate a list of potential image paths for a room type
 * This simulates having access to all images in the folder
 */
export function getRoomImagePaths(roomType: string): string[] {
  const folderPath = getRoomFolderPath(roomType);
  
  // For now, we'll use a predefined set of images for each room type
  // In a real implementation, you might want to fetch this from an API
  const imageSets: { [key: string]: string[] } = {
    'Double Room with Mountain View(1 king bed)': [
      '/Double Room with Mountain View(1 king bed)/408801646 (3).jpg',
      '/Double Room with Mountain View(1 king bed)/408806682 (1).jpg',
      '/Double Room with Mountain View(1 king bed)/408806735 (1).jpg',
      '/Double Room with Mountain View(1 king bed)/408806777 (1).jpg',
      '/Double Room with Mountain View(1 king bed)/408806862 (2).jpg',
      '/Double Room with Mountain View(1 king bed)/408807273.jpg',
      '/Double Room with Mountain View(1 king bed)/411067124.jpg',
      '/Double Room with Mountain View(1 king bed)/411069268 (1).jpg',
      '/Double Room with Mountain View(1 king bed)/411069268.jpg',
      '/Double Room with Mountain View(1 king bed)/IMG-20250815-WA0014.jpg',
      '/Double Room with Mountain View(1 king bed)/IMG-20250815-WA0016.jpg',
      '/Double Room with Mountain View(1 king bed)/IMG-20250815-WA0017.jpg'
    ],
    'Family Room with Mountain View': [
      '/Family Room with Mountain View/408807487.jpg',
      '/Family Room with Mountain View/408807554.jpg',
      '/Family Room with Mountain View/408807643.jpg',
      '/Family Room with Mountain View/408807696.jpg',
      '/Family Room with Mountain View/408807841.jpg'
    ],
    'Double or Twin Room with Mountain View': [
      // Using some images from the double room folder as placeholder
      '/Double Room with Mountain View(1 king bed)/408801646 (3).jpg',
      '/Double Room with Mountain View(1 king bed)/408806682 (1).jpg',
      '/Double Room with Mountain View(1 king bed)/408806735 (1).jpg'
    ],
    'Double Room with Mountain View(1 queen bed)': [
      '/Double Room with Mountain View(1 queen bed)/408822765.jpg',
      '/Double Room with Mountain View(1 queen bed)/408822912.jpg',
      '/Double Room with Mountain View(1 queen bed)/408822985.jpg',
      '/Double Room with Mountain View(1 queen bed)/408823481.jpg',
      '/Double Room with Mountain View(1 queen bed)/408824302.jpg',
      '/Double Room with Mountain View(1 queen bed)/408824460.jpg',
      '/Double Room with Mountain View(1 queen bed)/408824994.jpg'
    ]
  };

  return imageSets[folderPath] || FALLBACK_IMAGES[roomType] || ['/IMG-20250815-WA0007.jpg'];
}

/**
 * Get a random image from the room's image folder
 */
export function getRandomRoomImage(roomType: string): string {
  const images = getRoomImagePaths(roomType);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex] || FALLBACK_IMAGES[roomType]?.[0] || '/IMG-20250815-WA0007.jpg';
}

/**
 * Get a random image from the room's image folder with seed for consistent randomization
 */
export function getRandomRoomImageWithSeed(roomType: string, seed: number = 0): string {
  const images = getRoomImagePaths(roomType);
  if (images.length === 0) return FALLBACK_IMAGES[roomType]?.[0] || '/IMG-20250815-WA0007.jpg';
  
  // Use seed for consistent randomization
  const randomIndex = (seed + roomType.length) % images.length;
  return images[randomIndex];
}

/**
 * Get the first image from the room's image folder
 */
export function getPrimaryRoomImage(roomType: string): string {
  const images = getRoomImagePaths(roomType);
  return images[0] || FALLBACK_IMAGES[roomType]?.[0] || '/IMG-20250815-WA0007.jpg';
}

/**
 * Get all images for a room type
 */
export function getAllRoomImages(roomType: string): string[] {
  return getRoomImagePaths(roomType);
}

/**
 * Get room images with fallback logic
 * This function handles both API-loaded images and folder-based images
 */
export function getRoomImages(roomType: string, apiImages?: string[]): string[] {
  // If API provides images, use them
  if (apiImages && apiImages.length > 0) {
    return apiImages;
  }
  
  // Otherwise, use folder-based images
  return getAllRoomImages(roomType);
}

/**
 * Get the primary image for a room with fallback logic
 */
export function getRoomPrimaryImage(roomType: string, apiImage?: string): string {
  // If API provides a primary image, use it
  if (apiImage) {
    return apiImage;
  }
  
  // Otherwise, use folder-based primary image
  return getPrimaryRoomImage(roomType);
}

/**
 * Check if an image path is from the organized folders
 */
export function isFolderImage(imagePath: string): boolean {
  return imagePath.includes('Double Room with Mountain View') || 
         imagePath.includes('Family Room with Mountain View') ||
         imagePath.includes('Double or Twin Room with Mountain View');
}

/**
 * Get room type from image path (reverse lookup)
 */
export function getRoomTypeFromImagePath(imagePath: string): string | null {
  if (imagePath.includes('Double Room with Mountain View(1 king bed)')) return 'Double';
  if (imagePath.includes('Family Room with Mountain View')) return 'Family';
  if (imagePath.includes('Double or Twin Room with Mountain View')) return 'Twin';
  if (imagePath.includes('Double Room with Mountain View(1 queen bed)')) return 'Single';
  return null;
}
