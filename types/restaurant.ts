export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  whatsappNumber: string;
  phoneNumber: string;
  promoTitle: string;
  promoText: string;
  heroImageUrl: string;
  menuPdfUrl?: string | null;
  mapsEmbedUrl: string;
  address: string;
  locationHint: string;
  hoursLabel: string;
};

export type RestaurantGalleryItem = {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

export type RestaurantMenuItem = {
  id: string;
  restaurantId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  name: string;
  description: string;
  price?: number | null;
  currency?: string | null;
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type RestaurantMenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type RestaurantEvent = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
};

export type RestaurantPageData = {
  restaurant: Restaurant;
  menuCategories: RestaurantMenuCategory[];
  signatureDishes: RestaurantMenuItem[];
  menuItems: RestaurantMenuItem[];
  gallery: RestaurantGalleryItem[];
  events: RestaurantEvent[];
};
