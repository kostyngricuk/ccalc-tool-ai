
'use client';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'; // Removed TableHead, TableHeader
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NutritionLabel } from './NutritionLabel';
import { Trash2, PlusCircle, MinusCircle, Info } from 'lucide-react';
import React from 'react';

interface SelectedFoodsListProps {
  selectedFoods: FoodItem[];
  onRemoveFood: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearAll: () => void;
}

export function SelectedFoodsList({ selectedFoods, onRemoveFood, onUpdateQuantity, onClearAll }: SelectedFoodsListProps) {
  
  const handleQuantityButtonClick = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = (currentQuantity || 1) + delta;
    if (newQuantity <= 0) {
      onRemoveFood(id);
    } else {
      onUpdateQuantity(id, newQuantity);
    }
  };
  
  const handleInputChange = (id: string, value: string) => {
    if (value === "") {
      // Allow clearing the input temporarily, handle on blur
      onUpdateQuantity(id, undefined as any); // Or some placeholder for empty
      return;
    }

    const quantity = parseFloat(value);

    if (!isNaN(quantity)) {
      if (quantity <= 0) {
        onRemoveFood(id); 
      } else {
        onUpdateQuantity(id, quantity);
      }
    } else {
      // If input is not a number, maybe temporarily set to undefined or keep last valid
       onUpdateQuantity(id, undefined as any); // Or some placeholder for invalid
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, itemId: string) => {
    const foodItem = selectedFoods.find(f => f.id === itemId);
    if (!foodItem) return;

    const currentValue = e.target.value;
    
    if (currentValue.trim() === "" || isNaN(parseFloat(currentValue)) || parseFloat(currentValue) <= 0) {
      // If empty, not a number, or zero/negative, set to 1 (or remove if you prefer)
      onUpdateQuantity(itemId, 1); 
      // If you prefer to remove on invalid/empty blur, call onRemoveFood(itemId);
      return;
    }
    // Value is valid and positive, it's already handled by onChange
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-primary">Current Meal</CardTitle>
          {selectedFoods.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:text-destructive/80">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Meal
            </Button>
          )}
        </div>
        <CardDescription>Items you've added. Hover (i) for nutrition details.</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFoods.length === 0 ? (
          <p className="text-muted-foreground">No items added to your meal yet. Add items to see them here.</p>
        ) : (
          <ScrollArea className="max-h-[calc(100vh-450px)] md:max-h-[400px] pr-1">
            <Table>
              {/* TableHeader removed */}
              <TableBody>
                {selectedFoods.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium py-3">
                      <div className="flex flex-col">
                        {/* First line: Name and Info Icon */}
                        <div className="flex items-center mb-2"> {/* Removed justify-between */}
                          <span className="font-semibold text-base mr-1 truncate" title={item.name}>{item.name}</span>
                          {item.nutritionLabelDetails && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="p-0 h-5 w-5 inline-flex items-center justify-center text-accent hover:text-accent/80"
                                  aria-label="Show nutrition details"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72 md:w-80 text-xs" side="top" align="start">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm text-primary">Nutrition Details</h4>
                                  <NutritionLabel nutritionData={item.nutritionLabelDetails} />
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>

                        {/* Second line: Quantity Controls, Calories, and Remove Button */}
                        <div className="flex items-center justify-between text-sm mt-1">
                          <div className="flex items-center space-x-3"> {/* Group Quantity and Calories */}
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleQuantityButtonClick(item.id, item.quantity || 1, -1)} aria-label="Decrease quantity">
                                <MinusCircle className="h-5 w-5" />
                              </Button>
                              <Input
                                type="text" // Changed to text to allow empty string temporarily
                                inputMode="decimal" // Hint for numeric keyboard with decimals
                                pattern="[0-9]*[.,]?[0-9]*" // Basic pattern for numbers
                                value={item.quantity === undefined ? '' : String(item.quantity)}
                                onChange={(e) => handleInputChange(item.id, e.target.value)}
                                onBlur={(e) => handleInputBlur(e, item.id)}
                                className="h-8 w-14 text-center px-1 bg-background"
                                aria-label={`Quantity for ${item.name}`}
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleQuantityButtonClick(item.id, item.quantity || 1, 1)} aria-label="Increase quantity">
                                <PlusCircle className="h-5 w-5" />
                              </Button>
                            </div>
                            {/* Calories Display */}
                            <span className="text-foreground font-medium">
                              {(item.calories * (item.quantity || 0)).toFixed(0)} kcal
                            </span>
                          </div>

                          {/* Remove Button */}
                          <Button variant="ghost" size="icon" onClick={() => onRemoveFood(item.id)} className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Remove ${item.name}`}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
