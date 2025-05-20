
interface NutritionLabelProps {
  nutritionData: string | null;
}

export function NutritionLabel({ nutritionData }: NutritionLabelProps) {
  if (!nutritionData) {
    return <p className="text-xs text-muted-foreground">No nutrition details available.</p>;
  }

  const lines = nutritionData.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    return (
      <div className="text-xs">
        <p className="text-muted-foreground mb-1">Raw data:</p>
        <pre className="p-2 bg-muted/50 rounded-md whitespace-pre-wrap break-all">{nutritionData}</pre>
      </div>
    );
  }

  return (
    <ul className="space-y-0.5 text-xs">
      {lines.map((line, index) => {
        const parts = line.split(':');
        const isHeader = parts.length === 1 || line.toLowerCase().includes('nutrition label') || line.toLowerCase().includes('serving size') || line.toLowerCase().includes('facts');
        
        if (isHeader) {
          // Don't render standalone headers like "Nutrition Label:" in the popover, focus on facts.
          // Allow headers that are part of the facts list like "Total Fat" if it's not split by ":"
          if (line.toLowerCase().includes('nutrition label') || line.toLowerCase().includes('estimated nutrition facts')) return null;
          return (
             <li key={index} className={`pt-1 font-semibold ${index > 0 ? 'mt-1 border-t border-border/50' : ''}`}>
                {line}
             </li>
          );
        }

        return (
          <li key={index} className="flex justify-between">
            <span className="font-medium_ text-muted-foreground_ mr-2">{parts[0]}:</span>
            <span className="text-right_ text-foreground font-medium">{parts.slice(1).join(':').trim()}</span>
          </li>
        );
      })}
    </ul>
  );
}
