
// Définition des couleurs
export const COLORS = {
  primary: '#1B4FFF',        // Bleu principal (confiance, technologie)
  secondary: '#00C896',      // Vert menthe (disponibilité, succès)
  danger: '#FF4757',         // Rouge (alerte, signalement)
  warning: '#FFA502',        // Orange (en attente, badge non vérifié)
  background: '#F8F9FF',     // Fond clair légèrement bleuté
  surface: '#FFFFFF',        // Cartes et composants
  textPrimary: '#1A1D3B',    // Texte principal
  textSecondary: '#7B8BB2',  // Texte secondaire
  border: '#E8ECF4',         // Bordures
};

// Typographie
export const TYPOGRAPHY = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 18,
  fontSizeXL: 22,
  fontSizeXXL: 28,
};

// Espacements
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Default export
const Theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
};

export default Theme;
