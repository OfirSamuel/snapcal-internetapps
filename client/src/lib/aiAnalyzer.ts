export function estimateCalories(description: string) {
  // Simple heuristic for demo purposes
  let calories = 300;
  let protein = 15;
  let carbs = 30;
  let fat = 10;

  const desc = description.toLowerCase();

  if (desc.includes('chicken') || desc.includes('beef') || desc.includes('salmon') || desc.includes('protein')) {
    calories += 200;
    protein += 25;
  }
  if (desc.includes('rice') || desc.includes('pasta') || desc.includes('bread') || desc.includes('potato')) {
    calories += 150;
    carbs += 35;
  }
  if (desc.includes('avocado') || desc.includes('oil') || desc.includes('butter') || desc.includes('cheese')) {
    calories += 120;
    fat += 15;
  }
  if (desc.includes('salad') || desc.includes('vegetables') || desc.includes('greens')) {
    calories -= 50;
    carbs += 10;
  }

  // Add some randomness for realism
  const randomFactor = Math.floor(Math.random() * 40) - 20;

  return {
    calories: Math.max(50, calories + randomFactor),
    protein: Math.max(0, protein + Math.floor(randomFactor / 4)),
    carbs: Math.max(0, carbs + Math.floor(randomFactor / 4)),
    fat: Math.max(0, fat + Math.floor(randomFactor / 6)),
  };
}
