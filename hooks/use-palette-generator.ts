import { useState, useCallback, useMemo } from 'react';
import { generatePalette, PaletteType, getContrastColor } from '@/lib/colors';

/**
 * Interface defining the structure for storing generated palette colors
 * and their corresponding contrast text colors.
 */
interface PaletteColors {
  colors: string[]; // Array of hex color strings in the palette
  textColors: string[]; // Array of hex color strings suitable for text on the corresponding palette color
}

/**
 * Custom hook for generating color palettes based on a base color and type.
 * It handles asynchronous generation, loading states, and caching of results.
 *
 * @returns An object containing:
 *  - `palette`: An array of hex color strings for the generated palette.
 *  - `textColors`: An array of hex color strings for contrasting text on each palette color.
 *  - `loading`: A boolean indicating if palette generation is in progress.
 *  - `generatePaletteWithType`: A function to trigger palette generation.
 */
export function usePaletteGenerator() {
  // State to store the current palette (colors and text colors)
  const [palette, setPalette] = useState<PaletteColors>({
    colors: [],
    textColors: []
  });
  // State to track the loading status of palette generation
  const [loading, setLoading] = useState(false);

  /**
   * Asynchronously generates a palette using the core `generatePalette` function.
   * Wrapped in useCallback for memoization. Includes a minimal delay (0ms)
   * to ensure the function behaves asynchronously, allowing loading states to update.
   */
  const generatePaletteAsync = useCallback(async (
    baseColor: string,
    type: PaletteType
  ): Promise<string[]> => {
    // Introduce a minimal delay to ensure asynchronous behavior for loading state updates
    await new Promise(resolve => setTimeout(resolve, 0));
    return generatePalette(baseColor, type);
  }, []);

  /**
   * Memoized cache (Map) to store previously generated palettes.
   * The key is a combination of the base color and palette type.
   * This prevents redundant calculations for the same inputs.
   */
  const cachedResults = useMemo(() => {
    return new Map<string, PaletteColors>();
  }, []);

  /**
   * Generates a palette of a specific type based on the input color.
   * Checks the cache first. If not found, generates the palette,
   * calculates contrast text colors, stores the result in the cache,
   * updates the state, and returns the generated colors.
   * Handles loading state and potential errors.
   * Wrapped in useCallback for memoization, depends on cache and async generator.
   */
  const generatePaletteWithType = useCallback(async (
    baseColor: string,
    type: PaletteType
  ) => {
    // Create a unique key for caching based on input color and palette type
    const cacheKey = `${baseColor}-${type}`;

    // Check if the result is already in the cache
    if (cachedResults.has(cacheKey)) {
      // If cached, retrieve and set the state, then return the colors
      const cachedPalette = cachedResults.get(cacheKey)!;
      setPalette(cachedPalette);
      return cachedPalette.colors;
    }

    // If not cached, proceed with generation
    try {
      // Set loading state to true
      setLoading(true);

      // Generate the palette colors asynchronously
      const colors = await generatePaletteAsync(baseColor, type);

      // Calculate the appropriate text color (black or white) for each palette color
      const textColors = colors.map(color => getContrastColor(color));

      // Combine colors and text colors into the result object
      const result = { colors, textColors };

      // Store the newly generated result in the cache
      cachedResults.set(cacheKey, result);
      // Update the component's state with the new palette
      setPalette(result);

      // Return the generated colors
      return colors;
    } catch (error) {
      // Log any errors during palette generation
      console.error("Failed to generate palette:", error);
      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      // Ensure loading state is set back to false, regardless of success or failure
      setLoading(false);
    }
  }, [cachedResults, generatePaletteAsync]); // Dependencies for useCallback

  // Return the hook's public API
  return {
    palette: palette.colors, // The generated palette colors
    textColors: palette.textColors, // Corresponding text colors
    loading, // Loading state indicator
    generatePaletteWithType // Function to trigger generation
  };
}