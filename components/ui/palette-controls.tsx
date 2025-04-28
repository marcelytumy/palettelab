import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidHexColor, standardizeHexColor, PaletteType, hexToHSL } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shuffle, Share, Plus, Minus } from "lucide-react";

// Create a context for palette controls functions and state
interface PaletteControlsContextType {
  handleGeneratePalette: () => void;
  handleRandomColor: () => void;
  handleShareClick?: () => void;
  handlePaletteTypeChange: (type: PaletteType) => void;
  isValidInput: boolean;
  loading: boolean;
  paletteType: PaletteType;
}

const PaletteControlsContext = createContext<PaletteControlsContextType | null>(null);

// Create a provider component to wrap the PaletteControls
const PaletteControlsProvider: React.FC<PaletteControlsContextType & { children: React.ReactNode }> = ({ 
  children, 
  ...contextValue
}) => {
  // Use useMemo to ensure the context value doesn't change unnecessarily
  const value = useMemo(() => contextValue, [
    contextValue.handleGeneratePalette,
    contextValue.handleRandomColor,
    contextValue.handleShareClick,
    contextValue.handlePaletteTypeChange,
    contextValue.isValidInput,
    contextValue.loading,
    contextValue.paletteType
  ]);
  
  return (
    <PaletteControlsContext.Provider value={value}>
      {children}
    </PaletteControlsContext.Provider>
  );
};

// Hook to use palette controls context
const usePaletteControls = () => {
  const context = useContext(PaletteControlsContext);
  if (!context) {
    throw new Error("usePaletteControls must be used within a PaletteControlsProvider");
  }
  return context;
};

// Completely separate memoized button components that use the context
const GenerateButton = React.memo(() => {
  const { handleGeneratePalette, isValidInput, loading } = usePaletteControls();
  
  return (
    <Button
      onClick={handleGeneratePalette}
      disabled={!isValidInput || loading}
      size="sm"
      variant="outline"
      className="h-8 px-3"
    >
      <span>Generate</span>
    </Button>
  );
});

const RandomColorButton = React.memo(() => {
  const { handleRandomColor, loading } = usePaletteControls();
  
  return (
    <Button
      onClick={handleRandomColor}
      disabled={loading}
      size="sm"
      variant="outline"
      className="h-8 px-3"
    >
      <span><Shuffle /></span>
    </Button>
  );
});

const ShareButton = React.memo(() => {
  const { handleShareClick } = usePaletteControls();
  
  if (!handleShareClick) return null;
  
  return (
    <Button
      onClick={handleShareClick}
      size="sm"
      variant="outline"
      className="h-8 px-3"
    >
      <span><Share /></span>
    </Button>
  );
});

// Memoized palette type selector using context
const PaletteTypeSelector = React.memo(() => {
  const { paletteType, loading, handlePaletteTypeChange } = usePaletteControls();
  
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
  );
});

// Define props for the PaletteControls component
interface PaletteControlsProps {
  inputColor: string;
  isValidInput: boolean;
  paletteType: PaletteType;
  colorFormat: 'hex' | 'hsl' | 'oklch';
  loading: boolean;
  showShareButton?: boolean;
  swatchCount: number;
  handleColorWheelChange: (color: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaletteTypeChange: (type: PaletteType) => void;
  handleGeneratePalette: () => void;
  handleRandomColor: () => void;
  handleShareClick?: () => void;
  setColorFormat: (format: 'hex' | 'hsl' | 'oklch') => void;
  handleSwatchCountChange: (count: number) => void;
  ColorPicker: React.ComponentType<any>;
}

// Main component with context provider
export const PaletteControls = React.memo(({
  inputColor,
  isValidInput,
  paletteType,
  colorFormat,
  loading,
  showShareButton = false,
  swatchCount = 5,
  handleColorWheelChange,
  handleInputChange,
  handlePaletteTypeChange,
  handleGeneratePalette,
  handleRandomColor,
  handleShareClick,
  setColorFormat,
  ColorPicker
}: PaletteControlsProps) => {
  
  // The context value - these functions won't change references
  const contextValue = useMemo(() => ({
    handleGeneratePalette,
    handleRandomColor,
    handleShareClick: showShareButton ? handleShareClick : undefined,
    handlePaletteTypeChange,
    isValidInput,
    loading,
    paletteType
  }), [
    handleGeneratePalette,
    handleRandomColor,
    handleShareClick,
    handlePaletteTypeChange,
    isValidInput,
    loading,
    paletteType,
    showShareButton
  ]);
  
  return (
    <PaletteControlsProvider {...contextValue}>
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Color Picker and Hex Input */}
        <div className="flex gap-2 items-center grow">
          <ColorPicker
            value={inputColor}
            onChange={handleColorWheelChange}
            className={cn(
              !isValidInput && "border-red-500"
            )}
          />

          <Input
            value={inputColor}
            onChange={handleInputChange}
            placeholder="#3b82f6"
            className={cn(
              "font-mono flex-grow h-8 text-sm",
              !isValidInput && "border-red-500"
            )}
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

          {/* Components that don't need to re-render when the parent re-renders */}
          <PaletteTypeSelector />
          <GenerateButton />
          <RandomColorButton />
          {showShareButton && handleShareClick && <ShareButton />}
        </div>
      </div>
    </PaletteControlsProvider>
  );
});