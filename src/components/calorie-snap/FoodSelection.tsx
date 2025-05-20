
'use client';
import React, { useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, PlusSquare } from 'lucide-react';
import { Label as BasicLabel } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ReusableSearchableSelect, type SearchableSelectItem } from './ReusableSearchableSelect';

interface FoodSelectionProps {
  predefinedFoods: FoodItem[];
  onAddFood: (food: FoodItem, quantity: number) => void;
  onTriggerCustomFoodDialog: (searchTerm: string) => void;
}

const quantityFormSchema = z.object({
  quantity: z.coerce.number().min(0.1, { message: "Quantity must be at least 0.1." }).default(1),
});
type QuantityFormData = z.infer<typeof quantityFormSchema>;

export function FoodSelection({ predefinedFoods, onAddFood, onTriggerCustomFoodDialog }: FoodSelectionProps) {
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>(undefined);

  const quantityForm = useForm<QuantityFormData>({
    resolver: zodResolver(quantityFormSchema),
    defaultValues: {
      quantity: 1,
    },
    mode: "onChange",
  });

  const handleAddFoodSubmit = (data: QuantityFormData) => {
    if (selectedFoodId) {
      const foodToAdd = predefinedFoods.find(f => f.id === selectedFoodId);
      if (foodToAdd) {
        onAddFood(foodToAdd, data.quantity);
        setSelectedFoodId(undefined);
        quantityForm.reset({ quantity: 1 });
      }
    }
  };

  const searchableFoodItems: SearchableSelectItem[] = predefinedFoods.map(food => ({
    id: food.id,
    name: food.name,
    details: `(${food.calories.toFixed(0)} kcal)`
  }));

  const handleCustomFoodTriggerWithSearchTerm = (searchTerm: string) => {
    onTriggerCustomFoodDialog(searchTerm);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Select Food Item</CardTitle>
        <CardDescription>Choose from the list or type to search. If not found, you can add it as a custom item.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <BasicLabel htmlFor="food-item-searchable-select">Food Item</BasicLabel>
          <ReusableSearchableSelect
            id="food-item-searchable-select"
            items={searchableFoodItems}
            value={selectedFoodId}
            onValueChange={(id) => {
              setSelectedFoodId(id);
              // Trigger validation for quantity when food item changes to update button state
              quantityForm.trigger("quantity").catch(() => {});
            }}
            placeholder="Select or search for a food item"
            searchPlaceholder="Search food..."
            notFoundText={(searchTerm) => `Add "${searchTerm}" as custom food`}
            onNotFoundClick={handleCustomFoodTriggerWithSearchTerm}
            notFoundIcon={PlusSquare}
          />
        </div>

        <Form {...quantityForm}>
          <form onSubmit={quantityForm.handleSubmit(handleAddFoodSubmit)} className="space-y-6">
            <FormField
              control={quantityForm.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="quantity-input">Quantity</FormLabel>
                  <FormControl>
                    <Input
                      id="quantity-input"
                      type="number"
                      min="0.1"
                      step="0.1"
                      {...field}
                      className="w-full bg-card"
                      placeholder="e.g., 1 or 0.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!selectedFoodId || !quantityForm.formState.isValid}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add to Meal
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
