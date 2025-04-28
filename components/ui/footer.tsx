import React from 'react';
import { LuGithub } from "react-icons/lu";

export const Footer = React.memo(function Footer() {
  return (
    <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
      <div className="flex items-center gap-2 justify-center">
        <LuGithub size={12} />
        <a
          href="https://github.com/marcelytumy/palettelab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <span>repo</span>
        </a>
        <a
          href="https://github.com/marcelytumy/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <span>@marcelytumy</span>
        </a>
      </div>
    </footer>
  );
});