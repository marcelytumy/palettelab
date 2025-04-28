import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidHexColor, standardizeHexColor, PaletteType, hexToHSL } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shuffle, Share } from "lucide-react";

// Define props for the PaletteControls component
interface PaletteControlsProps {
  inputColor: string;
  isValidInput: boolean;
  paletteType: PaletteType;
  colorFormat: 'hex' | 'hsl' | 'oklch';
  loading: boolean;
  showShareButton?: boolean;
  handleColorWheelChange: (color: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaletteTypeChange: (type: PaletteType) => void;
  handleGeneratePalette: () => void;
  handleRandomColor: () => void;
  handleShareClick?: () => void;
  setColorFormat: (format: 'hex' | 'hsl' | 'oklch') => void;
  ColorPicker: React.ComponentType<any>;
}

// Memoized PaletteControls component
export const PaletteControls = React.memo(({
  inputColor,
  isValidInput,
  paletteType,
  colorFormat,
  loading,
  showShareButton = false,
  handleColorWheelChange,
  handleInputChange,
  handlePaletteTypeChange,
  handleGeneratePalette,
  handleRandomColor,
  handleShareClick,
  setColorFormat,
  ColorPicker
}: PaletteControlsProps) => {
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
        {/* Color Format Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs flex items-center gap-1.5"
            >
              <div 
                className="w-3 h-3 rounded-full border border-border/50" 
                style={{ backgroundColor: inputColor }}
              />
              {colorFormat.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem 
              onClick={() => setColorFormat('hex')}
              className="flex justify-between items-center"
            >
              <span>HEX</span>
              <code className="text-xs text-muted-foreground">#{inputColor.substring(1, 7)}</code>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setColorFormat('hsl')}
              className="flex justify-between items-center"
            >
              <span>HSL</span>
              <code className="text-xs text-muted-foreground truncate w-16">
                {(() => {
                  try {
                    const { h, s, l } = hexToHSL(inputColor);
                    return `${Math.round(h)}°`;
                  } catch (e) {
                    return "HSL";
                  }
                })()}
              </code>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setColorFormat('oklch')}
              className="flex justify-between items-center"
            >
              <span>OKLCH</span>
              <code className="text-xs text-muted-foreground">L:C:H</code>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Palette Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="h-8 text-xs w-[110px]"
            >
              {paletteTypes.find(pt => pt.value === paletteType)?.label || 'Type'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {paletteTypes.map((type) => (
              <DropdownMenuItem 
                key={type.value}
                onClick={() => handlePaletteTypeChange(type.value)}
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Generate Palette Button */}
        <Button
          onClick={handleGeneratePalette}
          disabled={!isValidInput || loading} // Disable if input invalid or loading
          size="sm"
          variant="outline"
          className="h-8 px-3"
        >
            <span>Generate</span>
        </Button>
        
        {/* Random Color Button */}
        <Button
          onClick={handleRandomColor}
          disabled={loading} // Disable while generating
          size="sm"
          variant="outline"
          className="h-8 px-3"
        >
          <span><Shuffle /></span>
        </Button>

        {/* Share Button */}
        {showShareButton && handleShareClick && (
          <Button
            onClick={handleShareClick}
            size="sm"
            variant="outline"
            className="h-8 px-3"
          >
            <span><Share /></span>
          </Button>
        )}
      </div>
    </div>
  );
});