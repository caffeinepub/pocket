/**
 * Lightweight motion shim — replaces motion/react API with CSS-transition-based equivalents.
 * Covers the basic patterns used in this app: motion.div with initial/animate/exit,
 * AnimatePresence (renders children), and layout prop (ignored).
 */

import React, { useEffect, useRef, useState } from "react";

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  initial?: Record<string, number | string>;
  animate?: Record<string, number | string>;
  exit?: Record<string, number | string>;
  transition?: { duration?: number; delay?: number; ease?: string };
  layout?: boolean;
  whileHover?: Record<string, number | string>;
  layoutId?: string;
  as?: React.ElementType;
};

function mapToStyle(
  props?: Record<string, number | string>,
): React.CSSProperties {
  if (!props) return {};
  const style: React.CSSProperties = {};
  if (props.opacity !== undefined) style.opacity = props.opacity as number;
  if (props.y !== undefined) style.transform = `translateY(${props.y}px)`;
  if (props.x !== undefined) style.transform = `translateX(${props.x}px)`;
  if (props.scale !== undefined) style.transform = `scale(${props.scale})`;
  return style;
}

export const motion = {
  div: React.forwardRef<HTMLDivElement, MotionProps>(function MotionDiv(
    {
      initial,
      animate,
      exit: _exit,
      transition,
      layout: _layout,
      whileHover,
      layoutId: _layoutId,
      as: _as,
      style,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const dur = transition?.duration ?? 0.3;

    useEffect(() => {
      requestAnimationFrame(() => setMounted(true));
    }, []);

    const baseStyle = !mounted ? mapToStyle(initial) : mapToStyle(animate);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          transition: `opacity ${dur}s ease, transform ${dur}s ease`,
          ...baseStyle,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }),

  aside: React.forwardRef<
    HTMLElement,
    MotionProps & React.HTMLAttributes<HTMLElement>
  >(function MotionAside(
    {
      initial: _i,
      animate,
      exit: _exit,
      transition,
      layout: _layout,
      whileHover: _wh,
      layoutId: _lid,
      as: _as,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const dur = transition?.duration ?? 0.25;
    // For aside (sidebar width animation), use CSS transition on width
    const widthStyle =
      animate?.width !== undefined ? { width: animate.width } : {};
    return (
      <aside
        ref={ref as React.Ref<HTMLElement>}
        style={{
          transition: `width ${dur}s ease`,
          ...widthStyle,
          ...style,
        }}
        {...rest}
      >
        {children}
      </aside>
    );
  }),

  span: React.forwardRef<HTMLSpanElement, MotionProps>(function MotionSpan(
    {
      initial,
      animate,
      exit: _exit,
      transition,
      layout: _layout,
      whileHover: _wh,
      layoutId: _lid,
      as: _as,
      style,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const dur = transition?.duration ?? 0.2;

    useEffect(() => {
      requestAnimationFrame(() => setMounted(true));
    }, []);

    const baseStyle = !mounted ? mapToStyle(initial) : mapToStyle(animate);

    return (
      <span
        ref={ref}
        className={className}
        style={{
          transition: `opacity ${dur}s ease, transform ${dur}s ease`,
          display: "inline-block",
          overflow: "hidden",
          ...baseStyle,
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }),

  tr: React.forwardRef<HTMLTableRowElement, MotionProps>(function MotionTr(
    {
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      layout: _l,
      whileHover: _wh,
      layoutId: _lid,
      as: _as,
      style,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <tr ref={ref} className={className} style={style} {...rest}>
        {children}
      </tr>
    );
  }),
};

// AnimatePresence — just renders children (no exit animations needed for basic use)
export function AnimatePresence({
  children,
}: { children: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}
