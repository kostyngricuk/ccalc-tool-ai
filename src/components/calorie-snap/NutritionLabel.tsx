import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NutritionLabelProps {
  nutritionData: string | null;
  isLoading: boolean;
}

export function NutritionLabel({ nutritionData, isLoading }: NutritionLabelProps) {
  if (isLoading) {
    return (
        <Card className="mt-6 shadow-md">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Estimated Nutrition Facts</CardTitle>
                <CardDescription>Analyzing your image...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/5"></div>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!nutritionData) {
    return null;
  }

  // Basic parsing for display, assuming lines are distinct facts
  const lines = nutritionData.split('\n').filter(line => line.trim() !== '');

  return (
    <Card className="mt-6 shadow-md border-2 border-primary/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Estimated Nutrition Facts</CardTitle>
        <CardDescription>Based on the uploaded image.</CardDescription>
      </CardHeader>
      <CardContent>
        {lines.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {lines.map((line, index) => {
              const parts = line.split(':');
              const isHeader = parts.length === 1 || line.toLowerCase().includes('nutrition label') || line.toLowerCase().includes('serving size');
              return (
                <li key={index} className={`py-1 ${isHeader ? 'font-semibold text-primary text-md_ mt-2_ mb-1' : 'flex justify-between'}`}>
                  {isHeader ? (
                    <span>{line}</span>
                  ) : (
                    <>
                      <span className="font-medium">{parts[0]}:</span>
                      <span className="text-right">{parts.slice(1).join(':').trim()}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">Could not extract detailed nutrition facts. Raw data: </p>
        )}
         {lines.length === 0 && <pre className="mt-2 p-3 bg-muted rounded-md text-xs whitespace-pre-wrap break-all">{nutritionData}</pre>}
      </CardContent>
    </Card>
  );
}
