import React from 'react';
import { Input as TamaguiInput } from 'tamagui';

type AppInputProps = Record<string, unknown>;

export const Input: React.FC<AppInputProps> = (props) => {
  return (
    <TamaguiInput 
      borderWidth={1} 
      borderColor="$borderColor" 
      size="$4" 
      br="$4" 
      {...(props as any)}
    />
  );
};
export default Input;
