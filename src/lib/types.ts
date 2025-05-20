export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number; // Used for selected items
  custom?: boolean; // To differentiate custom items from predefined ones
  nutritionLabelDetails?: string | null; // To store detailed nutrition info, e.g., from AI
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
