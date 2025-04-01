/**
 * Application color palette
 * Purple theme to replace the previous red theme
 */

export const colors = {
  // Main brand colors
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  
  // Accent colors
  accent: {
    light: '#9c4dcc',
    medium: '#8a2be2',
    dark: '#6b0f92',
  },
  
  // Gradient definitions
  gradients: {
    primary: 'from-[#9c4dcc] to-[#6b0f92]',
    subtle: 'from-[#a78bfa] to-[#8b5cf6]',
    vibrant: 'from-[#7c3aed] to-[#4c1d95]',
  }
};

// For tailwind.config.js
export const tailwindColors = {
  primary: '#7c3aed', // purple-600
  secondary: '#9c4dcc',
  accent: '#6b0f92',
};
