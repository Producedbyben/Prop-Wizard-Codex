export type PropStatus = 'not_searched' | 'searching' | 'options_found' | 'no_results';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  notes: string;
  treatmentDocUrl: string;
  createdAt: string;
}

export interface Prop {
  id: string;
  projectId: string;
  propName: string;
  description: string;
  quantity: number;
  priority: Priority;
  sceneOrReference: string;
  treatmentDocUrl: string;
  tags: string[];
  searchQueryOverride: string;
  status: PropStatus;
  createdAt: string;
}

export interface PropOption {
  id: string;
  propId: string;
  provider: string;
  asin: string;
  title: string;
  url: string;
  imageUrl: string;
  priceAmount: number;
  priceCurrency: string;
  isPrime: boolean;
  isNextDayConfirmed: boolean;
  expectedDeliveryIso: string;
  ratingStars: number | null;
  ratingCount: number | null;
  merchantSoldBy: string | null;
  fulfilledByAmazon: boolean;
  selected: boolean;
  createdAt: string;
}
