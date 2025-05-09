import React from 'react';
import { Copy, Check, Minus } from "lucide-react";

interface ColorSwatchProps {
  color: string;
  textColor: string;
  isCopied: boolean;
  onClick: () => void;
  colorFormatted: string;
  onRemove?: () => void;
  canRemove?: boolean;
}

export const ColorSwatch = React.memo(({
  color,
  textColor,
  isCopied,
  onClick,
  colorFormatted,
  onRemove,
  canRemove = true
}: ColorSwatchProps) => {
  // Stop propagation so remove button doesn't trigger the copy action
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div
      className="group relative aspect-square w-full cursor-pointer transition-all duration-200"
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {/* Minus button in top-right corner */}
      {onRemove && canRemove && (
        <button 
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/30 hover:bg-black/50 rounded-full p-0.5"
          onClick={handleRemoveClick}
          aria-label="Remove swatch"
        >
          <Minus className="size-3" style={{ color: textColor }} />
        </button>
      )}

      {/* Overlay shown on hover, containing color code and copy icon */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
      >
        <div className="flex flex-col items-center justify-center gap-1">
          {/* Display color in selected format */}
          <span
            className="font-mono text-xs tracking-wider text-center px-1"
            style={{ color: textColor }}
          >
            {colorFormatted}
          </span>
          {/* Show Check icon if copied, otherwise Copy icon */}
          {isCopied ? (
            <Check className="size-4" style={{ color: textColor }} />
          ) : (
            <Copy className="size-4" style={{ color: textColor }} />
          )}
        </div>
      </div>
    </div>
  );
});