"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Renders a full-screen loading indicator that appears on initial page load
**/
export default function PageLoading() {
  // State to control the visibility of the loading overlay
  const [loading, setLoading] = useState(true);

  // State to trigger the fade-out animation
  const [fadeOut, setFadeOut] = useState(false);

  // Effect to handle the initial loading and fade-out sequence
  useEffect(() => {
    // Only run if the component is currently in the loading state
    if (!loading) return;

    // Timer to start the fade-out animation after 800ms
    const loadTimer = setTimeout(() => {
      setFadeOut(true);

      // Timer to hide the component completely after the 500ms fade-out animation
      const fadeTimer = setTimeout(() => {
        setLoading(false);
      }, 500); // Matches the duration-500 class

      // Cleanup function for the fade-out timer
      return () => clearTimeout(fadeTimer);
    }, 800); // Initial delay before starting fade-out

    // Cleanup function for the initial load timer
    return () => clearTimeout(loadTimer);
  }, [loading]); // Dependency array ensures this runs only when `loading` changes

  // If not loading, render nothing
  if (!loading) return null;

  // Render the loading overlay with fade-out animation
  return (
    <div
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Container for the loading animation elements */}
      <div className="flex flex-col items-center space-y-4">
        {/* Relative container for the spinner */}
        <div className="relative size-24">
          {/* Spinning gradient border */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(30, 100%, 50%), hsl(60, 100%, 50%), hsl(90, 100%, 50%), hsl(120, 100%, 50%), hsl(150, 100%, 50%), hsl(180, 100%, 50%), hsl(210, 100%, 50%), hsl(240, 100%, 50%), hsl(270, 100%, 50%), hsl(300, 100%, 50%), hsl(330, 100%, 50%), hsl(360, 100%, 50%))',
              animationDuration: '3s' // Controls the speed of the spin
            }}
          />

          {/* Inner circle element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 bg-white rounded-full shadow-md z-10 flex items-center justify-center">
              {/* Small gradient circle inside */}
              <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}