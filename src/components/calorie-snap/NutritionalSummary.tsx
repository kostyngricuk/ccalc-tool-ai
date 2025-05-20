import type { NutritionalInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Drumstick, Apple, CookingPot } from 'lucide-react';

interface NutritionalSummaryProps {
  totals: NutritionalInfo;
}

const NutrientDisplay = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: number, unit: string }) => (
  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3">
      <Icon className="h-6 w-6 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
    </div>
    <span className="font-semibold text-lg text-primary">{value.toFixed(1)} {unit}</span>
  </div>
);

export function NutritionalSummary({ totals }: NutritionalSummaryProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Nutritional Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NutrientDisplay icon={Flame} label="Total Calories" value={totals.calories} unit="kcal" />
        <NutrientDisplay icon={Drumstick} label="Total Protein" value={totals.protein} unit="g" />
        <NutrientDisplay icon={Apple} label="Total Carbs" value={totals.carbs} unit="g" />
        <NutrientDisplay icon={CookingPot} label="Total Fat" value={totals.fat} unit="g" />
      </CardContent>
    </Card>
  );
}
