export const motionPreset = {
  spring: {
    type: 'spring' as const,
    stiffness: 290,
    damping: 24,
    mass: 0.78,
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 210,
    damping: 26,
    mass: 0.94,
  },
  quick: {duration: 0.17, ease: 'easeOut' as const},
  standard: {duration: 0.24, ease: 'easeOut' as const},
  smooth: {duration: 0.34, ease: [0.22, 1, 0.36, 1] as const},
  smoothSoft: {duration: 0.44, ease: [0.16, 1, 0.3, 1] as const},
  overlay: {duration: 0.22, ease: [0.22, 1, 0.36, 1] as const},
};

export const motionVariant = {
  screen: {
    initial: {opacity: 0, y: 14},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: -8},
  },
  swap: {
    initial: {opacity: 0, y: 8},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: -6},
  },
  listItem: {
    initial: {opacity: 0, y: 8},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: -6},
  },
  slideHorizontal: {
    initial: (direction: number) => ({
      opacity: 0.98,
      x: direction >= 0 ? 56 : -56,
      scale: 0.995,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      opacity: 0.96,
      x: direction >= 0 ? -56 : 56,
      scale: 0.995,
    }),
  },
};
