import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { isValidHexColor, standardizeHexColor } from "@/lib/colors";
import LazyColorWheel from "./lazy-wheel";
import { Input } from "./input";
import { Suspense } from "react";

/**
 * Props for the ColorPicker component.
**/
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

/**
 * A memoized color picker component that combines a color preview button with a popover
 * containing a color wheel and hex input for color selection.
**/
const ColorPicker = React.memo(function ColorPicker({ value, onChange, className }: ColorPickerProps) {
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
        <Button
          variant="outline"
          className={cn(
            "w-8 h-8 p-0 rounded-full border border-border relative overflow-hidden transition-all",
            className
          )}
          style={{ backgroundColor: value }}
          aria-label="Pick a color"
        >
          <span className="sr-only">Choose color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3">
        <Suspense fallback={<div className="w-[160px] h-[160px] rounded-full bg-muted animate-pulse" />}>
          <LazyColorWheel
            width={160}
            height={160}
            color={hsva}
            onChange={(color) => {
              setHsva(color.hsva);
              onChange(hsvaToHex(color.hsva));
            }}
          />
        </Suspense>
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <Input
            value={value}
            className="h-8 font-mono text-xs"
            onChange={(e) => {
              const newHex = e.target.value;
              if (isValidHexColor(newHex)) {
                onChange(standardizeHexColor(newHex));
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default ColorPicker;