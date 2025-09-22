// Session Management Utility
// This utility handles session persistence and cleanup

export interface SessionData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
  expiresAt: number;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'iot_hub_session';
  private static readonly SESSION_EXPIRY_HOURS = 24; // 24 hours

  // Save session data to localStorage
  static saveSession(sessionData: SessionData): void {
    try {
      const sessionWithExpiry = {
        ...sessionData,
        expiresAt: Date.now() + (this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000)
      };
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionWithExpiry));
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Get session data from localStorage
  static getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr) as SessionData & { expiresAt: number };
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        console.log('Session expired, clearing...');
        this.clearSession();
        return null;
      }

      return {
        user: session.user,
        token: session.token,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession();
      return null;
    }
  }

  // Clear session data
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Check if session exists and is valid
  static hasValidSession(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  // Extend session expiry
  static extendSession(): void {
    const session = this.getSession();
    if (session) {
      this.saveSession(session);
    }
  }

  // Get session expiry time
  static getSessionExpiry(): Date | null {
    const session = this.getSession();
    return session ? new Date(session.expiresAt) : null;
  }

  // Check if session expires soon (within 1 hour)
  static isSessionExpiringSoon(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    const oneHour = 60 * 60 * 1000;
    return (session.expiresAt - Date.now()) < oneHour;
  }
}

// Auto-cleanup expired sessions on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    SessionManager.getSession(); // This will auto-cleanup if expired
  });
}
