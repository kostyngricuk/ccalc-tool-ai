
'use client';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NutritionLabel } from './NutritionLabel'; // Assuming this is adapted or used
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
      // Let onBlur handle empty input if user leaves it empty
      return;
    }

    const quantity = parseFloat(value);

    if (!isNaN(quantity)) {
      if (quantity <= 0) {
        onRemoveFood(id); // Remove item if quantity is 0 or negative
      } else {
        onUpdateQuantity(id, quantity);
      }
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, itemId: string) => {
    const foodItem = selectedFoods.find(f => f.id === itemId);
    if (!foodItem) return;

    const currentValue = e.target.value;
    
    if (currentValue === "") {
      onUpdateQuantity(itemId, 1); // Reset to 1 if input is cleared
      return;
    }
    
    const quantity = parseFloat(currentValue);
    if (isNaN(quantity) || quantity <= 0) {
       // If not a valid positive number, remove it or reset. Let's reset to 1 or last valid.
       // For simplicity, resetting to 1 if invalid, but could also revert to foodItem.quantity or remove.
      onUpdateQuantity(itemId, 1);
    }
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
        <CardDescription>Items you've added. Hover over (i) for AI-scanned nutrition details.</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFoods.length === 0 ? (
          <p className="text-muted-foreground">No items added to your meal yet. Select items from the list or add custom food.</p>
        ) : (
          <ScrollArea className="max-h-[calc(100vh-450px)] md:max-h-[400px] pr-3"> {/* Adjusted max-height */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="text-right pr-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFoods.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span>{item.name}</span>
                        {item.nutritionLabelDetails && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-1.5 p-0 h-5 w-5 inline-flex items-center justify-center text-accent hover:text-accent/80"
                                aria-label="Show nutrition details"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 md:w-80 text-xs" side="top" align="start">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">Estimated Nutrition Details</h4>
                                <NutritionLabel nutritionData={item.nutritionLabelDetails} />
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-36">
                      <div className="flex items-center justify-center space-x-1">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityButtonClick(item.id, item.quantity || 1, -1)} aria-label="Decrease quantity">
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          step="any" 
                          min="0" 
                          value={item.quantity === undefined ? '' : String(item.quantity)}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          onBlur={(e) => handleInputBlur(e, item.id)}
                          className="h-8 w-12 text-center px-1"
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityButtonClick(item.id, item.quantity || 1, 1)} aria-label="Increase quantity">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{(item.calories * (item.quantity || 0)).toFixed(0)}</TableCell>
                    <TableCell className="text-right pr-2">
                      <Button variant="ghost" size="icon" onClick={() => onRemoveFood(item.id)} className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
