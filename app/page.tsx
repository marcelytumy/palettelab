"use client"

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner"; // For displaying notifications
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidHexColor, standardizeHexColor, PaletteType } from "@/lib/colors"; // Color utility functions
import { cn } from "@/lib/utils"; // Utility for conditional class names
import { Toaster } from "@/components/ui/sonner"; // Component to render toasts

import { Copy, Check, Palette } from "lucide-react"; // Icons
import { LuGithub } from "react-icons/lu" // GitHub Icon

import Wheel from '@uiw/react-color-wheel'; // Color wheel component
import { hsvaToHex, hexToHsva } from '@uiw/color-convert'; // Color conversion utilities
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Popover component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"; // Select dropdown component
import { ThemeToggle } from "@/components/theme-toggle"; // Theme switching component
import { usePaletteGenerator } from "@/hooks/use-palette-generator"; // Custom hook for palette generation

/**
 * Props for the ColorPicker component.
**/
interface ColorPickerProps {
  value: string; // Current hex color value
  onChange: (color: string) => void; // Callback when the color changes
  className?: string; // Optional additional class names
}

/**
 * A component that combines a color preview button with a popover
 * containing a color wheel and hex input for color selection.
**/
function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  // State for the color wheel, using HSVa (Hue, Saturation, Value, Alpha)
  const [hsva, setHsva] = useState(() => hexToHsva(value || '#ffffff'));

  // Update internal HSVa state if the external hex value changes
  useEffect(() => {
    if (value) {
      try {
        setHsva(hexToHsva(value));
      } catch (e) {
        // Ignore errors if the hex is temporarily invalid during input
        console.warn("Invalid hex for HSVa conversion:", value);
      }
    }
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Button displaying the selected color */}
        <Button
          variant="outline"
          className={cn(
            "w-8 h-8 p-0 rounded-full border border-border relative overflow-hidden transition-all",
            className
          )}
          style={{ backgroundColor: value }} // Dynamically set background color
          aria-label="Pick a color"
        >
          <span className="sr-only">Choose color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3">
        {/* Color Wheel */}
        <Wheel
          width={160}
          height={160}
          color={hsva}
          onChange={(color) => {
            // Update HSVa state and call the onChange prop with the new hex value
            setHsva(color.hsva);
            onChange(hsvaToHex(color.hsva));
          }}
        />
        {/* Color Preview and Hex Input */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: value }} // Show selected color
          />
          <Input
            value={value}
            className="h-8 font-mono text-xs"
            onChange={(e) => {
              // Allow direct hex input, validate and standardize before calling onChange
              const newHex = e.target.value;
              if (isValidHexColor(newHex)) {
                onChange(standardizeHexColor(newHex));
              } else {
                // If not valid hex, maybe update input visually but don't trigger onChange yet
                // Or potentially allow partial input if the parent component handles it
              }
            }}
            // Consider adding validation feedback directly to the input
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The main page component for the PaletteLab application.
 * Allows users to input a color, select a palette type, generate palettes,
 * view the results, and copy colors to the clipboard.
**/
export default function Home() {
  // State for the base color input (hex format)
  const [inputColor, setInputColor] = useState("#3b82f6");
  // State to track if the input color is a valid hex code
  const [isValidInput, setIsValidInput] = useState(true);
  // State for the selected palette generation type
  const [paletteType, setPaletteType] = useState<PaletteType>('monochromatic');
  // State to manage the "copied" status feedback for each color swatch
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);

  // Use the custom hook to manage palette generation logic and state
  const { palette, textColors, loading, generatePaletteWithType } = usePaletteGenerator();

  // Parse URL hash on initial load to get shared palette details
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # symbol and split by /
        const parts = hash.substring(1).split('/');
        if (parts.length >= 1) {
          const colorHex = parts[0];
          // Validate the hex color
          if (isValidHexColor(colorHex)) {
            const standardizedHex = standardizeHexColor(colorHex);
            setInputColor(standardizedHex);
            setIsValidInput(true);
            
            // Get palette type if available
            if (parts.length >= 2) {
              const type = parts[1] as PaletteType;
              // Ensure it's a valid palette type
              const validTypes: PaletteType[] = ['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic', 'split-complementary'];
              if (validTypes.includes(type)) {
                setPaletteType(type);
              }
            }
            
            // Generate the palette after a short delay to ensure state is updated
            setTimeout(() => {
              generatePaletteWithType(standardizedHex, parts.length >= 2 ? parts[1] as PaletteType : 'monochromatic')
                .then(colors => {
                  setCopiedStates(new Array(colors.length).fill(false));
                })
                .catch(error => {
                  console.error("Error generating palette from URL:", error);
                  // If there's an error, fall back to random palette
                  handleRandomColor();
                });
            }, 100);
          } else {
            // If invalid hex in URL, use default random palette
            handleRandomColor();
          }
        } else {
          // If no useful data in hash, use default random palette
          handleRandomColor();
        }
      } else {
        // No hash, generate a random palette
        handleRandomColor();
      }
    }
    // Empty dependency array ensures this runs only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Update the URL hash with the current color and palette type for sharing.
   */
  const updateUrlHash = useCallback((color: string, type: PaletteType) => {
    if (typeof window !== 'undefined') {
      const standardizedColor = standardizeHexColor(color);
      window.location.hash = `${standardizedColor.substring(1)}/${type}`;
    }
  }, []);

  /**
   * Handles changes to the hex color input field.
   * Updates the input color state and validates the input.
  **/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputColor(value);
    setIsValidInput(isValidHexColor(value));
  };

  /**
   * Handles color changes originating from the ColorPicker component.
   * Updates the input color state and validates the new color.
  **/
  const handleColorWheelChange = (color: string) => {
    setInputColor(color);
    setIsValidInput(isValidHexColor(color));
  };

  /**
   * Handles changes to the selected palette type dropdown.
   * Updates the palette type state. Wrapped in useCallback for potential optimization.
  **/
  const handlePaletteTypeChange = useCallback((type: PaletteType) => {
    setPaletteType(type);
    // Note: Palette generation is triggered by the "Generate" button, not directly here.
  }, []); // No dependencies needed as it only sets state

  /**
   * Triggers the palette generation process using the current input color and type.
   * Shows error toast if input is invalid. Updates copied states on success.
   * Wrapped in useCallback to memoize the function based on its dependencies.
  **/
  const handleGeneratePalette = useCallback(() => {
    if (isValidInput) {
      generatePaletteWithType(inputColor, paletteType)
        .then(colors => {
          // Reset copied states for the new palette
          setCopiedStates(new Array(colors.length).fill(false));
          // Update URL hash for sharing
          updateUrlHash(inputColor, paletteType);
        })
        .catch(error => {
          // Show error notification if generation fails
          toast.error("Failed to generate palette. Please check your input color.");
          console.error("Palette generation error:", error); // Log error for debugging
        });
    } else {
      // Show error notification if the input color is invalid
      toast.error("Please enter a valid hex color code");
    }
  }, [generatePaletteWithType, inputColor, isValidInput, paletteType, updateUrlHash]);

  /**
   * Generates a random hex color, updates the input state,
   * and triggers palette generation with the new random color.
   * Wrapped in useCallback for memoization.
  **/
  const handleRandomColor = useCallback(() => {
    // Generate a random 6-digit hex color string
    const randomHex = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newColor = "#" + randomHex;

    // Update the input color state
    setInputColor(newColor);
    // Assume the generated color is valid
    setIsValidInput(true);

    // Generate palette with the new random color and current type
    generatePaletteWithType(newColor, paletteType)
      .then(colors => {
        // Reset copied states for the new palette
        setCopiedStates(new Array(colors.length).fill(false));
        // Update URL hash for sharing
        updateUrlHash(newColor, paletteType);
      })
      .catch(error => {
        // Show error notification if generation fails (less likely with random)
        toast.error("Failed to generate palette with random color.");
        console.error("Random palette generation error:", error); // Log error
      });
    // Dependencies ensure the function is recreated if necessary
  }, [generatePaletteWithType, paletteType, updateUrlHash]);

  /**
   * Copies the given color hex code to the clipboard and provides user feedback.
   * Updates the copied state for the specific color swatch.
  **/
  const copyToClipboard = (color: string, index: number) => {
    navigator.clipboard.writeText(color).then(() => {
      // Update the copied state for the clicked swatch to true
      const newState = [...copiedStates];
      newState[index] = true;
      setCopiedStates(newState);

      // Show success notification
      toast.success(`Copied ${color} to clipboard!`);

      // Reset the copied state for this swatch after 2 seconds
      setTimeout(() => {
        // Use a functional update to ensure state consistency if rapid clicks occur
        setCopiedStates(prev => {
          const updatedState = [...prev];
          updatedState[index] = false;
          return updatedState;
        });
      }, 2000);
    }).catch((err) => {
      // Show error notification if copying fails
      toast.error("Failed to copy to clipboard");
      console.error("Clipboard copy error:", err); // Log error
    });
  };

  // Define the available palette types for the Select dropdown
  const paletteTypes: { value: PaletteType; label: string }[] = [
    { value: 'monochromatic', label: 'Mono' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'split-complementary', label: 'Split' },
  ];

  return (
    <main className="min-h-screen py-10 px-4 flex flex-col items-center justify-center">

      {/* Theme toggle button positioned at the top right */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main content container */}
      <div className="w-full max-w-2xl flex flex-col min-h-[80vh] justify-center">

        {/* Header section */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Palette className="size-5 text-foreground/80" />
          <h1 className="text-xl font-medium tracking-tight">PaletteLab</h1>
        </div>


        {/* Input controls section */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Color Picker and Hex Input */}
          <div className="flex gap-2 items-center grow">
            <ColorPicker
              value={inputColor}
              onChange={handleColorWheelChange}
              className={cn(
                // Apply red border if the input is invalid
                !isValidInput && "border-red-500"
              )}
            />

            <Input
              value={inputColor}
              onChange={handleInputChange}
              placeholder="#3b82f6" // Example hex color
              className={cn(
                "font-mono flex-grow h-8 text-sm",
                // Apply red border if the input is invalid
                !isValidInput && "border-red-500"
              )}
              // Allow submitting with Enter key
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePalette()}
            />
          </div>

          {/* Palette Type Selector */}
          <Select
            onValueChange={handlePaletteTypeChange}
            defaultValue={paletteType}
            disabled={loading} // Disable while generating
          >
            <SelectTrigger className="h-8 text-xs w-[110px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {paletteTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Random Color Button */}
          <Button
            onClick={handleRandomColor}
            disabled={loading} // Disable while generating
            size="sm"
            variant="outline"
            className="h-8 px-3"
          >
              <span>Random</span>
          </Button>

          {/* Generate Palette Button */}
          <Button
            onClick={handleGeneratePalette}
            disabled={!isValidInput || loading} // Disable if input invalid or loading
            size="sm"
            variant="outline" // Changed to outline to match Random button
            className="h-8 px-3"
          >
              <span>Generate</span>
          </Button>

          {/* Share Button - only shown when a palette exists */}
          {palette.length > 0 && (
            <Button
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}#${inputColor.substring(1)}/${paletteType}`;
                navigator.clipboard.writeText(url)
                  .then(() => {
                    toast.success("Share URL copied to clipboard!");
                  })
                  .catch((err) => {
                    toast.error("Failed to copy share URL");
                    console.error("Clipboard copy error:", err);
                  });
              }}
              size="sm"
              variant="outline"
              className="h-8 px-3"
            >
              <span>Share</span>
            </Button>
          )}
        </div>


        {/* Palette display section - only shown if a palette exists */}
        {palette.length > 0 && (
          <div className="space-y-8">
            {/* Grid layout for color swatches */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="group relative aspect-square w-full cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: color }} // Set swatch background color
                  onClick={() => copyToClipboard(color, index)} // Copy color on click
                >
                  {/* Overlay shown on hover, containing color code and copy icon */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20" // Added subtle background for better text visibility
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      {/* Display hex code */}
                      <span
                        className="font-mono text-xs tracking-wider"
                        style={{ color: textColors[index] }} // Use contrast text color
                      >
                        {color}
                      </span>
                      {/* Show Check icon if copied, otherwise Copy icon */}
                      {copiedStates[index] ? (
                        <Check className="size-4" style={{ color: textColors[index] }} />
                      ) : (
                        <Copy className="size-4" style={{ color: textColors[index] }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground text-center">
              Click on a color to copy its hex code
            </p>
          </div>
        )}


        {/* Footer section */}
        <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2 justify-center">
            <LuGithub size={12} />
            {/* Link to the GitHub repository */}
            <a
              href="https://github.com/marcelytumy/palettelab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>repo</span>
            </a>
            {/* Link to the author's GitHub profile */}
            <a
              href="https://github.com/marcelytumy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>@marcelytumy</span>
            </a>
          </div>
        </footer>
      </div>

      {/* Toaster component to display notifications */}
      <Toaster position="bottom-right" />
    </main>
  );
}