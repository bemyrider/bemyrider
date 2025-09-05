import { useState, useEffect } from 'react';

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  value: string;
  touched: boolean;
}

export function useFormValidation(fields: Record<string, ValidationRule[]>) {
  const [fieldStates, setFieldStates] = useState<Record<string, FieldValidation>>(() => {
    const initial: Record<string, FieldValidation> = {};
    Object.keys(fields).forEach(fieldName => {
      initial[fieldName] = {
        rules: fields[fieldName],
        value: '',
        touched: false,
      };
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate single field
  const validateField = (fieldName: string, value: string): string[] => {
    const fieldRules = fieldStates[fieldName]?.rules || [];
    const fieldErrors: string[] = [];

    fieldRules.forEach(rule => {
      if (!rule.validate(value)) {
        fieldErrors.push(rule.message);
      }
    });

    return fieldErrors;
  };

  // Update field value and validate
  const updateField = (fieldName: string, value: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        touched: true,
      },
    }));

    // Validate immediately
    const fieldErrors = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors,
    }));
  };

  // Mark field as touched
  const touchField = (fieldName: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    let hasErrors = false;

    Object.keys(fieldStates).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, fieldStates[fieldName].value);
      newErrors[fieldName] = fieldErrors;
      if (fieldErrors.length > 0) {
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return !hasErrors;
  };

  // Check if form is valid
  useEffect(() => {
    const hasErrors = Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
    const allFieldsTouched = Object.values(fieldStates).every(field => field.touched);
    const hasValues = Object.values(fieldStates).some(field => field.value.trim() !== '');

    setIsValid(!hasErrors && allFieldsTouched && hasValues);
  }, [errors, fieldStates]);

  return {
    fieldStates,
    errors,
    isValid,
    updateField,
    touchField,
    validateAll,
    values: Object.fromEntries(
      Object.entries(fieldStates).map(([key, field]) => [key, field.value])
    ),
  };
}

// Common validation rules
export const validationRules = {
  required: (message = 'Questo campo è obbligatorio'): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Inserisci un indirizzo email valido'): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message || `Deve contenere almeno ${min} caratteri`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `Non può superare ${max} caratteri`,
  }),

  password: (message = 'La password deve contenere almeno 8 caratteri, una maiuscola e un numero'): ValidationRule => ({
    validate: (value: string) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(value);
    },
    message,
  }),

  phone: (message = 'Inserisci un numero di telefono valido'): ValidationRule => ({
    validate: (value: string) => {
      const phoneRegex = /^(\+39|0039)?[ ]?3[0-9]{2}[ ]?[0-9]{6,7}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message,
  }),

  url: (message = 'Inserisci un URL valido'): ValidationRule => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  numeric: (message = 'Inserisci solo numeri'): ValidationRule => ({
    validate: (value: string) => /^\d+$/.test(value),
    message,
  }),

  price: (message = 'Inserisci un prezzo valido (es: 15.50)'): ValidationRule => ({
    validate: (value: string) => {
      const priceRegex = /^\d+(\.\d{1,2})?$/;
      return priceRegex.test(value) && parseFloat(value) > 0;
    },
    message,
  }),
};
