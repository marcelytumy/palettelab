import * as React from "react"

// Define the breakpoint for mobile devices (pixels)
const MOBILE_BREAKPOINT = 768 // Common breakpoint for tablets/large phones

/**
 * Custom hook to determine if the current viewport width is considered "mobile".
 * It listens to window resize events and updates the state accordingly.
 *
 * @returns {boolean} `true` if the window width is less than `MOBILE_BREAKPOINT`, `false` otherwise.
 *                    Returns `false` during server-side rendering or initial client mount before hydration.
**/
export function useIsMobile() {
  // State to store whether the viewport is mobile. Initialized as undefined
  // to handle server-side rendering and initial client mount gracefully.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check if window is defined (ensures code runs only in the browser)
    if (typeof window === 'undefined') {
      return;
    }

    // Create a media query list object targeting screens narrower than the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Function to update the state based on the current window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Event listener for changes in the media query match status (e.g., resizing, orientation change)
    // Note: Using addEventListener/removeEventListener for modern compatibility
    mql.addEventListener("change", checkMobile)

    // Initial check when the component mounts on the client-side
    checkMobile();

    // Cleanup function: remove the event listener when the component unmounts
    return () => mql.removeEventListener("change", checkMobile)
  }, []) // Empty dependency array ensures this effect runs only once on mount

  // Return the boolean state. `!!undefined` becomes `false`, providing a default
  // value before the client-side check completes.
  return !!isMobile
}
