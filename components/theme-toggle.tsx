"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * A component that provides a dropdown menu to switch between
 * light, dark, and system themes using the `next-themes` library.
**/
export function ThemeToggle() {
  // Get the setTheme function from the useTheme hook
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      {/* The trigger for the dropdown is a button with theme icons */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">

          {/* Sun icon shown in light mode */}
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          
          {/* Moon icon shown in dark mode */}
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          
          {/* Screen reader text */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/* The content of the dropdown menu */}
      <DropdownMenuContent align="end">
        {/* Menu item to set the theme to light */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        
        {/* Menu item to set the theme to dark */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        
        {/* Menu item to set the theme based on system preference */}
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}