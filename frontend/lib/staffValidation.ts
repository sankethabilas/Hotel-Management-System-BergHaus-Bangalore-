/**
 * Staff Validation Utilities for Frontend
 * Real-time form validation with comprehensive error handling
 */

export interface StaffValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  nicPassport?: string;
  address?: string;
  jobRole?: string;
  department?: string;
  joinDate?: string;
  salary?: string;
  overtimeRate?: string;
  bankAccount?: string;
  bankName?: string;
  branch?: string;
  employeeId?: string;
  password?: string;
  confirmPassword?: string;
  currentPassword?: string;
  newPassword?: string;
  profilePictureUrl?: string;
}

export interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nicPassport: string;
  address: string;
  jobRole: string;
  department: string;
  joinDate: string;
  salary: number;
  overtimeRate: number;
  bankAccount: string;
  bankName: string;
  branch: string;
  isActive: boolean;
  employeeId?: string;
  profilePictureUrl?: string;
}

export interface LoginFormData {
  employeeId: string;
  password: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class StaffValidator {
  // Validation patterns
  private static patterns = {
    name: /^[a-zA-Z\s.'-]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[0-9+\s-()]{7,15}$/,
    phoneNumbers: /^[0-9+\s-()]*$/,
    phoneDigitsOnly: /^\+?[0-9\s-()]+$/,
    nicPassport: /^[A-Z0-9]{8,20}$/i,
    bankAccount: /^[0-9]{8,20}$/,
    bankName: /^[a-zA-Z\s&.-]+$/,
    branch: /^[a-zA-Z\s,.-]+$/,
    employeeId: /^EMP\d{4}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
    numbersOnly: /^[0-9]+$/,
    lettersOnly: /^[a-zA-Z\s]+$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    url: /^https?:\/\/[^\s]+$/
  };

  private static departments = [
    'Reception', 'Housekeeping', 'Kitchen', 'Maintenance', 
    'Security', 'Management', 'HR', 'Accounts'
  ];

  /**
   * Validate individual field
   */
  static validateField(fieldName: string, value: any, formData?: any): string | null {
    switch (fieldName) {
      case 'fullName':
        return this.validateFullName(value);
      case 'email':
        return this.validateEmail(value);
      case 'phone':
        return this.validatePhone(value);
      case 'dob':
        return this.validateDateOfBirth(value);
      case 'gender':
        return this.validateGender(value);
      case 'nicPassport':
        return this.validateNicPassport(value);
      case 'address':
        return this.validateAddress(value);
      case 'jobRole':
        return this.validateJobRole(value);
      case 'department':
        return this.validateDepartment(value);
      case 'joinDate':
        return this.validateJoinDate(value);
      case 'salary':
        return this.validateSalary(value);
      case 'overtimeRate':
        return this.validateOvertimeRate(value);
      case 'bankAccount':
        return this.validateBankAccount(value);
      case 'bankName':
        return this.validateBankName(value);
      case 'branch':
        return this.validateBranch(value);
      case 'employeeId':
        return this.validateEmployeeId(value);
      case 'password':
        return this.validatePassword(value);
      case 'confirmPassword':
        return this.validateConfirmPassword(value, formData?.newPassword || formData?.password);
      case 'currentPassword':
        return this.validateCurrentPassword(value);
      case 'newPassword':
        return this.validateNewPassword(value);
      case 'profilePictureUrl':
        return this.validateProfilePictureUrl(value);
      default:
        return null;
    }
  }

  /**
   * Validate entire staff form
   */
  static validateStaffForm(formData: StaffFormData, isEdit: boolean = false): StaffValidationErrors {
    const errors: StaffValidationErrors = {};

    // Required field validations
    const requiredFields = isEdit 
      ? ['email'] // For edit, most fields are optional
      : ['fullName', 'email', 'phone', 'dob', 'gender', 'nicPassport', 
         'address', 'jobRole', 'department', 'joinDate', 'salary'];

    requiredFields.forEach(field => {
      if (!formData[field as keyof StaffFormData] || 
          String(formData[field as keyof StaffFormData]).trim() === '') {
        errors[field as keyof StaffValidationErrors] = `${this.getFieldLabel(field)} is required`;
      }
    });

    // Individual field validations
    Object.keys(formData).forEach(field => {
      const value = formData[field as keyof StaffFormData];
      if (value !== undefined && value !== null && value !== '') {
        const error = this.validateField(field, value, formData);
        if (error) {
          errors[field as keyof StaffValidationErrors] = error;
        }
      }
    });

    return errors;
  }

  /**
   * Validate login form
   */
  static validateLoginForm(formData: LoginFormData): StaffValidationErrors {
    const errors: StaffValidationErrors = {};

    // Employee ID validation
    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    } else {
      const employeeIdError = this.validateEmployeeId(formData.employeeId);
      if (employeeIdError) errors.employeeId = employeeIdError;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return errors;
  }

  /**
   * Validate password change form
   */
  static validatePasswordChangeForm(formData: PasswordChangeData): StaffValidationErrors {
    const errors: StaffValidationErrors = {};

    // Current password
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    // New password
    const newPasswordError = this.validateNewPassword(formData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

    // Confirm password
    const confirmError = this.validateConfirmPassword(formData.confirmPassword, formData.newPassword);
    if (confirmError) errors.confirmPassword = confirmError;

    return errors;
  }

  // Individual field validation methods
  private static validateFullName(value: string): string | null {
    if (!value?.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Full name must be at least 2 characters long';
    if (value.trim().length > 100) return 'Full name cannot exceed 100 characters';
    if (!this.patterns.name.test(value.trim())) return 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens';
    
    // Check for reasonable name format (at least first and last name)
    const nameParts = value.trim().split(/\s+/);
    if (nameParts.length < 2) return 'Please enter both first and last name';
    
    return null;
  }

  private static validateEmail(value: string): string | null {
    if (!value?.trim()) return 'Email is required';
    
    const email = value.trim().toLowerCase();
    
    // Check length
    if (email.length > 254) return 'Email address is too long';
    
    // Check basic format
    if (!this.patterns.email.test(email)) return 'Please enter a valid email address (e.g., user@example.com)';
    
    // Check for common mistakes
    if (email.includes('..')) return 'Email cannot contain consecutive dots';
    if (email.startsWith('.') || email.endsWith('.')) return 'Email cannot start or end with a dot';
    if (email.includes('@.') || email.includes('.@')) return 'Invalid email format around @ symbol';
    
    return null;
  }

  private static validatePhone(value: string): string | null {
    if (!value?.trim()) return 'Phone number is required';
    
    const phone = value.trim();
    
    // Check if contains only valid phone characters
    if (!this.patterns.phoneDigitsOnly.test(phone)) {
      return 'Phone number can only contain digits, +, spaces, hyphens, and parentheses';
    }
    
    // Extract only digits to check length
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    
    if (digitsOnly.length < 7) return 'Phone number must have at least 7 digits';
    if (digitsOnly.length > 15) return 'Phone number cannot exceed 15 digits';
    
    // Check for reasonable format
    if (this.patterns.phone.test(phone)) {
      return null;
    } else {
      return 'Please enter a valid phone number (e.g., +94771234567 or 0771234567)';
    }
  }

  private static validateDateOfBirth(value: string): string | null {
    if (!value) return 'Date of birth is required';
    
    const dob = new Date(value);
    const today = new Date();
    
    if (isNaN(dob.getTime())) return 'Please enter a valid date';
    if (dob > today) return 'Date of birth cannot be in the future';
    
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 16) return 'Staff member must be at least 16 years old';
    if (age > 70) return 'Please verify the date of birth (age appears to be over 70)';
    
    return null;
  }

  private static validateGender(value: string): string | null {
    if (!value) return 'Gender is required';
    if (!['Male', 'Female', 'Other'].includes(value)) return 'Please select a valid gender';
    return null;
  }

  private static validateNicPassport(value: string): string | null {
    if (!value?.trim()) return 'NIC or Passport number is required';
    
    const nicPassport = value.trim();
    
    if (nicPassport.length < 8) return 'NIC/Passport must be at least 8 characters long';
    if (nicPassport.length > 20) return 'NIC/Passport cannot exceed 20 characters';
    
    // Check for valid characters (numbers only)
    if (!this.patterns.numbersOnly.test(nicPassport)) {
      return 'NIC/Passport can only contain numbers';
    }
    
    return null;
  }

  private static validateAddress(value: string): string | null {
    if (!value?.trim()) return 'Address is required';
    
    const address = value.trim();
    
    if (address.length < 10) return 'Address must be at least 10 characters long';
    if (address.length > 200) return 'Address cannot exceed 200 characters';
    
    // Check for basic address components
    if (!/[0-9]/.test(address) && !/\b(house|apartment|flat|unit|building|street|road|lane|avenue|place)\b/i.test(address)) {
      return 'Please provide a complete address with street/house details';
    }
    
    return null;
  }

  private static validateJobRole(value: string): string | null {
    if (!value?.trim()) return 'Job role is required';
    
    const jobRole = value.trim();
    
    if (jobRole.length < 2) return 'Job role must be at least 2 characters long';
    if (jobRole.length > 50) return 'Job role cannot exceed 50 characters';
    
    // Allow letters, spaces, and common job title characters
    if (!/^[a-zA-Z\s\-./()&]+$/.test(jobRole)) {
      return 'Job role can only contain letters, spaces, and common punctuation (-, ., /, (), &)';
    }
    
    return null;
  }

  private static validateDepartment(value: string): string | null {
    if (!value) return 'Department is required';
    if (!this.departments.includes(value)) return 'Please select a valid department';
    return null;
  }

  private static validateJoinDate(value: string): string | null {
    if (!value) return 'Join date is required';
    
    const joinDate = new Date(value);
    const today = new Date();
    
    if (isNaN(joinDate.getTime())) return 'Please enter a valid date';
    if (joinDate > today) return 'Join date cannot be in the future';
    
    return null;
  }

  private static validateSalary(value: number | string): string | null {
    if (!value && value !== 0) return 'Salary is required';
    
    const salary = Number(value);
    
    if (isNaN(salary)) return 'Salary must be a valid number';
    if (salary < 0) return 'Salary cannot be negative';
    if (salary === 0) return 'Salary must be greater than 0';
    if (salary < 15000) return 'Salary cannot be less than Rs. 15,000 (minimum wage)';
    if (salary > 1000000) return 'Please verify salary amount (exceeds Rs. 1,000,000)';
    
    // Check for reasonable decimal places
    if (salary.toString().includes('.')) {
      const decimalPlaces = salary.toString().split('.')[1].length;
      if (decimalPlaces > 2) return 'Salary cannot have more than 2 decimal places';
    }
    
    return null;
  }

  private static validateOvertimeRate(value: number | string): string | null {
    if (!value && value !== 0) return null; // Optional field
    
    const rate = Number(value);
    
    if (isNaN(rate)) return 'Overtime rate must be a valid number';
    if (rate < 0) return 'Overtime rate cannot be negative';
    if (rate > 5000) return 'Overtime rate seems unusually high, please verify';
    
    // Check for reasonable decimal places
    if (rate.toString().includes('.')) {
      const decimalPlaces = rate.toString().split('.')[1].length;
      if (decimalPlaces > 2) return 'Overtime rate cannot have more than 2 decimal places';
    }
    
    return null;
  }

  private static validateBankAccount(value: string): string | null {
    if (!value?.trim()) return null; // Optional field
    
    const account = value.trim();
    
    if (!this.patterns.bankAccount.test(account)) {
      return 'Bank account number must contain only digits (8-20 characters)';
    }
    
    if (account.length < 8) return 'Bank account number must be at least 8 digits';
    if (account.length > 20) return 'Bank account number cannot exceed 20 digits';
    
    return null;
  }

  private static validateBankName(value: string): string | null {
    if (!value?.trim()) return null; // Optional field
    
    const bankName = value.trim();
    
    if (bankName.length > 50) return 'Bank name cannot exceed 50 characters';
    if (bankName.length < 2) return 'Bank name must be at least 2 characters long';
    
    return null;
  }

  private static validateBranch(value: string): string | null {
    if (!value?.trim()) return null; // Optional field
    
    const branch = value.trim();
    
    if (branch.length > 100) return 'Branch cannot exceed 100 characters';
    if (branch.length < 2) return 'Branch name must be at least 2 characters long';
    
    if (!this.patterns.branch.test(branch)) {
      return 'Branch can only contain letters, spaces, commas, periods, and hyphens';
    }
    
    return null;
  }

  private static validateEmployeeId(value: string): string | null {
    if (!value?.trim()) return 'Employee ID is required';
    if (!this.patterns.employeeId.test(value.trim())) {
      return 'Employee ID must be in format EMP0001';
    }
    return null;
  }

  private static validatePassword(value: string): string | null {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters long';
    return null;
  }

  private static validateNewPassword(value: string): string | null {
    if (!value) return 'New password is required';
    if (value.length < 6) return 'New password must be at least 6 characters long';
    if (!this.patterns.password.test(value)) {
      return 'New password must contain at least one lowercase letter, one uppercase letter, and one number';
    }
    return null;
  }

  private static validateConfirmPassword(value: string, passwordToMatch: string): string | null {
    if (!value) return 'Please confirm your password';
    if (value !== passwordToMatch) return 'Password confirmation does not match';
    return null;
  }

  private static validateCurrentPassword(value: string): string | null {
    if (!value) return 'Current password is required';
    return null;
  }

  private static validateProfilePictureUrl(value: string): string | null {
    if (!value?.trim()) return null; // Optional field
    
    const url = value.trim();
    
    // Check basic URL format
    if (!this.patterns.url.test(url)) {
      return 'Please enter a valid URL (must start with http:// or https://)';
    }
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    if (!hasImageExtension) {
      return 'URL should point to an image file (.jpg, .png, .gif, etc.)';
    }
    
    if (url.length > 500) {
      return 'Profile picture URL is too long (maximum 500 characters)';
    }
    
    return null;
  }

  /**
   * Get user-friendly field labels
   */
  private static getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      dob: 'Date of Birth',
      gender: 'Gender',
      nicPassport: 'NIC/Passport',
      address: 'Address',
      jobRole: 'Job Role',
      department: 'Department',
      joinDate: 'Join Date',
      salary: 'Salary',
      overtimeRate: 'Overtime Rate',
      bankAccount: 'Bank Account',
      bankName: 'Bank Name',
      branch: 'Branch',
      employeeId: 'Employee ID',
      password: 'Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      profilePictureUrl: 'Profile Picture URL'
    };
    return labels[field] || field;
  }

  /**
   * Get available departments
   */
  static getDepartments(): string[] {
    return [...this.departments];
  }

  /**
   * Check if form has errors
   */
  static hasErrors(errors: StaffValidationErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Get first error message
   */
  static getFirstError(errors: StaffValidationErrors): string | null {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;
    return errors[errorKeys[0] as keyof StaffValidationErrors] || null;
  }

  /**
   * Format phone number input (remove invalid characters)
   */
  static formatPhoneInput(value: string): string {
    // Allow only digits, +, spaces, hyphens, and parentheses
    return value.replace(/[^0-9+\s\-()]/g, '');
  }

  /**
   * Format NIC/Passport input (numbers only)
   */
  static formatNicPassportInput(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  /**
   * Format bank account input (numbers only)
   */
  static formatBankAccountInput(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  /**
   * Format salary/overtime rate input (numbers and decimal only)
   */
  static formatNumberInput(value: string): string {
    // Allow only digits and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      // Keep only first decimal point
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  }

  /**
   * Format name input (letters, spaces, and common name characters only)
   */
  static formatNameInput(value: string): string {
    return value.replace(/[^a-zA-Z\s.'-]/g, '');
  }

  /**
   * Real-time validation for input fields
   */
  static validateFieldRealTime(fieldName: string, value: any, formData?: any): {
    isValid: boolean;
    error: string | null;
    formatted?: string;
  } {
    const error = this.validateField(fieldName, value, formData);
    
    let formatted: string | undefined;
    if (typeof value === 'string') {
      switch (fieldName) {
        case 'phone':
          formatted = this.formatPhoneInput(value);
          break;
        case 'nicPassport':
          formatted = this.formatNicPassportInput(value);
          break;
        case 'bankAccount':
          formatted = this.formatBankAccountInput(value);
          break;
        case 'salary':
        case 'overtimeRate':
          formatted = this.formatNumberInput(value);
          break;
        case 'fullName':
        case 'jobRole':
          formatted = this.formatNameInput(value);
          break;
      }
    }
    
    return {
      isValid: error === null,
      error,
      formatted
    };
  }
}