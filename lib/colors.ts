export const hexToHSL = (hexColor: string): { h: number; s: number; l: number } => {
  const hex = hexColor.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h *= 60;
  }
  
  return { h, s, l };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, (h / 360) + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, (h / 360) - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const isValidHexColor = (color: string): boolean => {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color);
};

export const standardizeHexColor = (color: string): string => {
  const hex = color.startsWith('#') ? color : `#${color}`;
  
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  
  return hex;
};

export type PaletteType = 
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary';

export const generateMonochromaticPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  // Default to 5 swatches if count is less than 3
  const count = Math.max(3, swatchCount);
  const result: string[] = [];
  
  // Ensure the base color is always included in the middle
  const middleIndex = Math.floor((count - 1) / 2);
  
  // Calculate step size for tints and shades based on count
  const stepSize = count <= 5 ? 0.2 : 0.8 / Math.floor(count / 2);
  
  // Generate tints (lighter versions)
  for (let i = middleIndex - 1; i >= 0; i--) {
    const steps = middleIndex - i;
    const tint = hslToHex(h, s, Math.min(l + (steps * stepSize), 0.97));
    result.unshift(tint);
  }
  
  // Add the base color
  result.push(standardHex);
  
  // Generate shades (darker versions)
  for (let i = middleIndex + 1; i < count; i++) {
    const steps = i - middleIndex;
    const shade = hslToHex(h, s, Math.max(l - (steps * stepSize), 0.05));
    result.push(shade);
  }
  
  return result;
};

export const generateAnalogousPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  // Default to 5 swatches if count is less than 3
  const count = Math.max(3, swatchCount);
  const result: string[] = [];
  
  // Calculate the angle step based on count
  const angleStep = count <= 5 ? 20 : 80 / Math.floor(count / 2);
  
  // Calculate how many colors on each side of the base color
  const colorsPerSide = Math.floor(count / 2);
  const hasMiddle = count % 2 !== 0;
  
  // Generate colors with decreasing hue
  for (let i = colorsPerSide; i > 0; i--) {
    result.push(hslToHex((h - (i * angleStep) + 360) % 360, s, l));
  }
  
  // Add the base color if we have an odd number of swatches
  if (hasMiddle) {
    result.push(standardHex);
  }
  
  // Generate colors with increasing hue
  for (let i = 1; i <= colorsPerSide; i++) {
    result.push(hslToHex((h + (i * angleStep)) % 360, s, l));
  }
  
  return result;
};

export const generateComplementaryPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  const complementH = (h + 180) % 360;
  
  // Default to minimum 4 swatches
  const count = Math.max(4, swatchCount);
  const result: string[] = [];
  
  const mainColorCount = Math.ceil(count / 2);
  const complementColorCount = Math.floor(count / 2);
  
  // Generate variations of the main color
  const mainStepSize = 0.3 / (mainColorCount - 1);
  for (let i = 0; i < mainColorCount; i++) {
    if (i === 0) {
      result.push(hslToHex(h, Math.max(0.1, s - 0.2), Math.min(0.9, l + 0.1)));
    } else if (i === 1) {
      result.push(standardHex);
    } else {
      result.push(hslToHex(h, Math.min(1.0, s + ((i - 1) * mainStepSize)), 
                         Math.max(0.1, l - ((i - 1) * mainStepSize))));
    }
  }
  
  // Generate variations of the complementary color
  const compStepSize = 0.3 / Math.max(1, complementColorCount - 1);
  for (let i = 0; i < complementColorCount; i++) {
    if (i === 0) {
      result.push(hslToHex(complementH, Math.max(0.1, s - 0.2), Math.min(0.9, l + 0.1)));
    } else {
      result.push(hslToHex(complementH, Math.min(1.0, s + ((i - 1) * compStepSize)),
                         Math.max(0.1, l - ((i - 1) * compStepSize))));
    }
  }
  
  return result;
};

export const generateTriadicPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const triad1H = (h + 120) % 360;
  const triad2H = (h + 240) % 360;
  
  // Adjust the count to be at least 3 (one for each triad)
  const count = Math.max(3, swatchCount);
  const result: string[] = [];
  
  // Calculate how many colors to generate for each triad point
  const colorsForBase = Math.ceil(count / 3);
  const colorsForTriad1 = Math.floor((count - colorsForBase) / 2);
  const colorsForTriad2 = count - colorsForBase - colorsForTriad1;
  
  // Generate base color variations
  for (let i = 0; i < colorsForBase; i++) {
    if (i === 0) {
      result.push(standardHex);
    } else {
      const step = i / colorsForBase;
      result.push(hslToHex(h, Math.min(1.0, s + (0.05 * step)), Math.max(0.1, l - (0.1 * step))));
    }
  }
  
  // Generate triad1 variations
  for (let i = 0; i < colorsForTriad1; i++) {
    if (i === 0) {
      result.push(hslToHex(triad1H, s, l));
    } else {
      const step = i / colorsForTriad1;
      result.push(hslToHex(triad1H, Math.min(1.0, s + (0.05 * step)), Math.max(0.1, l - (0.1 * step))));
    }
  }
  
  // Generate triad2 variations
  for (let i = 0; i < colorsForTriad2; i++) {
    if (i === 0) {
      result.push(hslToHex(triad2H, s, l));
    } else {
      const step = i / colorsForTriad2;
      result.push(hslToHex(triad2H, Math.min(1.0, s + (0.05 * step)), Math.max(0.1, l - (0.1 * step))));
    }
  }
  
  return result;
};

export const generateTetradicPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const tetrad1H = (h + 90) % 360;
  const tetrad2H = (h + 180) % 360;
  const tetrad3H = (h + 270) % 360;
  
  // Adjust the count to be at least 4 (one for each tetrad point)
  const count = Math.max(4, swatchCount);
  const result: string[] = [];
  
  // Distribute colors evenly among the tetrad points
  let remaining = count;
  const baseCount = Math.ceil(remaining / 4);
  remaining -= baseCount;
  const tetrad1Count = Math.ceil(remaining / 3);
  remaining -= tetrad1Count;
  const tetrad2Count = Math.ceil(remaining / 2);
  remaining -= tetrad2Count;
  const tetrad3Count = remaining;
  
  // Add base color variations
  for (let i = 0; i < baseCount; i++) {
    if (i === 0) {
      result.push(standardHex);
    } else {
      result.push(hslToHex(h, Math.max(0.1, s - (0.3 * i / baseCount)), Math.min(0.95, l + (0.2 * i / baseCount))));
    }
  }
  
  // Add tetrad1 variations
  for (let i = 0; i < tetrad1Count; i++) {
    result.push(hslToHex(tetrad1H, s, l));
  }
  
  // Add tetrad2 variations
  for (let i = 0; i < tetrad2Count; i++) {
    result.push(hslToHex(tetrad2H, s, l));
  }
  
  // Add tetrad3 variations
  for (let i = 0; i < tetrad3Count; i++) {
    result.push(hslToHex(tetrad3H, s, l));
  }
  
  return result;
};

export const generateSplitComplementaryPalette = (baseColor: string, swatchCount: number = 5): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const splitComplement1H = (h + 150) % 360;
  const splitComplement2H = (h + 210) % 360;
  
  // Adjust the count to be at least 3
  const count = Math.max(3, swatchCount);
  const result: string[] = [];
  
  // Calculate distribution of colors
  const baseColorCount = Math.ceil(count / 3);
  const split1Count = Math.floor((count - baseColorCount) / 2);
  const split2Count = count - baseColorCount - split1Count;
  
  // Add base color variations
  for (let i = 0; i < baseColorCount; i++) {
    if (i === 0) {
      result.push(hslToHex(h, Math.max(0.1, s - 0.1), Math.min(0.95, l + 0.1)));
    } else if (i === 1) {
      result.push(standardHex);
    } else {
      result.push(hslToHex(h, Math.min(1.0, s + 0.1), Math.max(0.1, l - 0.1)));
    }
  }
  
  // Add split complement 1 variations
  for (let i = 0; i < split1Count; i++) {
    result.push(hslToHex(splitComplement1H, s, l));
  }
  
  // Add split complement 2 variations
  for (let i = 0; i < split2Count; i++) {
    result.push(hslToHex(splitComplement2H, s, l));
  }
  
  return result;
};

export const generatePalette = (
  baseColor: string, 
  type: PaletteType = 'monochromatic',
  swatchCount: number = 5
): string[] => {
  switch (type) {
    case 'analogous':
      return generateAnalogousPalette(baseColor, swatchCount);
    case 'complementary':
      return generateComplementaryPalette(baseColor, swatchCount);
    case 'triadic':
      return generateTriadicPalette(baseColor, swatchCount);
    case 'tetradic':
      return generateTetradicPalette(baseColor, swatchCount);
    case 'split-complementary':
      return generateSplitComplementaryPalette(baseColor, swatchCount);
    case 'monochromatic':
    default:
      return generateMonochromaticPalette(baseColor, swatchCount);
  }
};

export const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq >= 128 ? '#000000' : '#ffffff';
};