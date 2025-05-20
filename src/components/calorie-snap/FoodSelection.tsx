
'use client';
import React, { useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, PlusSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField as ShadCNFormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SearchableSelect, type SearchableSelectItem } from './SearchableSelect';

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
  const [isSelectOpen, setIsSelectOpen] = useState(false);

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
        setSelectedFoodId(undefined); // Clear selected food after adding
        quantityForm.reset({ quantity: 1 });
        setIsSelectOpen(false); // Close the select dropdown
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
    setIsSelectOpen(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Select Food Item</CardTitle>
        <CardDescription>Choose from the list or type to search. If not found, you can add it as a custom item.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchableSelect
          id="food-item-searchable-select"
          label="Food Item"
          items={searchableFoodItems}
          value={selectedFoodId}
          onValueChange={(id) => {
            setSelectedFoodId(id);
            if (id) {
              quantityForm.trigger("quantity").catch(() => {});
            } else {
               // Optionally reset quantity form if selection is cleared
               quantityForm.reset({ quantity: 1 });
            }
          }}
          placeholder="Select or search for a food item"
          searchPlaceholder="Search food..."
          notFoundText={(searchTerm) => `Add "${searchTerm}" as custom food`}
          onNotFoundClick={handleCustomFoodTriggerWithSearchTerm}
          notFoundIcon={PlusSquare}
          isOpen={isSelectOpen}
          onOpenChange={setIsSelectOpen}
        />

        {selectedFoodId && (
          <Form {...quantityForm}>
            <form onSubmit={quantityForm.handleSubmit(handleAddFoodSubmit)} className="space-y-6">
              <ShadCNFormField
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
                disabled={!quantityForm.formState.isValid} // selectedFoodId is already checked by the outer condition
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add to Meal
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
