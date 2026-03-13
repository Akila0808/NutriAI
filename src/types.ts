export interface User {
  id: number;
  email: string;
  name: string;
  lifestyle: string;
  goal: string;
  age: number;
  weight: number;
  height: number;
}

export interface MealLog {
  id: number;
  user_id: number;
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  health_score: number;
  image_url: string;
  created_at: string;
}

export interface Habit {
  id: number;
  user_id: number;
  type: string;
  value: number;
  created_at: string;
}

export interface FoodAnalysis {
  foodName: string;
  calories: number;
  carbohydrates: string; // "High", "Medium", "Low"
  protein: string;
  fat: string;
  fiber: string;
  oilLevel: string;
  sugarLevel: string;
  sodiumLevel: string;
  healthScore: number;
  isStreetFood: boolean;
  suggestions: string[];
  balanceScore: number;
  balanceFeedback: string;
}

export interface ThaliAnalysis {
  items: string[];
  totalCalories: number;
  totalCarbs: string;
  totalProtein: string;
  totalFat: string;
  totalFiber: string;
  mealBalanceScore: number;
  feedback: string;
}
