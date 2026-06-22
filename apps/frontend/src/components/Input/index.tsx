import React from 'react';
import { Input as TamaguiInput, InputProps } from 'tamagui';

export const Input: React.FC<InputProps> = (props) => {
  return (
    <TamaguiInput 
      borderWidth={1} 
      borderColor="$borderColor" 
      size="$4" 
      br="$4" 
      {...props} 
    />
  );
};
export default Input;
