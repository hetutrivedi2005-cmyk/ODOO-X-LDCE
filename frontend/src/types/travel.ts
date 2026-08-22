export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number; // 1 to 5 index (e.g. $, $$, $$$, $$$$, $$$$$)
  popularity: number; // 1 to 5 stars or rating
  image: string;
}

export interface Activity {
  id: string;
  name: string;
  cityId: string;
  description: string;
  category: string;
  duration: number; // Duration in minutes
  estimatedCost: number;
  image: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  coverImage: string;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  order: number;
}

export interface ItineraryActivity {
  id: string;
  tripId: string;
  tripStopId: string;
  activityId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  estimatedCost: number;
  notes?: string;
}
