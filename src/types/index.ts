export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  purchasedTours: string[]; // IDs of purchased tours
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  introAudioUrl: string;
  pointsOfInterest: PointOfInterest[];
  tourCount: number;
  price: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  audioUrl: string;
}