'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, UploadCloud, AlertTriangle, Loader2 } from 'lucide-react';
import { estimateCaloriesFromImage, EstimateCaloriesFromImageOutput } from '@/ai/flows/estimate-calories-from-image';
import { NutritionLabel } from './NutritionLabel';
import { useToast } from "@/hooks/use-toast";


export function ImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionResult, setNutritionResult] = useState<EstimateCaloriesFromImageOutput | null>(null);
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
      setNutritionResult(null);
    }
  };

  const handleSubmitImage = async () => {
    if (!selectedFile || !imagePreview) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNutritionResult(null);

    try {
      // The imagePreview is already a data URI (checked by FileReader onloadend)
      const result = await estimateCaloriesFromImage({ photoDataUri: imagePreview });
      setNutritionResult(result);
      toast({
        title: "Analysis Complete!",
        description: "Nutritional information estimated successfully.",
      });
    } catch (err) {
      console.error("AI processing error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image analysis.");
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not estimate calories from the image.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-accent/50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-accent" />
          <CardTitle className="text-2xl text-accent">Estimate from Image</CardTitle>
        </div>
        <CardDescription>Upload a photo of your meal to get an AI-powered nutritional estimate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="food-image-upload" className="sr-only">Upload Food Image</Label>
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
            className="w-full border-dashed border-2 border-input hover:border-accent text-muted-foreground hover:text-accent py-8"
            aria-label="Upload food image"
          >
            <div className="flex flex-col items-center space-y-2">
              <UploadCloud className="h-10 w-10" />
              <span>{selectedFile ? selectedFile.name : "Click or drag to upload image"}</span>
            </div>
          </Button>
        </div>

        {imagePreview && (
          <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
            <Image
              src={imagePreview}
              alt="Food preview"
              width={400}
              height={300}
              className="object-cover w-full h-auto max-h-64"
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

        <Button
          onClick={handleSubmitImage}
          disabled={!selectedFile || isLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Estimating...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Estimate Calories
            </>
          )}
        </Button>
        
        <NutritionLabel nutritionData={nutritionResult?.nutritionLabel ?? null} isLoading={isLoading && !error} />

      </CardContent>
    </Card>
  );
}
