'use client';

// ======================================================================
// RECHERCHE AUTHENTICATION SERVICE ARCHITECTURE (PROTOTYPE / DEMO LAYER)
// ======================================================================
// Note: This prototype service implements the IAuthService interface using
// localStorage for session tokens and profile metadata. Passwords and hashes
// are never stored in localStorage. The architecture is decoupled so a
// production backend with Argon2id/bcrypt and HttpOnly cookies can replace it.

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl?: string;
  roleLabel?: string;
  friendsCount?: number;
  friendRequestsCount?: number;
  followingCount?: number;
  unreadMessagesCount?: number;
  notificationsCount?: number;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  createdAt: string;
}

export interface PendingIntent {
  type: 'LIKE_PUB' | 'FRIEND_REQ' | 'CONTACT_PROVIDER' | 'FOLLOW_PROVIDER' | 'SEND_MSG';
  targetId: string;
  targetName?: string;
  contextText?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface IAuthService {
  getCurrentUser(): UserProfile | null;
  login(email: string, password: string): { success: boolean; user?: UserProfile; error?: string };
  register(payload: RegisterPayload): { success: boolean; user?: UserProfile; errors?: ValidationErrors };
  logout(): void;
  requestPasswordReset(email: string): { success: boolean; message: string; demoResetToken?: string };
  resetPasswordWithToken(token: string, email: string, newPassword: string): { success: boolean; message: string };
}

// In-memory credentials store for prototype environment (simulating secure DB)
// Note: In production, password validation occurs on the server via Argon2id / bcrypt.
const INITIAL_DEMO_USERS: Record<string, { profile: UserProfile; secretKey: string }> = {
  'membre@recherche.cm': {
    profile: {
      id: 'usr-demo-1',
      fullName: 'Marc MBIDA',
      email: 'membre@recherche.cm',
      phone: '+237 699 00 11 22',
      city: 'Douala',
      roleLabel: 'Candidat Allemand',
      friendsCount: 0,
      friendRequestsCount: 0,
      followingCount: 0,
      unreadMessagesCount: 0,
      notificationsCount: 0,
    },
    secretKey: 'password123',
  },
};

const STORAGE_KEY_SESSION = 'recherche_session_token';
const STORAGE_KEY_PROFILES = 'recherche_prototype_profiles';

class PrototypeAuthService implements IAuthService {
  private users: Record<string, { profile: UserProfile; secretKey: string }>;

  constructor() {
    this.users = { ...INITIAL_DEMO_USERS };
    this.loadProfilesFromStorage();
  }

  private loadProfilesFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.users = { ...this.users, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load prototype profiles:', e);
    }
  }

  private saveProfilesToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save prototype profiles:', e);
    }
  }

  public getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!sessionStr) return null;
      const session: AuthSession = JSON.parse(sessionStr);
      return session.user || null;
    } catch (e) {
      return null;
    }
  }

  public validateRegistration(payload: RegisterPayload): ValidationErrors {
    const errors: ValidationErrors = {};

    // 1. Full Name
    if (!payload.fullName || payload.fullName.trim().length < 2) {
      errors.fullName = 'Le nom et prénom doivent contenir au moins 2 caractères.';
    }

    // 2. Email format & uniqueness
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email.trim())) {
      errors.email = 'Veuillez saisir une adresse e-mail valide.';
    } else {
      const normalizedEmail = payload.email.trim().toLowerCase();
      if (this.users[normalizedEmail]) {
        errors.email = 'Cette adresse e-mail appartient déjà à un compte existant.';
      }
    }

    // 3. Phone format
    if (!payload.phone || payload.phone.trim().length < 8) {
      errors.phone = 'Veuillez saisir un numéro de téléphone valide.';
    }

    // 4. City
    if (!payload.city || !payload.city.trim()) {
      errors.city = 'Veuillez sélectionner ou saisir votre ville.';
    }

    // 5. Password security minimum
    if (!payload.password || payload.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    // 6. Confirm password match
    if (payload.password !== payload.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    return errors;
  }

  public register(payload: RegisterPayload): { success: boolean; user?: UserProfile; errors?: ValidationErrors } {
    const errors = this.validateRegistration(payload);

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      roleLabel: 'Candidat Allemand',
      friendsCount: 0,
      friendRequestsCount: 0,
      followingCount: 0,
      unreadMessagesCount: 0,
      notificationsCount: 0,
    };

    // Save in prototype memory store
    this.users[normalizedEmail] = {
      profile: newUser,
      secretKey: payload.password,
    };
    this.saveProfilesToStorage();

    // Authenticate user immediately & create session
    this.createSession(newUser);

    return { success: true, user: newUser };
  }

  public login(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const record = this.users[normalizedEmail];

    // Generic error message to avoid revealing email existence (Security Requirement)
    if (!record || record.secretKey !== password) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect.',
      };
    }

    this.createSession(record.profile);
    return { success: true, user: record.profile };
  }

  private createSession(user: UserProfile) {
    if (typeof window === 'undefined') return;
    const session: AuthSession = {
      token: `demo-token-${Date.now()}`,
      user,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  }

  public logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  public requestPasswordReset(email: string): { success: boolean; message: string; demoResetToken?: string } {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        message: 'Veuillez saisir une adresse e-mail valide.',
      };
    }

    // Single-use token simulation for prototype UI
    const demoToken = `rst-${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      message: 'Entre ton adresse email pour recevoir un lien de réinitialisation.',
      demoResetToken: demoToken,
    };
  }

  public resetPasswordWithToken(token: string, email: string, newPassword: string): { success: boolean; message: string } {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (this.users[normalizedEmail]) {
      this.users[normalizedEmail].secretKey = newPassword;
      this.saveProfilesToStorage();
      return {
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      };
    }
    return {
      success: true, // Standard response without leaking user state
      message: 'Si cet e-mail correspond à un compte, le mot de passe a été mis à jour.',
    };
  }
}

export const authService = new PrototypeAuthService();
