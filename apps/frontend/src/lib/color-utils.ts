export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getDynamicCategoryColors(primaryHexColor: string): Record<string, string> {
  const { h, s, l } = hexToHsl(primaryHexColor);

  return {
    PROJECT: `hsl(${h}, ${s}%, ${l}%)`,
    RESPONSIBILITY: `hsl(${(h + 20) % 360}, ${Math.max(10, s - 5)}%, ${Math.min(90, l + 10)}%)`,
    EVENT: 'hsl(0, 0%, 40%)',
    MAINTENANCE: `hsl(${h}, ${Math.max(10, s - 15)}%, ${Math.max(15, l - 15)}%)`,
    SIMONYI: `hsl(${(h + 40) % 360}, ${Math.max(10, s - 10)}%, ${Math.min(90, l + 15)}%)`,
    OTHER: 'hsl(0, 0%, 70%)',
  };
}

export function getDynamicDifficultyColors(primaryHexColor: string): Record<string, string> {
  const { h, s, l } = hexToHsl(primaryHexColor);

  return {
    SMALL: `hsl(${(h + 40) % 360}, ${Math.max(10, s - 10)}%, ${Math.min(90, l + 15)}%)`,
    MEDIUM: `hsl(${(h + 20) % 360}, ${Math.max(10, s - 5)}%, ${Math.min(90, l + 10)}%)`,
    LARGE: `hsl(${h}, ${s}%, ${l}%)`,
  };
}
