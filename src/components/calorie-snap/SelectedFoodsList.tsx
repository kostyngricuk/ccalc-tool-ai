
'use client';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, MinusCircle } from 'lucide-react';
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
      // Or, you could temporarily set an 'invalid' visual state on the input
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
    // If not a valid number (e.g. "abc"), do nothing for now.
    // Browser's type="number" might prevent some, onBlur will catch others.
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, itemId: string) => {
    const foodItem = selectedFoods.find(f => f.id === itemId);
    if (!foodItem) return; // Item might have been removed by handleInputChange

    const currentValue = e.target.value;
    
    if (currentValue === "") {
      // If blurred while empty, reset quantity to 1
      onUpdateQuantity(itemId, 1);
      return;
    }
    
    const quantity = parseFloat(currentValue);
    if (isNaN(quantity) || quantity <= 0) {
      // If blurred with invalid text (e.g. "abc") or non-positive number (e.g. "-5")
      // (and item wasn't already removed if "0" was typed), reset to 1.
      onUpdateQuantity(itemId, 1);
    }
    // If it was a valid positive number, handleInputChange would have already set it.
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
        <CardDescription>Items you've added to your current meal calculation.</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFoods.length === 0 ? (
          <p className="text-muted-foreground">No items added to your meal yet. Select items from the list or add custom food.</p>
        ) : (
          <ScrollArea className="max-h-[400px] pr-3"> {/* Consider max-h-[calc(100vh-X)] if footer is an issue */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFoods.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center w-36">
                      <div className="flex items-center justify-center space-x-1">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityButtonClick(item.id, item.quantity || 1, -1)} aria-label="Decrease quantity">
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          step="any" // Allow decimals
                          min="0" // Allow typing 0, logic will handle removal
                          value={item.quantity === undefined ? '' : String(item.quantity)} // Display current quantity or empty for editing
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
                    <TableCell className="text-right">{(item.calories * (item.quantity || 0)).toFixed(0)}</TableCell> {/* Use 0 if quantity is undefined for calculation */}
                    <TableCell className="text-right">
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
