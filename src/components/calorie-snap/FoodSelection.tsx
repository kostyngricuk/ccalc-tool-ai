
'use client';
import React, { useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, PlusSquare } from 'lucide-react'; // Added PlusSquare
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodSelectionProps {
  predefinedFoods: FoodItem[];
  onAddFood: (food: FoodItem, quantity: number) => void;
  onTriggerCustomFoodDialog: (searchTerm: string) => void; // New prop
}

export function FoodSelection({ predefinedFoods, onAddFood, onTriggerCustomFoodDialog }: FoodSelectionProps) {
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddFood = () => {
    if (selectedFoodId) {
      const foodToAdd = predefinedFoods.find(f => f.id === selectedFoodId);
      if (foodToAdd && quantity > 0) {
        onAddFood(foodToAdd, quantity);
        setSelectedFoodId(undefined); 
        setSearchTerm(''); 
        setQuantity(1); 
      }
    }
  };

  const filteredFoods = predefinedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for when an actual food item is selected from the dropdown
  const handleFoodSelected = (foodId: string) => {
    setSelectedFoodId(foodId);
    // Optional: Clear search term after selection if desired, or Select may handle it
    // const selectedFoodName = predefinedFoods.find(f => f.id === foodId)?.name;
    // if (selectedFoodName) setSearchTerm(selectedFoodName); 
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Select Food Item</CardTitle>
        <CardDescription>Choose from a list or type to search. If not found, you can add it as a custom item.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="food-select">Food Item</Label>
          <Select value={selectedFoodId} onValueChange={handleFoodSelected}>
            <SelectTrigger id="food-select" className="w-full bg-card">
              <SelectValue placeholder="Select or search for a food item" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 sticky top-0 bg-popover z-10">
                <Input
                  placeholder="Search food..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedFoodId(undefined); // Clear selection when search term changes
                  }}
                  className="bg-background border-input mb-2"
                  aria-label="Search food items"
                />
              </div>
              <ScrollArea className="max-h-[250px]"> {/* Dynamic height, max-h for usability */}
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      {food.name} ({food.calories} kcal)
                    </SelectItem>
                  ))
                ) : searchTerm.trim() !== '' ? (
                  <div
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    onClick={() => {
                      onTriggerCustomFoodDialog(searchTerm);
                      // Closing the Select dropdown will be handled by its own mechanics or by page.tsx state change
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTriggerCustomFoodDialog(searchTerm);
                      }
                    }}
                  >
                    <PlusSquare className="absolute left-2 h-4 w-4" />
                    <span>Add "{searchTerm}" as custom food</span>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Type to search for a food item.
                  </div>
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity-select">Quantity</Label>
          <Input
            id="quantity-select"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-card"
          />
        </div>
        <Button onClick={handleAddFood} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!selectedFoodId || quantity <= 0}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add to Meal
        </Button>
      </CardContent>
    </Card>
  );
}
