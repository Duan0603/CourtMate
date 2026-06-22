import React from 'react';
import { Button as TamaguiButton, ButtonProps } from 'tamagui';

export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <TamaguiButton 
      theme="active" 
      size="$4" 
      br="$4" 
      {...props} 
    />
  );
};
export default Button;
