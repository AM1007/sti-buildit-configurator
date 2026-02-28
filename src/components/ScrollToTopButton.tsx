import { useState, useEffect, useCallback } from "react";
import { ChevronUp } from "lucide-react";

const SHOW_THRESHOLD = 100;
const CIRCLE_RADIUS = 19;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    setVisible(scrollY > SHOW_THRESHOLD);
    setProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 md:bottom-20 md:right-6 xl:bottom-8 xl:right-8 xl:h-12 xl:w-12 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 44 44"
        fill="none"
      >
        <circle
          cx="22"
          cy="22"
          r={CIRCLE_RADIUS}
          stroke="#e2e8f0"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="22"
          cy="22"
          r={CIRCLE_RADIUS}
          stroke="#c8102e"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
      <ChevronUp className="relative h-5 w-5 text-brand-600 xl:h-5.5 xl:w-5.5" />
    </button>
  );
}