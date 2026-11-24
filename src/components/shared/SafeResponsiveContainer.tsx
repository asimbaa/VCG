import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

interface SafeResponsiveContainerProps {
  children: React.ReactNode;
  minHeight?: number;
  className?: string;
}

/**
 * Prevents Recharts "width(0) and height(0) of chart should be greater than 0" warnings
 * by observing container dimensions with ResizeObserver and only mounting ResponsiveContainer
 * once both measured width and height are strictly positive.
 */
export const SafeResponsiveContainer: React.FC<SafeResponsiveContainerProps> = ({
  children,
  minHeight = 160,
  className = "w-full h-full min-w-0",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.offsetParent === null) {
        setSize((prev) => (prev.width === 0 && prev.height === 0 ? prev : { width: 0, height: 0 }));
        return;
      }
      const rect = el.getBoundingClientRect();
      const nextW = Math.floor(rect.width);
      const nextH = Math.floor(rect.height);
      setSize((prev) => {
        if (prev.width === nextW && prev.height === nextH) return prev;
        return { width: nextW, height: nextH };
      });
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    const id = window.setInterval(updateSize, 250);
    return () => window.clearInterval(id);
  }, []);

  const hasPositiveSize = size.width > 10 && size.height > 10;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: `${minHeight}px`, minWidth: 0 }}
    >
      {hasPositiveSize ? (
        <ResponsiveContainer
          width={size.width}
          height={Math.max(size.height, minHeight)}
          minWidth={1}
          minHeight={minHeight}
        >
          {children as React.ReactElement}
        </ResponsiveContainer>
      ) : (
        <div
          className="w-full flex items-center justify-center opacity-0"
          style={{ height: `${minHeight}px` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
