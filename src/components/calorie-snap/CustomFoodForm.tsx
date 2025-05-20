
'use client';
import React from 'react';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusSquare } from 'lucide-react';

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
}

export function CustomFoodForm({ onSave }: CustomFoodFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FoodFormData>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  });

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
    reset(); 
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        reset(); 
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <PlusSquare className="mr-2 h-5 w-5" /> Add Custom Food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Add Custom Food Item</DialogTitle>
          <DialogDescription>
            Enter the nutritional information. Calories will be auto-calculated if left at 0 and macros are provided.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          {[
            { id: 'name', label: 'Food Name', type: 'text', error: errors.name },
            { id: 'calories', label: 'Calories (kcal)', type: 'number', error: errors.calories },
            { id: 'protein', label: 'Protein (g)', type: 'number', error: errors.protein },
            { id: 'carbs', label: 'Carbohydrates (g)', type: 'number', error: errors.carbs },
            { id: 'fat', label: 'Fat (g)', type: 'number', error: errors.fat },
          ].map(field => (
            <div key={field.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.id} className="text-right col-span-1">
                {field.label}
              </Label>
              <div className="col-span-3">
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
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Food Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
