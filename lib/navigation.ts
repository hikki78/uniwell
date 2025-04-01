// Helper function to determine which navigation to use

/**
 * Determines if the current path should use the public navigation (MotionNav)
 * or the internal navigation (DashboardHeader)
 */
export const isPublicPath = (path: string): boolean => {
  const publicPaths = ['/', '/sign-in', '/sign-up', '/about', '/pricing'];
  return publicPaths.includes(path) || path.startsWith('/#');
};

/**
 * Get the appropriate header component based on the current path
 */
export const getAppropriateHeader = (path: string): 'public' | 'internal' => {
  return isPublicPath(path) ? 'public' : 'internal';
};
