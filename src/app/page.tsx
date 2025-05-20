
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { FoodItem, NutritionalInfo } from '@/lib/types';
import { predefinedFoods as initialPredefinedFoods } from '@/lib/mockData';
import { Header } from '@/components/calorie-snap/Header';
import { FoodSelection } from '@/components/calorie-snap/FoodSelection';
import { CustomFoodForm } from '@/components/calorie-snap/CustomFoodForm';
import { ImageUpload } from '@/components/calorie-snap/ImageUpload';
import { SelectedFoodsList } from '@/components/calorie-snap/SelectedFoodsList';
import { NutritionalSummary } from '@/components/calorie-snap/NutritionalSummary';
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CalorieSnapPage() {
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [predefinedFoods, setPredefinedFoods] = useState<FoodItem[]>(initialPredefinedFoods);
  const [totalNutrients, setTotalNutrients] = useState<NutritionalInfo>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const calculateTotals = useCallback(() => {
    const totals = selectedFoods.reduce(
      (acc, item) => {
        const quantity = item.quantity || 1;
        acc.calories += item.calories * quantity;
        acc.protein += item.protein * quantity;
        acc.carbs += item.carbs * quantity;
        acc.fat += item.fat * quantity;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setTotalNutrients(totals);
  }, [selectedFoods]);

  useEffect(() => {
    calculateTotals();
  }, [selectedFoods, calculateTotals]);

  const handleAddFoodToSelection = (food: FoodItem, quantity: number) => {
    setSelectedFoods((prevFoods) => {
      const existingFood = prevFoods.find(f => f.id === food.id);
      if (existingFood) {
        return prevFoods.map(f =>
          f.id === food.id ? { ...f, quantity: (f.quantity || 0) + quantity } : f
        );
      }
      return [...prevFoods, { ...food, quantity }];
    });
  };

  const handleRemoveFoodFromSelection = (id: string) => {
    setSelectedFoods((prevFoods) => prevFoods.filter((food) => food.id !== id));
  };

  const handleUpdateFoodQuantity = (id: string, newQuantity: number) => {
    setSelectedFoods((prevFoods) =>
      prevFoods.map((food) =>
        food.id === id ? { ...food, quantity: newQuantity } : food
      )
    );
  };

  const handleSaveCustomFood = (food: FoodItem) => {
    setCustomFoods((prevFoods) => [...prevFoods, food]);
    // Optionally, add to predefined list for future selection if desired, or keep separate
    // For this version, custom foods are just for the current session's selection list
    handleAddFoodToSelection(food, 1); // Add new custom food to selection with quantity 1
  };
  
  const handleClearAllSelectedFoods = () => {
    setSelectedFoods([]);
  };

  // Combine predefined and custom foods for the FoodSelection component
  const allAvailableFoods = React.useMemo(() => {
    // Ensure no duplicate IDs if custom foods could somehow match predefined
    const customFoodIds = new Set(customFoods.map(cf => cf.id));
    const uniquePredefined = predefinedFoods.filter(pf => !customFoodIds.has(pf.id));
    return [...uniquePredefined, ...customFoods];
  }, [predefinedFoods, customFoods]);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Inputs & AI */}
          <div className="md:col-span-2 space-y-8">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="image">Estimate from Image</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-8">
                <FoodSelection
                  predefinedFoods={allAvailableFoods}
                  onAddFood={handleAddFoodToSelection}
                />
                <CustomFoodForm onSave={handleSaveCustomFood} />
              </TabsContent>
              <TabsContent value="image">
                <ImageUpload />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Summary & Selected List */}
          <div className="md:col-span-1 space-y-8">
            <NutritionalSummary totals={totalNutrients} />
            <SelectedFoodsList
              selectedFoods={selectedFoods}
              onRemoveFood={handleRemoveFoodFromSelection}
              onUpdateQuantity={handleUpdateFoodQuantity}
              onClearAll={handleClearAllSelectedFoods}
            />
          </div>
        </div>
      </main>
      <Toaster />
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} CalorieSnap. Your healthy eating companion.</p>
      </footer>
    </div>
  );
}
