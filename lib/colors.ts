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

export const generateMonochromaticPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  
  const { h, s, l } = hexToHSL(standardHex);
  
  const tint1 = hslToHex(h, s, Math.min(l + 0.2, 0.95));
  const tint2 = hslToHex(h, s, Math.min(l + 0.4, 0.97));
  
  const shade1 = hslToHex(h, s, Math.max(l - 0.2, 0.15));
  const shade2 = hslToHex(h, s, Math.max(l - 0.4, 0.05));
  
  return [tint2, tint1, standardHex, shade1, shade2];
};

export const generateAnalogousPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  return [
    hslToHex((h - 40 + 360) % 360, s, l),
    hslToHex((h - 20 + 360) % 360, s, l),
    standardHex,
    hslToHex((h + 20) % 360, s, l),
    hslToHex((h + 40) % 360, s, l)
  ];
};

export const generateComplementaryPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const complementH = (h + 180) % 360;
  
  return [
    hslToHex(h, Math.max(0.1, s - 0.2), Math.min(0.9, l + 0.1)),
    standardHex,
    hslToHex(h, Math.min(1.0, s + 0.1), Math.max(0.1, l - 0.1)),
    hslToHex(complementH, Math.max(0.1, s - 0.2), Math.min(0.9, l + 0.1)),
    hslToHex(complementH, s, l)
  ];
};

export const generateTriadicPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const triad1H = (h + 120) % 360;
  const triad2H = (h + 240) % 360;
  
  return [
    standardHex,
    hslToHex(h, Math.min(1.0, s + 0.05), Math.max(0.1, l - 0.1)),
    hslToHex(triad1H, s, l),
    hslToHex(triad1H, Math.min(1.0, s + 0.05), Math.max(0.1, l - 0.1)),
    hslToHex(triad2H, s, l)
  ];
};

export const generateTetradicPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const tetrad1H = (h + 90) % 360;
  const tetrad2H = (h + 180) % 360;
  const tetrad3H = (h + 270) % 360;
  
  return [
    standardHex,
    hslToHex(tetrad1H, s, l),
    hslToHex(tetrad2H, s, l),
    hslToHex(tetrad3H, s, l),
    hslToHex(h, Math.max(0.1, s - 0.3), Math.min(0.95, l + 0.2))
  ];
};

export const generateSplitComplementaryPalette = (baseColor: string): string[] => {
  const standardHex = standardizeHexColor(baseColor);
  const { h, s, l } = hexToHSL(standardHex);
  
  const splitComplement1H = (h + 150) % 360;
  const splitComplement2H = (h + 210) % 360;
  
  return [
    hslToHex(h, Math.max(0.1, s - 0.1), Math.min(0.95, l + 0.1)),
    standardHex,
    hslToHex(h, Math.min(1.0, s + 0.1), Math.max(0.1, l - 0.1)),
    hslToHex(splitComplement1H, s, l),
    hslToHex(splitComplement2H, s, l)
  ];
};

export const generatePalette = (
  baseColor: string, 
  type: PaletteType = 'monochromatic'
): string[] => {
  switch (type) {
    case 'analogous':
      return generateAnalogousPalette(baseColor);
    case 'complementary':
      return generateComplementaryPalette(baseColor);
    case 'triadic':
      return generateTriadicPalette(baseColor);
    case 'tetradic':
      return generateTetradicPalette(baseColor);
    case 'split-complementary':
      return generateSplitComplementaryPalette(baseColor);
    case 'monochromatic':
    default:
      return generateMonochromaticPalette(baseColor);
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