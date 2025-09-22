// Email validation utilities
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

// Common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'temp-mail.org', 'throwaway.email', 'getnada.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
  'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com',
  'meltmail.com', 'trashmail.net', 'yopmail.com', 'tempail.com'
];

// Common email domains for suggestions
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'protonmail.com', 'aol.com', 'live.com', 'msn.com', 'rediffmail.com'
];

export const validateEmail = (email: string): EmailValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors };
  }

  // Extract domain
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    errors.push('Invalid email format');
    return { isValid: false, errors };
  }

  // Check for disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    errors.push('Disposable email addresses are not allowed');
    suggestions.push('Please use a permanent email address');
  }

  // Check for common typos in popular domains
  const commonTypos: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com'
  };

  if (commonTypos[domain]) {
    errors.push('Email domain appears to have a typo');
    suggestions.push(`Did you mean ${email.replace(domain, commonTypos[domain])}?`);
  }

  // Check if domain exists (basic check)
  if (domain.length < 4) {
    errors.push('Email domain appears to be invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
};

export const suggestEmailDomains = (partialDomain: string): string[] => {
  if (partialDomain.length < 2) return [];
  
  return COMMON_DOMAINS
    .filter(domain => domain.startsWith(partialDomain.toLowerCase()))
    .slice(0, 5);
};

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
};
