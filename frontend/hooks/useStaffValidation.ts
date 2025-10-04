import { useState, useCallback } from 'react';
import { StaffValidator, StaffValidationErrors, StaffFormData, LoginFormData, PasswordChangeData } from '@/lib/staffValidation';

/**
 * Custom hook for staff form validation
 * Provides real-time validation and error handling
 */

interface UseStaffValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrorsImmediately?: boolean;
}

export function useStaffValidation(options: UseStaffValidationOptions = {}) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showErrorsImmediately = false
  } = options;

  const [errors, setErrors] = useState<StaffValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback((fieldName: string, value: any, formData?: any) => {
    const error = StaffValidator.validateField(fieldName, value, formData);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName as keyof StaffValidationErrors] = error;
      } else {
        delete newErrors[fieldName as keyof StaffValidationErrors];
      }
      return newErrors;
    });

    return error;
  }, []);

  /**
   * Validate entire staff form
   */
  const validateStaffForm = useCallback((formData: StaffFormData, isEdit: boolean = false) => {
    setIsValidating(true);
    const formErrors = StaffValidator.validateStaffForm(formData, isEdit);
    setErrors(formErrors);
    setIsValidating(false);
    return formErrors;
  }, []);

  /**
   * Validate login form
   */
  const validateLoginForm = useCallback((formData: LoginFormData) => {
    setIsValidating(true);
    const formErrors = StaffValidator.validateLoginForm(formData);
    setErrors(formErrors);
    setIsValidating(false);
    return formErrors;
  }, []);

  /**
   * Validate password change form
   */
  const validatePasswordChangeForm = useCallback((formData: PasswordChangeData) => {
    setIsValidating(true);
    const formErrors = StaffValidator.validatePasswordChangeForm(formData);
    setErrors(formErrors);
    setIsValidating(false);
    return formErrors;
  }, []);

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback((fieldName: string, value: any, formData?: any) => {
    if (validateOnChange && (touched[fieldName] || showErrorsImmediately)) {
      validateField(fieldName, value, formData);
    }
  }, [validateField, validateOnChange, touched, showErrorsImmediately]);

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback((fieldName: string, value: any, formData?: any) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      validateField(fieldName, value, formData);
    }
  }, [validateField, validateOnBlur]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName as keyof StaffValidationErrors];
      return newErrors;
    });
  }, []);

  /**
   * Set custom error for a field
   */
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = useCallback(() => {
    return !StaffValidator.hasErrors(errors);
  }, [errors]);

  /**
   * Get error for specific field
   */
  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName as keyof StaffValidationErrors] || null;
  }, [errors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName: string) => {
    return !!errors[fieldName as keyof StaffValidationErrors];
  }, [errors]);

  /**
   * Check if field should show error (touched or showErrorsImmediately)
   */
  const shouldShowFieldError = useCallback((fieldName: string) => {
    return hasFieldError(fieldName) && (touched[fieldName] || showErrorsImmediately);
  }, [hasFieldError, touched, showErrorsImmediately]);

  /**
   * Get first error message
   */
  const getFirstError = useCallback(() => {
    return StaffValidator.getFirstError(errors);
  }, [errors]);

  /**
   * Get error count
   */
  const getErrorCount = useCallback(() => {
    return Object.keys(errors).length;
  }, [errors]);

  return {
    // State
    errors,
    touched,
    isValidating,
    
    // Validation methods
    validateField,
    validateStaffForm,
    validateLoginForm,
    validatePasswordChangeForm,
    
    // Event handlers
    handleFieldChange,
    handleFieldBlur,
    
    // Error management
    clearErrors,
    clearFieldError,
    setFieldError,
    
    // Status checks
    isValid,
    getFieldError,
    hasFieldError,
    shouldShowFieldError,
    getFirstError,
    getErrorCount
  };
}

/**
 * Helper hook for simplified form validation
 */
export function useSimpleStaffValidation() {
  return useStaffValidation({
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsImmediately: false
  });
}

/**
 * Helper hook for immediate validation (useful for admin forms)
 */
export function useImmediateStaffValidation() {
  return useStaffValidation({
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsImmediately: true
  });
}