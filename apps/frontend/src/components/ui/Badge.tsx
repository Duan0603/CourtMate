import React from 'react';
import { View, ViewProps } from 'react-native';
import { Typography } from './Typography';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'primary' | 'success' | 'highlight' | 'default';
  className?: string;
}

export const Badge = ({ label, variant = 'primary', className = '', ...props }: BadgeProps) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'bg-blue-vibrant/10',
          textColor: 'blue' as const,
        };
      case 'success':
        return {
          bg: 'bg-green-success/10',
          textColor: 'green' as const,
        };
      case 'highlight':
        return {
          bg: 'bg-orange-highlight/10',
          textColor: 'orange' as const,
        };
      default:
        return {
          bg: 'bg-gray-200',
          textColor: 'navy' as const,
        };
    }
  };

  const { bg, textColor } = getBadgeStyles();

  return (
    <View 
      className={`rounded-full px-sm py-xs self-start ${bg} ${className}`}
      {...props}
    >
      <Typography variant="label-sm" color={textColor} className="uppercase">
        {label}
      </Typography>
    </View>
  );
};
