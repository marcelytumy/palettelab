"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hexToHSL, isValidHexColor, standardizeHexColor, PaletteType } from "@/lib/colors";
import { Toaster } from "@/components/ui/sonner";
import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePaletteGenerator } from "@/hooks/use-palette-generator";
import { PaletteControls } from "@/components/ui/palette-controls";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { debounce } from 'lodash';
import ColorPicker from "@/components/ui/color-picker";
import { Footer } from "@/components/ui/footer";

// Define available color formats
type ColorFormat = 'hex' | 'hsl' | 'oklch';

/**
 * The main page component for the PaletteLab application.
**/
export default function Home() {
  // Combined state object for color-related state
  const [colorState, setColorState] = useState({
    inputColor: "#3b82f6",
    isValidInput: true,
    paletteType: 'monochromatic' as PaletteType,
    colorFormat: 'hex' as ColorFormat
  });

  // Extract values from combined state for easier access
  const { inputColor, isValidInput, paletteType, colorFormat } = colorState;

  // State for copied states
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);

  // Use the custom hook to manage palette generation logic and state
  const { palette, textColors, loading, generatePaletteWithType } = usePaletteGenerator();

  // Memoize the function to convert colors to the selected format
  const formatColor = useMemo(() => {
    return (hexColor: string, format: ColorFormat): string => {
      try {
        switch (format) {
          case 'hex':
            return hexColor;
          case 'hsl': {
            const { h, s, l } = hexToHSL(hexColor);
            return `hsl(${Math.round(h)}deg ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
          }
          case 'oklch': {
            // This is a simplified conversion for display purposes
            const { h, s, l } = hexToHSL(hexColor);
            const chroma = s * 0.4;
            return `oklch(${Math.round(l * 100)}% ${chroma.toFixed(2)} ${Math.round(h)}deg)`;
          }
          default:
            return hexColor;
        }
      } catch (e) {
        console.error("Error formatting color:", e);
        return hexColor;
      }
    };
  }, []);

  // Memoize the color to copy based on the selected format
  const getColorToCopy = useCallback((hexColor: string): string => {
    return formatColor(hexColor, colorFormat);
  }, [colorFormat, formatColor]);

  // Parse URL hash on initial load to get shared palette details
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const parts = hash.substring(1).split('/');
        if (parts.length >= 1) {
          const colorHex = parts[0];
          if (isValidHexColor(colorHex)) {
            const standardizedHex = standardizeHexColor(colorHex);
            
            // Update color state in one operation
            setColorState(prev => ({
              ...prev,
              inputColor: standardizedHex,
              isValidInput: true,
              paletteType: parts.length >= 2 && isValidPaletteType(parts[1] as PaletteType) 
                ? parts[1] as PaletteType 
                : prev.paletteType
            }));
            
            // Generate the palette after a short delay
            setTimeout(() => {
              const type = parts.length >= 2 && isValidPaletteType(parts[1] as PaletteType)
                ? parts[1] as PaletteType
                : 'monochromatic';
                
              generatePaletteWithType(standardizedHex, type)
                .then(colors => {
                  setCopiedStates(new Array(colors.length).fill(false));
                })
                .catch(() => handleRandomColor());
            }, 100);
          } else {
            handleRandomColor();
          }
        } else {
          handleRandomColor();
        }
      } else {
        handleRandomColor();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to validate palette types
  const isValidPaletteType = (type: string): boolean => {
    const validTypes: PaletteType[] = ['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic', 'split-complementary'];
    return validTypes.includes(type as PaletteType);
  };

  /**
   * Update the URL hash with the current color and palette type for sharing.
  **/
  const updateUrlHash = useCallback((color: string, type: PaletteType) => {
    if (typeof window !== 'undefined') {
      const standardizedColor = standardizeHexColor(color);
      window.location.hash = `${standardizedColor.substring(1)}/${type}`;
    }
  }, []);

  /**
   * Handles changes to the hex color input field.
  **/
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valid = isValidHexColor(value);
    setColorState(prev => ({
      ...prev,
      inputColor: value,
      isValidInput: valid
    }));
  }, []);

  /**
   * Handles color changes from the ColorPicker component.
  **/
  const handleColorWheelChange = useCallback((color: string) => {
    setColorState(prev => ({
      ...prev,
      inputColor: color,
      isValidInput: true
    }));
  }, []);

  /**
   * Handles changes to the selected palette type dropdown.
  **/
  const handlePaletteTypeChange = useCallback((type: PaletteType) => {
    setColorState(prev => ({
      ...prev,
      paletteType: type
    }));
  }, []);

  /**
   * Sets the color format (hex, hsl, oklch)
  **/
  const setColorFormat = useCallback((format: ColorFormat) => {
    setColorState(prev => ({
      ...prev,
      colorFormat: format
    }));
  }, []);

  /**
   * Debounced palette generation
   */
  const debouncedGeneratePalette = useMemo(() => debounce(
    async (color: string, type: PaletteType) => {
      try {
        const colors = await generatePaletteWithType(color, type);
        setCopiedStates(new Array(colors.length).fill(false));
        updateUrlHash(color, type);
      } catch (error) {
        toast.error("Failed to generate palette. Please check your input color.");
      }
    }, 
    300
  ), [generatePaletteWithType, updateUrlHash]);

  /**
   * Triggers the palette generation process
  **/
  const handleGeneratePalette = useCallback(() => {
    if (isValidInput) {
      debouncedGeneratePalette(inputColor, paletteType);
    } else {
      toast.error("Please enter a valid hex color code");
    }
  }, [debouncedGeneratePalette, inputColor, isValidInput, paletteType]);

  /**
   * Generates a random hex color and triggers palette generation
  **/
  const handleRandomColor = useCallback(() => {
    const randomHex = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newColor = "#" + randomHex;

    setColorState(prev => ({
      ...prev,
      inputColor: newColor,
      isValidInput: true
    }));

    generatePaletteWithType(newColor, paletteType)
      .then(colors => {
        setCopiedStates(new Array(colors.length).fill(false));
        updateUrlHash(newColor, paletteType);
      })
      .catch(() => {
        toast.error("Failed to generate palette with random color.");
      });
  }, [generatePaletteWithType, paletteType, updateUrlHash]);

  /**
   * Copies the given color to the clipboard and provides user feedback.
  **/
  const copyToClipboard = useCallback((color: string, index: number) => {
    const formattedColor = getColorToCopy(color);
    
    navigator.clipboard.writeText(formattedColor).then(() => {
      setCopiedStates(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });

      toast.success(`Copied ${formattedColor} to clipboard!`);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => {
          const updatedState = [...prev];
          updatedState[index] = false;
          return updatedState;
        });
      }, 2000);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  }, [getColorToCopy]);

  // Memoize the share URL handler
  const handleShareClick = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${inputColor.substring(1)}/${paletteType}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Share URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy share URL");
      });
  }, [inputColor, paletteType]);

  // Precompute formatted color values for the palette
  const formattedColorValues = useMemo(() => {
    return palette.map(color => formatColor(color, colorFormat));
  }, [palette, colorFormat, formatColor]);

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
        <PaletteControls 
          inputColor={inputColor}
          isValidInput={isValidInput}
          paletteType={paletteType}
          colorFormat={colorFormat}
          loading={loading}
          showShareButton={palette.length > 0}
          handleColorWheelChange={handleColorWheelChange}
          handleInputChange={handleInputChange}
          handlePaletteTypeChange={handlePaletteTypeChange}
          handleGeneratePalette={handleGeneratePalette}
          handleRandomColor={handleRandomColor}
          handleShareClick={handleShareClick}
          setColorFormat={setColorFormat}
          ColorPicker={ColorPicker}
        />

        {/* Palette display section - only shown if a palette exists */}
        {palette.length > 0 && (
          <div className="space-y-8">
            {/* Grid layout for color swatches */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
              {palette.map((color, index) => (
                <ColorSwatch
                  key={color + index}
                  color={color}
                  textColor={textColors[index]}
                  isCopied={copiedStates[index]}
                  onClick={() => copyToClipboard(color, index)}
                  colorFormatted={formattedColorValues[index]}
                />
              ))}
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground text-center">
              Click on a color to copy its <code>{colorFormat.toUpperCase()}</code> value
            </p>
          </div>
        )}

        {/* Footer section */}
        <Footer />
      </div>

      {/* Toaster component to display notifications */}
      <Toaster position="bottom-right" />
    </main>
  );
}