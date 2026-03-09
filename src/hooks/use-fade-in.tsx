import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import styles from "../routes/_app/index.module.css";

export function FadeInSection({
  children,
  className = "",
  threshold = 0.15,
  ...props
}: { children: ReactNode; className?: string; threshold?: number } & React.HTMLAttributes<HTMLDivElement>): ReactNode {
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
      className={`${styles.fadeSection} ${isVisible ? styles.fadeSectionVisible : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
