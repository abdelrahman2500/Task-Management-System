/**
 * Validation utility functions
 */

// Email validation using a simple regex
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation - at least 8 chars, uppercase, lowercase, number, special char
export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

// Required field validation
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  return true; // Non-string values (numbers, booleans) are considered valid if not null/undefined
}

// Minimum length validation
export function validateMinLength(value: string, minLength: number): boolean {
  if (!value) return minLength === 0;
  return value.length >= minLength;
}

// Maximum length validation
export function validateMaxLength(value: string, maxLength: number): boolean {
  if (!value) return true;
  return value.length <= maxLength;
}

// URL validation
export function validateUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Phone number validation (basic)
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === "") return false;

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check if it has 10-15 digits (international range)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

// Date validation
export function validateDate(dateString: string): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Future date validation
export function validateFutureDate(dateString: string): boolean {
  if (!validateDate(dateString)) return false;

  const date = new Date(dateString);
  const now = new Date();

  return date > now;
}

// Age validation (18+ years old)
export function validateAge(birthDate: string, minAge: number = 18): boolean {
  if (!validateDate(birthDate)) return false;

  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();

  // Account for birthday not yet passed this year
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
}
