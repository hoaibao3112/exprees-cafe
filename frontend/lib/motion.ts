import { Variants } from 'framer-motion';

// Easing cong tự nhiên kiểu "premium" (giống cubic-bezier đang dùng trong globals.css)
export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_BOUNCE },
  },
};

// Container cho stagger — con của nó chỉ cần variants "fadeUp"/"scaleUp" cho item
export const staggerContainer = (staggerDelay = 0.12, initialDelay = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

// Spring dùng cho hover / tap của card & button (cảm giác đàn hồi thật hơn transition CSS)
export const springHover = { type: 'spring' as const, stiffness: 300, damping: 20 };
export const springTap = { type: 'spring' as const, stiffness: 400, damping: 15 };
