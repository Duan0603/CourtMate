import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

type TypographyVariant =
  | 'display-lg'
  | 'headline-lg'
  | 'headline-lg-mobile'
  | 'headline-md'
  | 'headline-sm'
  | 'body-lg'
  | 'body-md'
  | 'label-md'
  | 'label-sm'
  | 'label-xs';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  children?: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, object> = {
  'display-lg': { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  'headline-lg': { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  'headline-lg-mobile': { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  'headline-md': { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  'headline-sm': { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  'body-lg': { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  'body-md': { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  'label-md': { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  'label-sm': { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  'label-xs': { fontSize: 10, fontWeight: '500', lineHeight: 14 },
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body-md',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      {...props}
      style={[variantStyles[variant], style, props.style]}
    >
      {children}
    </Text>
  );
};

