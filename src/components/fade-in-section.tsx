import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

export function FadeInSection({
  children,
  className = "",
  threshold = 0.15,
  delayMs = 0,
  variant = "up",
  ...props
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
  delayMs?: number;
  variant?: "up" | "left" | "right" | "scale";
} & React.HTMLAttributes<HTMLDivElement>): ReactNode {
  const [isVisible, setIsVisible] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
  }, []);

  return (
    <div
      ref={setRef}
      className={`fadeSection ${isVisible ? "fadeSectionVisible" : ""} ${className}`}
      data-motion={variant}
      style={{ ...props.style, "--fade-delay": `${delayMs}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
