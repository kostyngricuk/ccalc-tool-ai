
'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Using standard Label
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, AlertTriangle, Loader2 } from 'lucide-react';
import { estimateCaloriesFromImage } from '@/ai/flows/estimate-calories-from-image';
import { useToast } from "@/hooks/use-toast";
import type { FoodItem } from '@/lib/types';
import { FormItem } from "@/components/ui/form"; // For structural grouping

interface ImageUploadProps {
  onFoodEstimated: (foodItem: FoodItem) => void;
}

export function ImageUpload({ onFoodEstimated }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmitImage = async () => {
    if (!selectedFile || !imagePreview) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await estimateCaloriesFromImage({ photoDataUri: imagePreview });
      
      const { itemName, calories, protein, carbs, fat } = result; 

      const nutritionDetailsString = [
        `Calories: ${(calories || 0).toFixed(0)} kcal`,
        `Protein: ${(protein || 0).toFixed(1)} g`,
        `Carbs: ${(carbs || 0).toFixed(1)} g`,
        `Fat: ${(fat || 0).toFixed(1)} g`
      ].join('\n');

      const newFoodItem: FoodItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName || 'Scanned Meal',
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        quantity: 1,
        custom: true, 
        nutritionLabelDetails: nutritionDetailsString, 
      };
      onFoodEstimated(newFoodItem);

      toast({
        title: "Analysis Complete!",
        description: `${newFoodItem.name} added to your meal. Hover over the (i) icon for details.`,
      });

      // Clear the form after successful submission
      setImagePreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }

    } catch (err) {
      console.error("AI processing error:", err);
      let userErrorMessage = "An unknown error occurred during image analysis.";
      if (err instanceof Error) {
        if (err.message.includes("503") || err.message.toLowerCase().includes("service unavailable") || err.message.toLowerCase().includes("model is overloaded")) {
          userErrorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
        } else if (err.message.toLowerCase().includes("deadline exceeded")) {
          userErrorMessage = "The request to the AI service timed out. Please try again.";
        } else {
          userErrorMessage = err.message;
        }
      }
      setError(userErrorMessage);
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: userErrorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-accent/50">
      <CardHeader>
        <CardTitle className="text-2xl text-accent">Estimate from Image</CardTitle>
        <CardDescription>Upload a photo of your meal. The estimated item will be added to your meal, and you can hover over it for nutritional details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormItem>
          <Label htmlFor="food-image-upload">Upload Food Image</Label>
          <Input
            id="food-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="w-full border-dashed border-2 border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent py-8 mt-2"
            aria-label="Upload food image"
          >
            <div className="flex flex-col items-center space-y-2">
              <UploadCloud className="h-10 w-10" />
              <span>{selectedFile ? selectedFile.name : "Click or drag to upload image"}</span>
            </div>
          </Button>
        </FormItem>

        {imagePreview && (
          <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
            <Image
              src={imagePreview}
              alt="Food preview"
              width={400}
              height={300}
              className="object-contain w-full h-auto max-h-64"
              data-ai-hint="food meal"
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedFile && (
          <Button
            onClick={handleSubmitImage}
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Estimating &amp; Adding...
              </>
            ) : (
              <>
                Estimate &amp; Add to Meal
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
