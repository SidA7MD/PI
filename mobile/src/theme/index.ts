export { lightColors, darkColors, type Colors } from './colors';
export { typography, type Typography } from './typography';
export { spacing, borderRadius, shadows, type Spacing, type BorderRadius, type Shadows } from './spacing';

import { spacing, borderRadius, shadows } from './spacing';
import { typography } from './typography';

export const theme = {
    spacing,
    borderRadius,
    shadows,
    typography,
};

export type Theme = typeof theme;
