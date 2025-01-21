import { useState, useEffect } from 'react';

export function usePhoneMask(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [cursorPosition, setCursorPosition] = useState(0);

  const formatPhone = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Limit to max 11 digits
    const limited = digits.slice(0, 11);
    
    // Format the number
    let formatted = '';
    if (limited.length > 0) {
      formatted += '+' + limited[0];
      if (limited.length > 1) {
        formatted += ' (' + limited.slice(1, 4);
        if (limited.length > 4) {
          formatted += ') ' + limited.slice(4, 7);
          if (limited.length > 7) {
            formatted += '-' + limited.slice(7, 9);
            if (limited.length > 9) {
              formatted += '-' + limited.slice(9, 11);
            }
          }
        }
      }
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const formatted = formatPhone(input.value);
    setValue(formatted);
    
    // Calculate new cursor position
    const digit = input.value.replace(/\D/g, '').length;
    let newPosition = 0;
    
    if (digit <= 1) newPosition = digit + 1;
    else if (digit <= 4) newPosition = digit + 3;
    else if (digit <= 7) newPosition = digit + 6;
    else if (digit <= 9) newPosition = digit + 7;
    else newPosition = digit + 8;
    
    setCursorPosition(newPosition);
  };

  useEffect(() => {
    const input = document.getElementById('phone_number') as HTMLInputElement;
    if (input) {
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition, value]);

  return {
    value,
    onChange: handleChange,
  };
}