export enum Category {
  NEWLY_LAUNCHED = 'newly-launched',
  HAIR_ACCESSORIES = 'hair-accessories',
  BAGS = 'bags',
  KEYCHAINS = 'keychains',
  OTHERS = 'others'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  size: string;
  images: string[];
  createdAt: number;
}

export interface Settings {
  whatsappNumber: string;
  adminPassword: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
}
