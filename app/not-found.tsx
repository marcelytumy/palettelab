import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { PaletteType } from '@/lib/colors'; // Import PaletteType from colors.ts

export default function NotFound() {
  // Generate a random gradient for visual interest
  const colors = [
    ['#FF5F6D', '#FFC371'], // Red to Yellow
    ['#4158D0', '#C850C0'], // Blue to Purple
    ['#0093E9', '#80D0C7'], // Blue to Teal
    ['#8EC5FC', '#E0C3FC'], // Light Blue to Lavender
    ['#FFDEE9', '#B5FFFC'], // Pink to Cyan
  ];
  
  // Generate a random hex color (similar to handleRandomColor in page.tsx)
  const randomHex = '#' + Array.from(
    { length: 6 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  // Define available palette types
  const paletteTypes: PaletteType[] = [
    'monochromatic',
    'analogous',
    'complementary',
    'triadic',
    'tetradic',
    'split-complementary'
  ];
  
  // Pick a random palette type
  const randomPaletteType = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
  
  // Generate random gradient
  const randomGradient = colors[Math.floor(Math.random() * colors.length)];

  return (
    <main className="min-h-screen py-10 px-4 flex flex-col items-center justify-center">
      {/* Header section matching main page */}
      <div className="mb-8 flex items-center justify-center gap-2">
        <Palette className="size-5 text-foreground/80" />
        <h1 className="text-xl font-medium tracking-tight">PaletteLab</h1>
      </div>

      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Colorful visual element with random color */}
        <div 
          className="w-32 h-32 rounded-full mb-6 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${randomGradient[0]} 0%, ${randomGradient[1]} 100%)`,
          }}
        >
          <span className="font-bold text-5xl text-white">404</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-2">
          Looks like this color palette doesn't exist yet!
        </p>
        
        {/* Show the randomly generated color and palette type */}
        <p className="text-sm font-mono bg-muted p-2 rounded-md mb-8">
          Try <span className="font-semibold" style={{ color: randomHex }}>{randomHex}</span> with {randomPaletteType} palette
        </p>
        
        {/* Fix: Adding proper href to the Link component */}
        <Button asChild>
          <Link href="/">Go back to PaletteLab</Link>
        </Button>
      </div>
    </main>
  );
}