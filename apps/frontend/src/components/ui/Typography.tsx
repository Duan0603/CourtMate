import React from 'react';
import { Text, TextProps } from 'react-native';

export type TypographyVariant =
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

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: 'navy' | 'blue' | 'green' | 'orange' | 'white' | 'gray';
  className?: string;
  weight?: 'bold' | 'semibold' | 'medium' | 'normal';
  align?: 'left' | 'center' | 'right';
}

export const Typography = ({
  children,
  variant = 'body-md',
  color = 'navy',
  className = '',
  weight,
  align = 'left',
  style,
  ...props
}: TypographyProps) => {
  const variantClass = `text-${variant}`;
  
  // Map color prop to Tailwind classes
  const colorMap = {
    navy: 'text-navy-deep',
    blue: 'text-blue-vibrant',
    green: 'text-green-success',
    orange: 'text-orange-highlight',
    white: 'text-white',
    gray: 'text-gray-500',
  };
  const colorClass = colorMap[color] || 'text-navy-deep';
  
  const alignClass = `text-${align}`;
  const weightClass = weight ? `font-${weight}` : '';

  // Use fontFamily 'Geist' for bold and normal weights based on NativeWind alias
  const isBold = variant.includes('headline') || variant.includes('display') || weight === 'bold' || weight === 'semibold';
  const fontClass = isBold ? 'font-sans font-bold' : 'font-sans font-normal';

  return (
    <Text 
      className={`${variantClass} ${colorClass} ${alignClass} ${weightClass} ${fontClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};
