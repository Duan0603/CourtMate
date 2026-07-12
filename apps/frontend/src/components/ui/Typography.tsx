import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'display-lg' | 'headline-lg' | 'headline-lg-mobile' | 'headline-md' | 'body-lg' | 'body-md' | 'label-md' | 'label-sm';
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
    gray: 'text-gray-500', // standard gray if needed
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
      {...props}
    >
      {children}
    </Text>
  );
};
