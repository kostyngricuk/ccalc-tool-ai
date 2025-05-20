'use client';
import React, { useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodSelectionProps {
  predefinedFoods: FoodItem[];
  onAddFood: (food: FoodItem, quantity: number) => void;
}

export function FoodSelection({ predefinedFoods, onAddFood }: FoodSelectionProps) {
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddFood = () => {
    if (selectedFoodId) {
      const foodToAdd = predefinedFoods.find(f => f.id === selectedFoodId);
      if (foodToAdd && quantity > 0) {
        onAddFood(foodToAdd, quantity);
        setSelectedFoodId(undefined); // Reset select
        setQuantity(1); // Reset quantity
      }
    }
  };

  const filteredFoods = predefinedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Select Food Item</CardTitle>
        <CardDescription>Choose from a list of common foods or add your own.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="food-search">Search Food</Label>
          <Input
            id="food-search"
            placeholder="e.g., Apple, Chicken Breast"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="food-select">Food Item</Label>
          <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
            <SelectTrigger id="food-select" className="w-full bg-card">
              <SelectValue placeholder="Select a food item" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      {food.name} ({food.calories} kcal)
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">No items match your search.</div>
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
