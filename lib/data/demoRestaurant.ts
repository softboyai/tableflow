import {
  RestaurantMenuCategory,
  RestaurantPageData,
  RestaurantMenuItem,
  RestaurantEvent,
  RestaurantGalleryItem
} from "@/types/restaurant";

const restaurantId = "demo-aurum-restaurant";

const categories: RestaurantMenuCategory[] = [
  {
    id: "cat-1",
    name: "Starters",
    sortOrder: 1
  },
  {
    id: "cat-2",
    name: "Signature Plates",
    sortOrder: 2
  },
  {
    id: "cat-3",
    name: "Pizza",
    sortOrder: 3
  },
  {
    id: "cat-4",
    name: "Cocktails",
    sortOrder: 4
  }
];

const menuItems: RestaurantMenuItem[] = [
  {
    id: "dish-1",
    restaurantId,
    categoryId: "cat-1",
    categoryName: "Starters",
    name: "Truffle Burrata",
    description: "Creamy burrata, black truffle, basil oil.",
    price: 18000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Elegant_Dessert_Presentation-1156468-medium.jpg",
    tags: ["Vegetarian", "Popular"],
    isAvailable: true,
    isFeatured: true,
    sortOrder: 1
  },
  {
    id: "dish-2",
    restaurantId,
    categoryId: "cat-2",
    categoryName: "Signature Plates",
    name: "Prime Ribeye",
    description: "Dry-aged cut with rosemary jus.",
    price: 34000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Elegant_Dinner_Plate-1117095-medium.jpg",
    tags: ["Chef's Pick"],
    isAvailable: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    id: "dish-3",
    restaurantId,
    categoryId: "cat-2",
    categoryName: "Signature Plates",
    name: "Gold Burger",
    description: "Aged cheddar, brioche, smoked aioli.",
    price: 16000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Juicy_Gourmet_Burger-927567-medium.jpg",
    tags: ["Popular"],
    isAvailable: true,
    isFeatured: true,
    sortOrder: 3
  },
  {
    id: "dish-4",
    restaurantId,
    categoryId: "cat-3",
    categoryName: "Pizza",
    name: "Pepperoni Royale",
    description: "Stone-baked pizza with house blend.",
    price: 19000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Delicious_Pepperoni_Pizza-838995-medium.jpg",
    tags: ["Spicy"],
    isAvailable: true,
    isFeatured: true,
    sortOrder: 4
  },
  {
    id: "dish-5",
    restaurantId,
    categoryId: "cat-2",
    categoryName: "Signature Plates",
    name: "Crispy Heritage",
    description: "Buttermilk chicken with honey glaze.",
    price: 22000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Crispy_fried_chicken-1343081-medium.jpg",
    tags: ["Signature"],
    isAvailable: false,
    isFeatured: true,
    sortOrder: 5
  },
  {
    id: "dish-6",
    restaurantId,
    categoryId: "cat-4",
    categoryName: "Cocktails",
    name: "Sunset Elixir",
    description: "Tropical fruits, citrus bitters, chilled finish.",
    price: 12000,
    currency: "RWF",
    imageUrl: "/images/StockCake-Tropical_Cocktail_Drink-89420-medium.jpg",
    tags: ["Vegan"],
    isAvailable: true,
    isFeatured: false,
    sortOrder: 6
  }
];

const gallery: RestaurantGalleryItem[] = menuItems
  .filter(
    (item): item is RestaurantMenuItem & { imageUrl: string } =>
      Boolean(item.imageUrl)
  )
  .map((item, index) => ({
    id: `gallery-${item.id}`,
    imageUrl: item.imageUrl,
    altText: item.name,
    sortOrder: index + 1
  }));

const events: RestaurantEvent[] = [
  {
    id: "event-1",
    title: "Live Jazz Quartet",
    description: "Smooth classics with a candlelit dinner setting.",
    timeLabel: "Friday 8:00 PM"
  },
  {
    id: "event-2",
    title: "Rooftop DJ Set",
    description: "Deep house sessions and crafted cocktails.",
    timeLabel: "Saturday 9:30 PM"
  },
  {
    id: "event-3",
    title: "Chef's Table",
    description: "Five-course tasting with wine pairing.",
    timeLabel: "Sunday 7:00 PM"
  }
];

export const demoRestaurantData: RestaurantPageData = {
  restaurant: {
    id: restaurantId,
    name: "Aurum Dining",
    slug: "aurum-dining",
    tagline: "A curated culinary journey designed for the discerning palate.",
    whatsappNumber: "250787878745",
    phoneNumber: "250787878745",
    promoTitle: "Buy 1 Get 1 Free Pizza",
    promoText:
      "Available today only for dine-in guests. Pair with our signature cocktail flight for the ultimate experience.",
    heroImageUrl: "/images/StockCake-Elegant_Dinner_Plate-1117095-medium.jpg",
    menuPdfUrl: "/menu/menu.pdf",
    mapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3067.172677359789!2d30.05870547648075!3d-1.952530998422797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d5f39a5f5f8c9d%3A0x2e59f28d22b7f1d2!2sKigali!5e0!3m2!1sen!2srw!4v1718192026759!5m2!1sen!2srw",
    address: "Kigali, Rwanda",
    locationHint: "Find us in the heart of the city",
    hoursLabel: "Open daily from 12:00 PM to 1:00 AM."
  },
  menuCategories: categories,
  signatureDishes: menuItems
    .filter((item) => item.isFeatured && item.isAvailable)
    .slice(0, 5),
  menuItems,
  gallery,
  events
};
