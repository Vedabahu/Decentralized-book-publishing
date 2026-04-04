"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // Spacer to avoid layout shift matching single icon dimensions
  }

  const cycleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Binary toggle, defaulting any weird cached states to light
    const nextTheme = theme === "dark" ? "light" : "dark";

    // If browser doesn't support the raw View Transitions logic, fallback safely
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Capture the absolute positional click to use as the center origin
    const x = e.clientX;
    const y = e.clientY;

    // Draw the radius straight to the furthest corner dynamically
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full border border-border shadow-sm bg-secondary text-secondary-foreground hover:opacity-80 transition-all flex justify-center items-center active:scale-95 relative"
      title={`Current Theme: ${theme === "dark" ? "Dark" : "Light"}`}
    >
      {/* Key forces react to completely unmount and remount the div, triggering the keyframe animation perfectly */}
      <div
        key={theme}
        className="animate-icon-reveal flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </div>
    </button>
  );
}
