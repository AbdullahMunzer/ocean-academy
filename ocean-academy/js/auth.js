/**
 * IOI Ocean Academy BD - Authentication & Guest Mode Manager
 * Handles:
 * - 1-Click Guest Mode ("Explore as Guest")
 * - Email / Password registration & login
 * - Google OAuth simulation & Firebase / Supabase configuration adapter
 * - Automatic migration of Guest quiz scores & progress upon account creation
 * - LocalStorage state persistence + live session listeners
 */

class AuthService {
  constructor() {
    this.STORAGE_KEY_USERS = 'ioi_ocean_users';
    this.STORAGE_KEY_CURRENT_USER = 'ioi_ocean_current_user';
    this.STORAGE_KEY_GUEST_PROGRESS = 'ioi_ocean_guest_progress';
    this.STORAGE_KEY_CONFIG = 'ioi_ocean_backend_config';

    this.currentUser = null;
    this.isGuest = false;
    this.listeners = [];

    this.loadState();
  }

  loadState() {
    try {
      const savedUser = localStorage.getItem(this.STORAGE_KEY_CURRENT_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.isGuest = false;
      } else {
        // Default to guest mode or unauthenticated
        const guestFlag = localStorage.getItem(this.STORAGE_KEY_GUEST_PROGRESS);
        if (guestFlag) {
          this.isGuest = true;
        }
      }
    } catch (e) {
      console.warn('Error reading auth state from localStorage:', e);
      this.currentUser = null;
      this.isGuest = false;
    }
  }

  saveCurrentUser(user) {
    this.currentUser = user;
    this.isGuest = false;
    if (user) {
      localStorage.setItem(this.STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      // Also update in all users directory
      this.updateUserRecord(user);
    } else {
      localStorage.removeItem(this.STORAGE_KEY_CURRENT_USER);
    }
    this.notifyListeners();
  }

  getUsers() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
  }

  updateUserRecord(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  }

  // 1-Click "Explore as Guest"
  loginAsGuest() {
    this.currentUser = null;
    this.isGuest = true;
    let guestProgress = this.getGuestProgress();
    if (!guestProgress) {
      guestProgress = {
        guestId: 'guest_' + Math.random().toString(36).substring(2, 9),
        startedAt: new Date().toISOString(),
        completedCourses: {},
        quizScores: {}
      };
      localStorage.setItem(this.STORAGE_KEY_GUEST_PROGRESS, JSON.stringify(guestProgress));
    }
    this.notifyListeners();
    return { success: true, isGuest: true };
  }

  getGuestProgress() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_GUEST_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveGuestProgress(courseId, scoreData) {
    let guestProgress = this.getGuestProgress() || {
      guestId: 'guest_' + Math.random().toString(36).substring(2, 9),
      startedAt: new Date().toISOString(),
      completedCourses: {},
      quizScores: {}
    };
    guestProgress.quizScores[courseId] = scoreData;
    if (scoreData.passed) {
      guestProgress.completedCourses[courseId] = true;
    }
    this.isGuest = true;
    localStorage.setItem(this.STORAGE_KEY_GUEST_PROGRESS, JSON.stringify(guestProgress));
    this.notifyListeners();
  }

  // Register New User with Email & Password
  register({ fullName, email, password }) {
    if (!fullName || !email || !password) {
      throw new Error('Please fill in all required fields: Full Name, Email, and Password.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: btoa(password), // simple safe obfuscation for client mock storage
      createdAt: new Date().toISOString(),
      avatar: this.generateAvatar(fullName),
      enrolledCourses: ['ocean-101'],
      completedCourses: {},
      quizScores: {},
      certificates: []
    };

    // Migrate any guest progress if available
    this.migrateGuestDataToUser(newUser);

    users.push(newUser);
    this.saveUsers(users);
    this.saveCurrentUser(newUser);
    return newUser;
  }

  // Sign In with Email & Password
  login({ email, password }) {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No registered account found with this email. Please sign up first.');
    }

    if (user.passwordHash !== btoa(password)) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Migrate guest data if present
    this.migrateGuestDataToUser(user);
    this.saveCurrentUser(user);
    return user;
  }

  // 1-Click Google OAuth Sign-In (Simulation or Firebase/Supabase connection)
  loginWithGoogle(simulatedName = null, simulatedEmail = null) {
    const fullName = simulatedName || "Ocean Scholar";
    const email = simulatedEmail || `scholar.${Math.floor(Math.random() * 899 + 100)}@ioiacademy.org`;
    const cleanEmail = email.trim().toLowerCase();

    let users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: 'goog_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        fullName: fullName,
        email: cleanEmail,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        avatar: this.generateAvatar(fullName, true),
        enrolledCourses: ['ocean-101'],
        completedCourses: {},
        quizScores: {},
        certificates: []
      };
      users.push(user);
      this.saveUsers(users);
    }

    this.migrateGuestDataToUser(user);
    this.saveCurrentUser(user);
    return user;
  }

  // Migrate Guest Progress so user doesn't lose their completed quiz when signing up!
  migrateGuestDataToUser(user) {
    const guestProgress = this.getGuestProgress();
    if (!guestProgress) return;

    if (guestProgress.quizScores) {
      user.quizScores = { ...user.quizScores, ...guestProgress.quizScores };
    }
    if (guestProgress.completedCourses) {
      user.completedCourses = { ...user.completedCourses, ...guestProgress.completedCourses };
    }
    // Clear guest storage after smooth handover
    localStorage.removeItem(this.STORAGE_KEY_GUEST_PROGRESS);
  }

  // Save Quiz Completion & Certificate to User Profile
  saveUserQuizResult(courseId, scoreData, certificateData = null) {
    if (!this.currentUser) {
      // Save to guest progress
      this.saveGuestProgress(courseId, scoreData);
      return;
    }

    this.currentUser.quizScores = this.currentUser.quizScores || {};
    this.currentUser.quizScores[courseId] = scoreData;

    if (scoreData.passed) {
      this.currentUser.completedCourses = this.currentUser.completedCourses || {};
      this.currentUser.completedCourses[courseId] = true;

      if (certificateData) {
        this.currentUser.certificates = this.currentUser.certificates || [];
        // Replace existing or append
        const existingIdx = this.currentUser.certificates.findIndex(c => c.courseId === courseId);
        if (existingIdx !== -1) {
          this.currentUser.certificates[existingIdx] = certificateData;
        } else {
          this.currentUser.certificates.push(certificateData);
        }
      }
    }

    this.saveCurrentUser(this.currentUser);
  }

  logout() {
    this.currentUser = null;
    this.isGuest = false;
    localStorage.removeItem(this.STORAGE_KEY_CURRENT_USER);
    this.notifyListeners();
  }

  generateAvatar(name, isGoogle = false) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IO';
    const bg = isGoogle ? '#1d4ed8' : '#0891b2';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${encodeURIComponent(bg)}"/><text x="32" y="39" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="%23ffffff" text-anchor="middle">${initials}</text></svg>`;
  }

  onAuthStateChanged(listener) {
    this.listeners.push(listener);
    // Fire immediately with current state
    listener({
      user: this.currentUser,
      isGuest: this.isGuest,
      isAuthenticated: !!this.currentUser
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const state = {
      user: this.currentUser,
      isGuest: this.isGuest,
      isAuthenticated: !!this.currentUser
    };
    this.listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('Auth listener error', e); }
    });
  }

  // Backend connection configuration (Firebase / Supabase)
  getBackendConfig() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      return data ? JSON.parse(data) : { provider: 'local', apiKey: '', projectUrl: '' };
    } catch (e) {
      return { provider: 'local', apiKey: '', projectUrl: '' };
    }
  }

  saveBackendConfig(config) {
    localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

export const authService = new AuthService();
