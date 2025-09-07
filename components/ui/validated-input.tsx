'use client';

import { useState, useEffect } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationRule } from '@/lib/hooks/use-form-validation';

interface ValidatedInputProps extends Omit<InputProps, 'onChange'> {
  label?: string;
  validationRules?: ValidationRule[];
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showValidationIcon?: boolean;
  helpText?: string;
  password?: boolean;
}

export function ValidatedInput({
  label,
  validationRules = [],
  onChange,
  onValidationChange,
  showValidationIcon = true,
  helpText,
  password = false,
  className,
  id,
  ...props
}: ValidatedInputProps) {
  const [value, setValue] = useState(props.value?.toString() || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate value
  useEffect(() => {
    if (!touched && !value) return;

    const newErrors: string[] = [];
    validationRules.forEach(rule => {
      if (!rule.validate(value)) {
        newErrors.push(rule.message);
      }
    });

    setErrors(newErrors);
    const valid =
      newErrors.length === 0 &&
      (!validationRules.length || value.trim() !== '');
    setIsValid(valid);

    onValidationChange?.(valid, newErrors);
  }, [value, validationRules, touched, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setTouched(true);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasErrors = errors.length > 0 && touched;
  const showSuccess = isValid && touched && showValidationIcon;

  return (
    <div className='space-y-2'>
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium',
            hasErrors && 'text-red-600',
            isValid && touched && 'text-green-600'
          )}
        >
          {label}
          {props.required && <span className='text-red-500 ml-1'>*</span>}
        </Label>
      )}

      <div className='relative'>
        <Input
          id={inputId}
          type={password && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            className,
            hasErrors &&
              'border-red-500 focus:border-red-500 focus:ring-red-500',
            showSuccess &&
              'border-green-500 focus:border-green-500 focus:ring-green-500'
          )}
          {...props}
        />

        {/* Password toggle */}
        {password && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
          >
            {showPassword ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </button>
        )}

        {/* Validation icons */}
        {showValidationIcon && touched && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            {hasErrors && <AlertCircle className='h-4 w-4 text-red-500' />}
            {showSuccess && !hasErrors && (
              <CheckCircle className='h-4 w-4 text-green-500' />
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && !hasErrors && (
        <p className='text-xs text-gray-500'>{helpText}</p>
      )}

      {/* Error messages */}
      {hasErrors && (
        <div className='space-y-1'>
          {errors.map((error, index) => (
            <p key={index} className='text-xs text-red-600 flex items-center'>
              <AlertCircle className='h-3 w-3 mr-1 flex-shrink-0' />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
