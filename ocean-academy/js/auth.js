/**
 * IOI Ocean Academy BD - Authentication & Guest Mode Manager
 * Supports:
 * 1. Real Google Firebase Authentication & Cloud Firestore (when configured)
 *    - Real 1-Click Google Sign-In Popup (via GoogleAuthProvider)
 *    - Real Email/Password Registration & Login (via createUserWithEmailAndPassword)
 *    - Real Cloud Database persistence (via Firestore)
 * 2. Seamless LocalStorage Mock Provider (when running offline or before Firebase is attached)
 * 3. 1-Click "Explore as Guest" with automatic progress migration upon registration
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

    // Firebase instances
    this.firebaseApp = null;
    this.firebaseAuth = null;
    this.firebaseDb = null;
    this.isFirebaseReady = false;

    this.loadState();
    this.initFirebaseIfConfigured();
  }

  loadState() {
    try {
      const savedUser = localStorage.getItem(this.STORAGE_KEY_CURRENT_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.isGuest = false;
      } else {
        const guestFlag = localStorage.getItem(this.STORAGE_KEY_GUEST_PROGRESS);
        if (guestFlag) {
          this.isGuest = true;
        }
      }
    } catch (e) {
      this.currentUser = null;
      this.isGuest = false;
    }
  }

  // Check if real Firebase keys are present and initialize
  async initFirebaseIfConfigured() {
    const config = this.getBackendConfig();
    if (config && config.provider === 'firebase' && config.apiKey && config.projectId) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { 
          getAuth, 
          onAuthStateChanged, 
          signInWithPopup, 
          GoogleAuthProvider, 
          createUserWithEmailAndPassword, 
          signInWithEmailAndPassword, 
          signOut,
          updateProfile
        } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const { getFirestore, doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        this.firebaseApp = initializeApp(config);
        this.firebaseAuth = getAuth(this.firebaseApp);
        this.firebaseDb = getFirestore(this.firebaseApp);
        this.firebaseModules = {
          signInWithPopup,
          GoogleAuthProvider,
          createUserWithEmailAndPassword,
          signInWithEmailAndPassword,
          signOut,
          updateProfile,
          doc,
          setDoc,
          getDoc
        };
        this.isFirebaseReady = true;

        // Listen for real Firebase session changes
        onAuthStateChanged(this.firebaseAuth, async (fbUser) => {
          if (fbUser) {
            let userDoc = null;
            try {
              const snap = await getDoc(doc(this.firebaseDb, 'users', fbUser.uid));
              if (snap.exists()) {
                userDoc = snap.data();
              }
            } catch (err) {
              console.warn('Firestore doc read error:', err);
            }

            this.currentUser = {
              id: fbUser.uid,
              fullName: fbUser.displayName || userDoc?.fullName || 'Ocean Scholar',
              email: fbUser.email,
              avatar: fbUser.photoURL || this.generateAvatar(fbUser.displayName || 'Ocean Scholar', true),
              enrolledCourses: userDoc?.enrolledCourses || ['ocean-101'],
              completedCourses: userDoc?.completedCourses || {},
              quizScores: userDoc?.quizScores || {},
              certificates: userDoc?.certificates || [],
              isFirebase: true
            };
            this.isGuest = false;
            localStorage.setItem(this.STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
          } else {
            if (this.currentUser?.isFirebase) {
              this.currentUser = null;
              localStorage.removeItem(this.STORAGE_KEY_CURRENT_USER);
            }
          }
          this.notifyListeners();
        });
      } catch (e) {
        console.warn('Firebase init error, using local fallback:', e);
        this.isFirebaseReady = false;
      }
    }
  }

  saveCurrentUser(user) {
    this.currentUser = user;
    this.isGuest = false;
    if (user) {
      localStorage.setItem(this.STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
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

  // Register New User (Real Firebase OR Local Storage)
  async register({ fullName, email, password }) {
    if (!fullName || !email || !password) {
      throw new Error('Please fill in all required fields: Full Name, Email, and Password.');
    }
    const cleanEmail = email.trim().toLowerCase();

    // 1. Real Firebase Auth Flow
    if (this.isFirebaseReady && this.firebaseAuth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile, doc, setDoc } = this.firebaseModules;
        const cred = await createUserWithEmailAndPassword(this.firebaseAuth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: fullName.trim() });

        const newUser = {
          id: cred.user.uid,
          fullName: fullName.trim(),
          email: cleanEmail,
          avatar: this.generateAvatar(fullName),
          enrolledCourses: ['ocean-101'],
          completedCourses: {},
          quizScores: {},
          certificates: [],
          isFirebase: true
        };

        this.migrateGuestDataToUser(newUser);

        // Save profile in Cloud Firestore
        try {
          await setDoc(doc(this.firebaseDb, 'users', cred.user.uid), newUser, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore doc creation error:', dbErr);
        }

        this.saveCurrentUser(newUser);
        return newUser;
      } catch (fbError) {
        throw new Error(this.formatFirebaseError(fbError));
      }
    }

    // 2. Local Storage Fallback Flow
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: btoa(password),
      createdAt: new Date().toISOString(),
      avatar: this.generateAvatar(fullName),
      enrolledCourses: ['ocean-101'],
      completedCourses: {},
      quizScores: {},
      certificates: []
    };

    this.migrateGuestDataToUser(newUser);
    users.push(newUser);
    this.saveUsers(users);
    this.saveCurrentUser(newUser);
    return newUser;
  }

  // Login (Real Firebase OR Local Storage)
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }
    const cleanEmail = email.trim().toLowerCase();

    // 1. Real Firebase Auth Flow
    if (this.isFirebaseReady && this.firebaseAuth) {
      try {
        const { signInWithEmailAndPassword, doc, getDoc } = this.firebaseModules;
        const cred = await signInWithEmailAndPassword(this.firebaseAuth, cleanEmail, password);

        let userDoc = {};
        try {
          const snap = await getDoc(doc(this.firebaseDb, 'users', cred.user.uid));
          if (snap.exists()) userDoc = snap.data();
        } catch (e) {}

        const user = {
          id: cred.user.uid,
          fullName: cred.user.displayName || userDoc.fullName || 'Ocean Scholar',
          email: cred.user.email,
          avatar: cred.user.photoURL || this.generateAvatar(cred.user.displayName || 'Ocean Scholar'),
          enrolledCourses: userDoc.enrolledCourses || ['ocean-101'],
          completedCourses: userDoc.completedCourses || {},
          quizScores: userDoc.quizScores || {},
          certificates: userDoc.certificates || [],
          isFirebase: true
        };

        this.migrateGuestDataToUser(user);
        this.saveCurrentUser(user);
        return user;
      } catch (fbError) {
        throw new Error(this.formatFirebaseError(fbError));
      }
    }

    // 2. Local Storage Fallback Flow
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No registered account found with this email. Please sign up first.');
    }

    if (user.passwordHash !== btoa(password)) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    this.migrateGuestDataToUser(user);
    this.saveCurrentUser(user);
    return user;
  }

  // Google OAuth Sign-In (Real Firebase Popup OR Local Simulator)
  async loginWithGoogle(simulatedName = null) {
    // 1. Real Firebase Google Sign-In Popup
    if (this.isFirebaseReady && this.firebaseAuth) {
      try {
        const { signInWithPopup, GoogleAuthProvider, doc, getDoc, setDoc } = this.firebaseModules;
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(this.firebaseAuth, provider);
        const fbUser = result.user;

        let userDoc = {};
        try {
          const snap = await getDoc(doc(this.firebaseDb, 'users', fbUser.uid));
          if (snap.exists()) {
            userDoc = snap.data();
          }
        } catch (e) {}

        const user = {
          id: fbUser.uid,
          fullName: fbUser.displayName || userDoc.fullName || 'Ocean Scholar',
          email: fbUser.email,
          avatar: fbUser.photoURL || this.generateAvatar(fbUser.displayName || 'Ocean Scholar', true),
          enrolledCourses: userDoc.enrolledCourses || ['ocean-101'],
          completedCourses: userDoc.completedCourses || {},
          quizScores: userDoc.quizScores || {},
          certificates: userDoc.certificates || [],
          isFirebase: true
        };

        this.migrateGuestDataToUser(user);

        // Sync to Firestore
        try {
          await setDoc(doc(this.firebaseDb, 'users', fbUser.uid), user, { merge: true });
        } catch (e) {}

        this.saveCurrentUser(user);
        return user;
      } catch (fbError) {
        throw new Error(this.formatFirebaseError(fbError));
      }
    }

    // 2. Local Storage Simulator
    const fullName = simulatedName || "Ocean Scholar";
    const cleanEmail = `scholar.${Math.floor(Math.random() * 899 + 100)}@ioiacademy.org`;

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

  // Migrate Guest Progress so user doesn't lose their completed quiz
  migrateGuestDataToUser(user) {
    const guestProgress = this.getGuestProgress();
    if (!guestProgress) return;

    if (guestProgress.quizScores) {
      user.quizScores = { ...user.quizScores, ...guestProgress.quizScores };
    }
    if (guestProgress.completedCourses) {
      user.completedCourses = { ...user.completedCourses, ...guestProgress.completedCourses };
    }
    localStorage.removeItem(this.STORAGE_KEY_GUEST_PROGRESS);
  }

  // Save Quiz Completion & Certificate to User Profile (and Cloud Firestore if connected)
  async saveUserQuizResult(courseId, scoreData, certificateData = null) {
    if (!this.currentUser) {
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
        const existingIdx = this.currentUser.certificates.findIndex(c => c.courseId === courseId);
        if (existingIdx !== -1) {
          this.currentUser.certificates[existingIdx] = certificateData;
        } else {
          this.currentUser.certificates.push(certificateData);
        }
      }
    }

    this.saveCurrentUser(this.currentUser);

    // Sync to Cloud Firestore if real Firebase is connected
    if (this.isFirebaseReady && this.firebaseDb && this.currentUser.id) {
      try {
        const { doc, setDoc } = this.firebaseModules;
        await setDoc(doc(this.firebaseDb, 'users', this.currentUser.id), {
          quizScores: this.currentUser.quizScores,
          completedCourses: this.currentUser.completedCourses,
          certificates: this.currentUser.certificates
        }, { merge: true });
      } catch (err) {
        console.warn('Error syncing certificate to Firestore:', err);
      }
    }
  }

  async logout() {
    if (this.isFirebaseReady && this.firebaseAuth) {
      try {
        const { signOut } = this.firebaseModules;
        await signOut(this.firebaseAuth);
      } catch (e) {}
    }
    this.currentUser = null;
    this.isGuest = false;
    localStorage.removeItem(this.STORAGE_KEY_CURRENT_USER);
    this.notifyListeners();
  }

  generateAvatar(name, isGoogle = false) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IO';
    const bg = isGoogle ? '#0284c7' : '#0369a1';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${encodeURIComponent(bg)}"/><text x="32" y="39" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="%23ffffff" text-anchor="middle">${initials}</text></svg>`;
  }

  onAuthStateChanged(listener) {
    this.listeners.push(listener);
    listener({
      user: this.currentUser,
      isGuest: this.isGuest,
      isAuthenticated: !!this.currentUser,
      isFirebase: this.isFirebaseReady
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const state = {
      user: this.currentUser,
      isGuest: this.isGuest,
      isAuthenticated: !!this.currentUser,
      isFirebase: this.isFirebaseReady
    };
    this.listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('Auth listener error', e); }
    });
  }

  getBackendConfig() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      return data ? JSON.parse(data) : { provider: 'local' };
    } catch (e) {
      return { provider: 'local' };
    }
  }

  saveBackendConfig(config) {
    localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
    this.initFirebaseIfConfigured();
  }

  formatFirebaseError(err) {
    const code = err.code || '';
    if (code === 'auth/email-already-in-use') return 'An account with this email address already exists.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Incorrect email or password.';
    if (code === 'auth/user-not-found') return 'No account found with this email.';
    if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
    if (code === 'auth/popup-closed-by-user') return 'Sign-in popup was closed before completing.';
    if (code === 'auth/unauthorized-domain') return 'Domain not authorized in Firebase Console (add your domain in Auth > Settings > Authorized Domains).';
    return err.message || 'Authentication failed. Please try again.';
  }
}

export const authService = new AuthService();
