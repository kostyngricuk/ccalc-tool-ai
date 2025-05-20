
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
import { useToast } from "@/hooks/use-toast";


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
  const { toast } = useToast();

  // State for CustomFoodForm dialog
  const [isCustomFoodDialogOpen, setIsCustomFoodDialogOpen] = useState(false);
  const [customFoodInitialName, setCustomFoodInitialName] = useState<string | undefined>(undefined);

  const calculateTotals = useCallback(() => {
    const totals = selectedFoods.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity) || 0; 
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
    let foodToProcess = { ...food };

    if (!foodToProcess.nutritionLabelDetails && (foodToProcess.calories > 0 || foodToProcess.protein > 0 || foodToProcess.carbs > 0 || foodToProcess.fat > 0)) {
      foodToProcess.nutritionLabelDetails = [
        `Calories: ${foodToProcess.calories.toFixed(0)} kcal`,
        `Protein: ${foodToProcess.protein.toFixed(1)} g`,
        `Carbs: ${foodToProcess.carbs.toFixed(1)} g`,
        `Fat: ${foodToProcess.fat.toFixed(1)} g`
      ].join('\n');
    }
    
    setSelectedFoods((prevFoods) => {
      const existingFood = prevFoods.find(f => f.id === foodToProcess.id);
      if (existingFood) {
        return prevFoods.map(f =>
          f.id === foodToProcess.id ? { 
            ...f, 
            quantity: (Number(f.quantity) || 0) + quantity,
            nutritionLabelDetails: f.nutritionLabelDetails || foodToProcess.nutritionLabelDetails 
          } : f
        );
      }
      return [...prevFoods, { ...foodToProcess, quantity }];
    });
  };

  const handleRemoveFoodFromSelection = (id: string) => {
    setSelectedFoods((prevFoods) => prevFoods.filter((food) => food.id !== id));
  };

  const handleUpdateFoodQuantity = (id: string, newQuantity?: number) => { 
    setSelectedFoods((prevFoods) =>
      prevFoods.map((food) =>
        food.id === id ? { ...food, quantity: newQuantity } : food
      )
    );
  };

  const handleSaveCustomFood = (food: FoodItem) => {
    setCustomFoods((prevFoods) => [...prevFoods, food]);
    handleAddFoodToSelection(food, 1); 
    toast({
        title: "Custom Food Added",
        description: `${food.name} has been added to your meal.`,
    });
    setIsCustomFoodDialogOpen(false); // Close dialog after saving
  };
  
  const handleClearAllSelectedFoods = () => {
    setSelectedFoods([]);
    toast({
        title: "Meal Cleared",
        description: "All items have been removed from your current meal.",
    });
  };

  const handleFoodEstimatedFromImage = (foodItem: FoodItem) => {
    handleAddFoodToSelection(foodItem, 1); 
    toast({
      title: "Image Processed!",
      description: `${foodItem.name} added to your meal. Hover (i) for details.`,
    });
  };

  const allAvailableFoods = React.useMemo(() => {
    const customFoodIds = new Set(customFoods.map(cf => cf.id));
    const uniquePredefined = predefinedFoods.filter(pf => !customFoodIds.has(pf.id));
    return [...uniquePredefined, ...customFoods];
  }, [predefinedFoods, customFoods]);

  const handleTriggerCustomFoodDialog = (searchTerm: string) => {
    setCustomFoodInitialName(searchTerm);
    setIsCustomFoodDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Item Input Section */}
          <div className="w-full">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="image">Estimate from Image</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-8">
                <FoodSelection
                  predefinedFoods={allAvailableFoods}
                  onAddFood={handleAddFoodToSelection}
                  onTriggerCustomFoodDialog={handleTriggerCustomFoodDialog} // Pass handler
                />
                {/* CustomFoodForm is now controlled and doesn't render its own trigger */}
                <CustomFoodForm
                  isOpen={isCustomFoodDialogOpen}
                  onOpenChange={setIsCustomFoodDialogOpen}
                  initialFoodName={customFoodInitialName}
                  onSave={handleSaveCustomFood}
                />
              </TabsContent>
              <TabsContent value="image">
                <ImageUpload onFoodEstimated={handleFoodEstimatedFromImage} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Current Meal Section - Conditional Rendering */}
          {selectedFoods.length > 0 && (
            <div className="w-full space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
              <NutritionalSummary totals={totalNutrients} />
              <SelectedFoodsList
                selectedFoods={selectedFoods}
                onRemoveFood={handleRemoveFoodFromSelection}
                onUpdateQuantity={handleUpdateFoodQuantity}
                onClearAll={handleClearAllSelectedFoods}
              />
            </div>
          )}
        </div>
      </main>
      <Toaster />
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} CalorieSnap. Your healthy eating companion.</p>
      </footer>
    </div>
  );
}
