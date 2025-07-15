interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'resident' | 'practitioner' | 'educator';
  institution?: string;
  specialization?: string;
  yearOfStudy?: number;
  createdAt: string;
  lastLogin: string;
  // Additional profile fields
  displayName?: string;
  degree?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  yearsOfExperience?: string;
  licenseNumber?: string;
  isVerified?: boolean;
  showEmail?: boolean;
  showLocation?: boolean;
  allowMessages?: boolean;
  profileImage?: string;
  credentials?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'resident' | 'practitioner' | 'educator';
  institution?: string;
  specialization?: string;
  yearOfStudy?: number;
}

class AuthService {
  private readonly STORAGE_KEY = 'mednote_auth';
  private readonly USERS_KEY = 'mednote_users';
  private currentUser: User | null = null;

  constructor() {
    this.loadCurrentUser();
  }

  // Load current user from localStorage
  private loadCurrentUser(): void {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (authData) {
        const { user, token, expiresAt } = JSON.parse(authData);
        
        // Check if token is expired
        if (new Date().getTime() < expiresAt) {
          this.currentUser = user;
        } else {
          this.logout();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.logout();
    }
  }

  // Save auth data to localStorage
  private saveAuthData(user: User, token: string): void {
    const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
    const authData = {
      user,
      token,
      expiresAt
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    this.currentUser = user;
  }

  // Get all users from localStorage (for demo purposes)
  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users to localStorage
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Generate a simple token (in production, use proper JWT)
  private generateToken(): string {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  }

  // Generate user ID
  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input
      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      if (!this.isValidPassword(data.password)) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }

      if (!data.firstName.trim() || !data.lastName.trim()) {
        return { success: false, error: 'First name and last name are required.' };
      }

      // Check if user already exists
      const users = this.getUsers();
      const existingUser = users.find(user => user.email.toLowerCase() === data.email.toLowerCase());
      
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Create new user
      const newUser: User = {
        id: this.generateUserId(),
        email: data.email.toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        institution: data.institution?.trim(),
        specialization: data.specialization?.trim(),
        yearOfStudy: data.yearOfStudy,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Save user
      users.push(newUser);
      this.saveUsers(users);

      // Generate token and save auth data
      const token = this.generateToken();
      this.saveAuthData(newUser, token);

      return { success: true, user: newUser, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      if (!this.isValidEmail(credentials.email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      if (!credentials.password) {
        return { success: false, error: 'Password is required.' };
      }

      // Find user
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll accept any password for existing users
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      this.saveUsers(users);

      // Generate token and save auth data
      const token = this.generateToken();
      this.saveAuthData(user, token);

      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser = null;
  }

  // Get current user
  getCurrentUser(): User | null {
    // If currentUser is not set, try to load from localStorage
    if (!this.currentUser) {
      try {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.user && parsed.expiresAt > new Date().getTime()) {
            this.currentUser = parsed.user;
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Not authenticated.' };
      }

      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === this.currentUser!.id);

      if (userIndex === -1) {
        return { success: false, error: 'User not found.' };
      }

      // Update user data
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      this.saveUsers(users);

      // Update current user and auth data
      const authData = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      authData.user = updatedUser;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
      this.currentUser = updatedUser;

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile.' };
    }
  }

  // Get user's full name
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  // Get user's role display
  getRoleDisplay(): string {
    if (!this.currentUser) return '';
    
    const roleMap = {
      student: 'Medical Student',
      resident: 'Resident',
      practitioner: 'Practitioner',
      educator: 'Educator'
    };
    
    return roleMap[this.currentUser.role] || this.currentUser.role;
  }
}

export const authService = new AuthService();
export type { User, AuthResponse, LoginCredentials, RegisterData };
