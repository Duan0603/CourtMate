import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'md' | 'lg' | 'none';
  elevation?: 'level-1' | 'level-2';
}

export const Card = ({ children, className = '', padding = 'md', elevation = 'level-1', ...props }: CardProps) => {
  const paddingClass = padding === 'md' ? 'p-md' : padding === 'lg' ? 'p-lg' : '';
  const elevationClass = elevation === 'level-1' ? 'shadow-level-1' : 'shadow-level-2';

  return (
    <View 
      className={`bg-surface-card rounded-lg border border-gray-border ${elevationClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
