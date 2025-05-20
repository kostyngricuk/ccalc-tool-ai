
'use client';
import React, { useEffect, useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField as ShadCNFormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { estimateNutritionFromName } from '@/ai/flows/estimate-nutrition-from-name';
import { useToast } from "@/hooks/use-toast";

const foodItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.number().min(0, "Calories must be non-negative"),
  protein: z.number().min(0, "Protein must be non-negative"),
  carbs: z.number().min(0, "Carbs must be non-negative"),
  fat: z.number().min(0, "Fat must be non-negative"),
});

type FoodFormData = z.infer<typeof foodItemSchema>;

interface CustomFoodFormProps {
  onSave: (food: FoodItem) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialFoodName?: string;
}

export function CustomFoodForm({ onSave, isOpen, onOpenChange, initialFoodName }: CustomFoodFormProps) {
  const form = useForm<FoodFormData>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  });
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const currentFoodName = form.watch("name");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialFoodName || '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
  }, [isOpen, initialFoodName, form]);

  const handleAiEstimate = async () => {
    const foodName = form.getValues("name");
    if (!foodName.trim()) {
      toast({ variant: "destructive", title: "Food Name Required", description: "Please enter a food name to use AI estimation." });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await estimateNutritionFromName({ foodName });
      form.setValue("calories", result.calories, { shouldValidate: true });
      form.setValue("protein", result.protein, { shouldValidate: true });
      form.setValue("carbs", result.carbs, { shouldValidate: true });
      form.setValue("fat", result.fat, { shouldValidate: true });
      toast({ title: "AI Estimation Complete", description: "Nutritional values have been populated." });
    } catch (error) {
      console.error("AI Nutrition Estimation error:", error);
      let userErrorMessage = "Could not estimate nutrition. Please try again or enter manually.";
      if (error instanceof Error) {
        if (error.message.includes("503") || error.message.toLowerCase().includes("service unavailable") || error.message.toLowerCase().includes("model is overloaded")) {
          userErrorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
        } else if (error.message.toLowerCase().includes("deadline exceeded")) {
            userErrorMessage = "The request to the AI service timed out. Please try again.";
        } else {
            userErrorMessage = error.message;
        }
      }
      toast({ variant: "destructive", title: "AI Error", description: userErrorMessage });
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FoodFormData> = (data) => {
    let calculatedCalories = data.calories;

    if (data.calories === 0 && (data.protein > 0 || data.carbs > 0 || data.fat > 0)) {
      calculatedCalories = Math.round((data.protein * 4) + (data.carbs * 4) + (data.fat * 9));
    }

    const nutritionDetails = [
      `Calories: ${calculatedCalories.toFixed(0)} kcal`,
      `Protein: ${data.protein.toFixed(1)} g`,
      `Carbs: ${data.carbs.toFixed(1)} g`,
      `Fat: ${data.fat.toFixed(1)} g`
    ].join('\n');

    const newFood: FoodItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      calories: calculatedCalories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      custom: true,
      nutritionLabelDetails: nutritionDetails,
    };
    onSave(newFood);
    onOpenChange(false);
  };

  const nutrientFields: Array<{id: keyof FoodFormData, label: string, type: string}> = [
    { id: 'calories', label: 'Calories (kcal)', type: 'number' },
    { id: 'protein', label: 'Protein (g)', type: 'number' },
    { id: 'carbs', label: 'Carbohydrates (g)', type: 'number' },
    { id: 'fat', label: 'Fat (g)', type: 'number' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Add Custom Food Item</DialogTitle>
          <DialogDescription>
            Enter the nutritional information for "{initialFoodName || currentFoodName || 'your new item'}". 
            Or, use AI to estimate. Calories will be auto-calculated if left at 0 and macros are provided.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <ShadCNFormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="button" 
              onClick={handleAiEstimate}
              variant="outline" 
              disabled={isAiLoading || !currentFoodName || currentFoodName.trim() === ""}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Use AI to estimate nutrition for "{currentFoodName || 'item'}"
            </Button>
            
            {nutrientFields.map(nutrient => (
              <ShadCNFormField
                control={form.control}
                name={nutrient.id}
                key={nutrient.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{nutrient.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={nutrient.type}
                        step={nutrient.type === 'number' ? (nutrient.id === 'calories' ? '1' : '0.1') : undefined}
                        {...field}
                        onChange={(e) => field.onChange(nutrient.type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0) : e.target.value)}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Food Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
