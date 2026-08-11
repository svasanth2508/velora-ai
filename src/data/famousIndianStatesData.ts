import { INDIAN_STATES_PART_1 } from './indianStatesPart1';
import { INDIAN_STATES_PART_2 } from './indianStatesPart2';
import { INDIAN_UNION_TERRITORIES } from './indianUnionTerritories';

export interface PlaceDetail {
  rank: number;
  name: string;
  category: string;
  rating: number;
  description: string;
  imageUrl: string;
  mapSearchQuery: string;
}

export interface StateTourismRecord {
  id: string;
  state: string;
  stateNum: number;
  type?: string;
  imageUrl: string;
  description: string;
  places: PlaceDetail[];
}

export const FAMOUS_INDIAN_STATES_DATA: StateTourismRecord[] = [
  ...INDIAN_STATES_PART_1,
  ...INDIAN_STATES_PART_2,
  ...INDIAN_UNION_TERRITORIES
];


