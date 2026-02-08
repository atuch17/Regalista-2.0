export type PersonColor = 'slate' | 'rose' | 'orange' | 'emerald' | 'blue' | 'violet';
export type GiftPriority = 'high' | 'medium' | 'low';
export type GiftStatus = 'pendiente' | 'comprado';

export interface Gift {
  id: string;
  name: string;
  description: string;
  price?: number;
  link?: string;
  priority?: GiftPriority;
  status: GiftStatus;
}

export interface Person {
  id: string;
  name: string;
  birthday: string; // Format: "15 de Mayo"
  color: PersonColor;
  isFavorite?: boolean;
  reminderSet?: boolean;
  gifts: Gift[];
}
