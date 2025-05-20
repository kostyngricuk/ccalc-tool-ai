
'use client';
import React, { useEffect, useState } from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2 } from 'lucide-react';
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
  const { register, handleSubmit, reset, formState: { errors }, setValue, getValues, watch } = useForm<FoodFormData>({
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
  const currentFoodName = watch("name");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialFoodName || '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
  }, [isOpen, initialFoodName, reset]);

  const handleAiEstimate = async () => {
    const foodName = getValues("name");
    if (!foodName.trim()) {
      toast({ variant: "destructive", title: "Food Name Required", description: "Please enter a food name to use AI estimation." });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await estimateNutritionFromName({ foodName });
      setValue("calories", result.calories, { shouldValidate: true });
      setValue("protein", result.protein, { shouldValidate: true });
      setValue("carbs", result.carbs, { shouldValidate: true });
      setValue("fat", result.fat, { shouldValidate: true });
      toast({ title: "AI Estimation Complete", description: "Nutritional values have been populated." });
    } catch (error) {
      console.error("AI Nutrition Estimation error:", error);
      let userErrorMessage = "Could not estimate nutrition. Please try again or enter manually.";
      if (error instanceof Error && error.message.includes("503")) {
        userErrorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
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

  const nutrientFields = [
    { id: 'calories', label: 'Calories (kcal)', type: 'number', error: errors.calories, required: false },
    { id: 'protein', label: 'Protein (g)', type: 'number', error: errors.protein, required: false },
    { id: 'carbs', label: 'Carbohydrates (g)', type: 'number', error: errors.carbs, required: false },
    { id: 'fat', label: 'Fat (g)', type: 'number', error: errors.fat, required: false },
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          {/* Food Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Food Name
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              className="bg-background"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* AI Estimate Button */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAiEstimate} 
            disabled={isAiLoading || !currentFoodName || currentFoodName.trim() === ""}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Use AI to estimate nutrition
          </Button>
          
          {/* Nutrient Fields */}
          {nutrientFields.map(field => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                step={field.type === 'number' ? (field.id === 'calories' ? '1' : '0.1') : undefined}
                className="bg-background"
                {...register(field.id as keyof FoodFormData, {
                    valueAsNumber: field.type === 'number'
                })}
              />
              {field.error && <p className="text-sm text-destructive mt-1">{field.error.message}</p>}
            </div>
          ))}

          <DialogFooter className="gap-2 sm:space-x-0 sm:gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Food Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
