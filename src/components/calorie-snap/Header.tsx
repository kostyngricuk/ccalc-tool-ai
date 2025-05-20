import { UtensilsCrossed } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="flex items-center space-x-3 text-primary mb-4">
        <UtensilsCrossed className="h-10 w-10" />
        <h1 className="text-4xl font-bold tracking-tight">AI Calorie Calculator</h1>
      </div>
      <p className="mt-1 text-lg text-muted-foreground text-center">
        Track your daily intake with ease. <br />Select foods, add custom items, or snap a photo!
      </p>
    </header>
  );
}
