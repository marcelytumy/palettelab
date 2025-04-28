import React from 'react';
import { Plus } from 'lucide-react';

interface AddSwatchButtonProps {
  onClick: () => void;
  className?: string;
  position?: 'between' | 'end';
}

export const AddSwatchButton = React.memo(({
  onClick,
  className = '',
  position = 'between'
}: AddSwatchButtonProps) => {
  return (
    <button
      className={`
        group relative flex items-center justify-center 
        ${position === 'between' 
          ? 'absolute z-10 h-full w-4 opacity-0 hover:opacity-100 transition-opacity' 
          : 'aspect-square w-full border-2 border-dashed border-border bg-background/50 transition-all hover:bg-background/80'}
        ${className}
      `}
      onClick={onClick}
      aria-label="Add color swatch"
    >
      <div className={`
        flex items-center justify-center 
        ${position === 'between'
          ? 'h-8 w-8 rounded-full bg-background/80 shadow-sm' 
          : ''}
      `}>
        <Plus className={`
          ${position === 'between' ? 'size-4' : 'size-6'} 
          text-foreground/70 group-hover:text-foreground/90
        `} />
      </div>
    </button>
  );
});