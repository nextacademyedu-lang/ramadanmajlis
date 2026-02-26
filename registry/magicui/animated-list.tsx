"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  delay?: number;
}

export function AnimatedList({ children, className, delay = 600 }: AnimatedListProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = children.length;

  // Start only when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || visibleCount >= total) return;
    const t = setTimeout(() => setVisibleCount(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [started, visibleCount, total, delay]);

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)}>
      {children.slice(0, visibleCount).map((child, i) => (
        <div
          key={i}
          style={{ animation: "agendaSlideIn 0.4s cubic-bezier(0.21,1.02,0.73,1) forwards" }}
        >
          {child}
        </div>
      ))}
      <style>{`
        @keyframes agendaSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
