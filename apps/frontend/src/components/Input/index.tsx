import React, { forwardRef } from 'react';
import { Input as TamaguiInput, GetProps } from 'tamagui';

type AppInputProps = GetProps<typeof TamaguiInput>;

export const Input = forwardRef<TamaguiInput, AppInputProps>((props, ref) => {
  return (
    <TamaguiInput 
      ref={ref as any}
      borderWidth={1} 
      borderColor="$borderColor" 
      size="$4" 
      br="$4" 
      {...props}
    />
  );
});
export default Input;
