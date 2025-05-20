
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
  onClearAll: () => void; // New prop
}

export function SelectedFoodsList({ selectedFoods, onRemoveFood, onUpdateQuantity, onClearAll }: SelectedFoodsListProps) {
  const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = (currentQuantity || 1) + delta; // Ensure currentQuantity is at least 1 if undefined
    if (newQuantity <= 0) {
      onRemoveFood(id);
    } else {
      onUpdateQuantity(id, newQuantity);
    }
  };
  
  const handleInputChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(id, quantity);
    } else if (value === "" && selectedFoods.find(f => f.id === id)?.quantity !== undefined) {
      // If input is cleared, and it previously had a value, set to 1 or handle as preferred
      // For now, let's ensure it doesn't break, maybe set to 1
      onUpdateQuantity(id, 1); 
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
        <CardDescription>Items you've added to your current meal calculation.</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFoods.length === 0 ? (
          <p className="text-muted-foreground">No items added to your meal yet. Select items from the list or add custom food.</p>
        ) : (
          <ScrollArea className="max-h-[400px] pr-3">
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
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, item.quantity || 1, -1)} aria-label="Decrease quantity">
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1" // Min attribute for native validation, actual logic handles 0 via button
                          value={item.quantity || 1}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          onBlur={(e) => { // Ensure quantity is at least 1 on blur if input is empty or invalid
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) {
                              onUpdateQuantity(item.id, 1);
                            }
                          }}
                          className="h-8 w-12 text-center px-1"
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, item.quantity || 1, 1)} aria-label="Increase quantity">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{(item.calories * (item.quantity || 1)).toFixed(0)}</TableCell>
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
