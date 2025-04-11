
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Coffee, Leaf, Droplets } from "lucide-react";

interface FoodSuggestion {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PainReliefSuggestions = () => {
  const suggestions: FoodSuggestion[] = [
    {
      title: "Ginger Tea",
      description: "Anti-inflammatory properties that may reduce cramps",
      icon: <Coffee className="h-5 w-5 text-amber-500" />
    },
    {
      title: "Dark Leafy Greens",
      description: "Rich in iron and calcium to combat fatigue",
      icon: <Leaf className="h-5 w-5 text-green-500" />
    },
    {
      title: "Berries & Fruits",
      description: "Antioxidants help reduce inflammation",
      icon: <Apple className="h-5 w-5 text-red-500" />
    },
    {
      title: "Stay Hydrated",
      description: "Water helps reduce bloating and cramping",
      icon: <Droplets className="h-5 w-5 text-blue-500" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Food-Based Pain Relief</CardTitle>
        <CardDescription>Natural remedies that may help ease menstrual discomfort</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="mt-1">{suggestion.icon}</div>
              <div>
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PainReliefSuggestions;
