"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollVelocityRowProps {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: 1 | -1;
  className?: string;
}

export function ScrollVelocityRow({ children, baseVelocity = 3, direction = 1, className }: ScrollVelocityRowProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false });
  const directionFactor = useRef<1 | -1>(direction);
  const copyRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    const v = velocityFactor.get();
    if (v < 0) directionFactor.current = direction === 1 ? -1 : 1;
    else if (v > 0) directionFactor.current = direction;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    moveBy += directionFactor.current * moveBy * Math.abs(v);
    baseX.set(baseX.get() + moveBy);
  });

  // wrap using modulo on the single copy width
  const x = useTransform(baseX, (v) => {
    if (!copyRef.current) return `${v}px`;
    const w = copyRef.current.offsetWidth;
    if (w === 0) return `${v}px`;
    return `${((v % w) - (direction === 1 ? w : 0))}px`;
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex w-full">
      <motion.div className={cn("flex whitespace-nowrap gap-0", className)} style={{ x }}>
        {/* render enough copies to always fill screen */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} ref={i === 0 ? copyRef : undefined} className="pr-8">{children}</span>
        ))}
      </motion.div>
    </div>
  );
}

export function ScrollVelocityContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 py-4", className)}>{children}</div>;
}
