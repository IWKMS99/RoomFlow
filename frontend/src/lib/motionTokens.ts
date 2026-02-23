export const motionTokens = {
  camera: {
    type: 'spring' as const,
    stiffness: 165,
    damping: 26,
    mass: 0.9,
  },
  overlay: {
    type: 'spring' as const,
    stiffness: 210,
    damping: 24,
    mass: 0.86,
  },
  card: {
    type: 'spring' as const,
    stiffness: 240,
    damping: 22,
    mass: 0.82,
  },
  control: {
    type: 'spring' as const,
    stiffness: 280,
    damping: 20,
    mass: 0.78,
  },
  fade: {
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};
