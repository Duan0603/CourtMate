import React from 'react';
import { Button as TamaguiButton } from 'tamagui';

type AppButtonProps = React.PropsWithChildren<Record<string, unknown>>;

export const Button: React.FC<AppButtonProps> = (props) => {
  return (
    <TamaguiButton 
      theme="active" 
      size="$4" 
      br="$4" 
      {...(props as any)}
    />
  );
};
export default Button;
