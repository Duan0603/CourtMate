import React from 'react';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  colorScheme?: 'brand' | 'white' | 'slate';
}

/**
 * LoadingDots:
 * 3 bouncing/pulsing wave dots for micro-interactions, buttons, and preloader states.
 */
export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  className = '',
  colorScheme = 'brand',
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  }[size];

  const dotColors = {
    brand: ['bg-primary', 'bg-primary', 'bg-primary'],
    white: ['bg-white', 'bg-white', 'bg-white'],
    slate: ['bg-white', 'bg-white', 'bg-white'],
  }[colorScheme];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} aria-label="Đang tải...">
      <span
        className={`${sizeClasses} rounded-full ${dotColors[0]} animate-bounce`}
        style={{ animationDuration: '0.8s', animationDelay: '-0.3s' }}
      />
      <span
        className={`${sizeClasses} rounded-full ${dotColors[1]} animate-bounce`}
        style={{ animationDuration: '0.8s', animationDelay: '-0.15s' }}
      />
      <span
        className={`${sizeClasses} rounded-full ${dotColors[2]} animate-bounce`}
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
};
