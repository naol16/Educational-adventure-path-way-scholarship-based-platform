/**
 * Utility for sanitizing user inputs to prevent XSS and other injection attacks.
 */
export class Sanitizer {
  /**
   * Basic HTML escaping to prevent XSS
   */
  static escapeHTML(str: string): string {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize an object's string properties (shallow)
   */
  static sanitizeObject<T extends object>(obj: T): T {
    const sanitized = { ...obj } as any;
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.escapeHTML(sanitized[key]);
      }
    }
    return sanitized;
  }

  /**
   * Validates if a string is a safe filename
   */
  static isSafeFilename(filename: string): boolean {
    // Only allow alphanumeric, dots, dashes and underscores
    return /^[a-zA-Z0-9._-]+$/.test(filename);
  }
}
