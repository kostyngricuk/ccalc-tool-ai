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
}

export function SelectedFoodsList({ selectedFoods, onRemoveFood, onUpdateQuantity }: SelectedFoodsListProps) {
  const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    onUpdateQuantity(id, newQuantity);
  };
  
  const handleInputChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(id, quantity);
    } else if (value === "") {
      // Allow empty input temporarily, maybe set to 1 if blurred empty
    }
  };


  if (selectedFoods.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Current Meal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No items added to your meal yet. Select items from the list or add custom food.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Current Meal</CardTitle>
        <CardDescription>Items you've added to your current meal calculation.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[300px] sm:h-[400px] pr-3">
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
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
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
      </CardContent>
    </Card>
  );
}
