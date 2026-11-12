/**
 * IOI Ocean Academy BD - Main Application Bootstrap & Router
 * Connects:
 * - Multi-view single-page application navigation
 * - Authentication & Guest Mode state management
 * - Course Lesson Viewer & Interactive Depth Stratification Explorer
 * - Modular 5-Format Quiz Engine with 80% passing threshold
 * - In-Browser High-Res Certificate Studio & Verification System
 * - Synthesized Web Audio API sound effects
 * - Modern Web Guidance Dialog Light-Dismiss Fallbacks
 * - Elegant Light Theme: White & Ocean Blue Palette
 */

import { coursesData } from './course-data.js';
import { authService } from './auth.js';
import { QuizEngine } from './quiz-engine.js';
import { CertificateManager } from './certificate.js';
import { oceanAudio } from './audio.js';

class App {
  constructor() {
    this.currentCourse = coursesData[0]; // Default to flagship ocean-101
    this.activeView = 'home';
    this.quizEngine = null;
    this.certManager = null;
    this.lastScoreResult = null;
  }

  init() {
    this.setupModernDialogFallbacks();
    this.initCertificateManager();
    this.setupNavigation();
    this.setupAuthUI();
    this.setupAudioControls();
    this.renderCourseCards();
    this.setupDepthExplorer();
    this.setupVerificationView();

    // Check URL parameters (e.g. ?verify=IOI-BD-2026-XXXX)
    this.handleUrlParams();

    // Create lucide icons initially
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Modern Web Guidance: Dialog Light-Dismiss Fallback
  setupModernDialogFallbacks() {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      document.querySelectorAll('dialog[closedby="any"]').forEach(dialog => {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => {
          pressedOutside = outside(e, dialog);
        });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && outside(e, dialog)) {
            dialog.close();
          }
        });
      });
    }
  }

  initCertificateManager() {
    const canvas = document.getElementById('cert-preview-canvas');
    if (canvas) {
      this.certManager = new CertificateManager(canvas);
    }
  }

  // Router & View Switcher
  navigateTo(viewId) {
    this.activeView = viewId;
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.nav === viewId) {
        link.className = 'nav-link px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-sky-600 shadow-sm transition';
      } else {
        link.className = 'nav-link px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-sky-700 transition';
      }
    });

    // Close mobile menu if open
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileDrawer) mobileDrawer.classList.add('hidden');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        oceanAudio.playClick();
        this.navigateTo(el.dataset.nav);
      });
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.navigateTo(hash);
    });

    // Mobile menu toggle
    const btnMobile = document.getElementById('btn-mobile-menu');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (btnMobile && mobileDrawer) {
      btnMobile.addEventListener('click', () => {
        mobileDrawer.classList.toggle('hidden');
      });
    }

    // Hero buttons
    const btnHeroGuest = document.getElementById('btn-hero-guest');
    if (btnHeroGuest) {
      btnHeroGuest.addEventListener('click', () => {
        oceanAudio.playClick();
        authService.loginAsGuest();
        this.loadCourse(coursesData[0]);
        this.navigateTo('lesson');
      });
    }

    const btnHeroReg = document.getElementById('btn-hero-register');
    if (btnHeroReg) {
      btnHeroReg.addEventListener('click', () => {
        oceanAudio.playClick();
        this.openAuthModal('register');
      });
    }

    // Direct quiz jump buttons
    const btnJumpQuiz = document.getElementById('btn-jump-to-quiz');
    const btnStartQuizBottom = document.getElementById('btn-start-quiz-bottom');
    [btnJumpQuiz, btnStartQuizBottom].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          oceanAudio.playClick();
          this.startQuiz();
        });
      }
    });
  }

  // Audio Ambience & Sound Toggle Controls
  setupAudioControls() {
    const btnWaves = document.getElementById('btn-ambient-waves');
    if (btnWaves) {
      btnWaves.addEventListener('click', () => {
        const isPlaying = oceanAudio.toggleAmbientWaves();
        btnWaves.classList.toggle('text-sky-700', isPlaying);
        btnWaves.classList.toggle('bg-sky-50', isPlaying);
        btnWaves.classList.toggle('border-sky-300', isPlaying);
      });
    }

    const btnMute = document.getElementById('btn-audio-mute');
    const iconVol = document.getElementById('icon-volume');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = oceanAudio.toggleMute();
        btnMute.classList.toggle('text-rose-600', isMuted);
        if (iconVol) {
          iconVol.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }
  }

  // Auth UI and Reactive State Subscription
  setupAuthUI() {
    const authSlot = document.getElementById('auth-header-slot');
    const authDialog = document.getElementById('auth-dialog');
    const claimDialog = document.getElementById('claim-dialog');
    const backendDialog = document.getElementById('backend-config-dialog');

    authService.onAuthStateChanged(state => {
      if (state.isAuthenticated) {
        // Authenticated user view
        authSlot.innerHTML = `
          <div class="flex items-center gap-2">
            <button id="btn-header-profile" type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200 hover:border-sky-400 text-xs font-semibold text-slate-800 transition shadow-sm">
              <span class="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                <img src="${state.user.avatar}" class="w-full h-full object-cover">
              </span>
              <span class="hidden sm:inline max-w-[120px] truncate">${state.user.fullName}</span>
            </button>
            <button id="btn-header-logout" type="button" title="Sign Out" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        `;
        document.getElementById('btn-header-profile')?.addEventListener('click', () => this.navigateTo('profile'));
        document.getElementById('btn-header-logout')?.addEventListener('click', () => {
          oceanAudio.playClick();
          authService.logout();
        });
      } else if (state.isGuest) {
        // Guest mode pill
        authSlot.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-semibold flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Guest Learner
            </span>
            <button id="btn-header-signin" type="button" class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm">
              Sign In
            </button>
          </div>
        `;
        document.getElementById('btn-header-signin')?.addEventListener('click', () => this.openAuthModal('login'));
      } else {
        // Unauthenticated view
        authSlot.innerHTML = `
          <div class="flex items-center gap-2">
            <button id="btn-header-guest" type="button" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition hidden sm:inline-block shadow-sm">
              Guest Mode
            </button>
            <button id="btn-header-signin" type="button" class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm">
              Sign In
            </button>
          </div>
        `;
        document.getElementById('btn-header-guest')?.addEventListener('click', () => {
          oceanAudio.playClick();
          authService.loginAsGuest();
          this.navigateTo('lesson');
        });
        document.getElementById('btn-header-signin')?.addEventListener('click', () => this.openAuthModal('login'));
      }

      this.updateProfileView();
      if (window.lucide) window.lucide.createIcons({ root: authSlot });
    });

    // Auth modal tabs
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const authError = document.getElementById('auth-error-msg');

    tabLogin?.addEventListener('click', () => {
      tabLogin.className = 'py-2 text-xs font-bold rounded-lg bg-sky-600 text-white transition shadow-sm';
      tabRegister.className = 'py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition';
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
      authError.classList.add('hidden');
    });

    tabRegister?.addEventListener('click', () => {
      tabRegister.className = 'py-2 text-xs font-bold rounded-lg bg-sky-600 text-white transition shadow-sm';
      tabLogin.className = 'py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition';
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
      authError.classList.add('hidden');
    });

    // Sign In Submit
    formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await authService.login({ email, password });
        oceanAudio.playSuccess();
        authDialog.close();
        this.checkCertificateStatusAfterAuth();
      } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
        oceanAudio.playIncorrect();
      }
    });

    // Sign Up Submit
    formRegister?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fullName = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        await authService.register({ fullName, email, password });
        oceanAudio.playCelebration();
        authDialog.close();
        this.checkCertificateStatusAfterAuth();
      } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
        oceanAudio.playIncorrect();
      }
    });

    // Google Sign-In button
    document.getElementById('btn-login-google')?.addEventListener('click', async () => {
      oceanAudio.playSuccess();
      try {
        if (authService.isFirebaseReady) {
          await authService.loginWithGoogle();
          authDialog.close();
          this.checkCertificateStatusAfterAuth();
        } else {
          const guestName = prompt("Enter your Name for Google Account simulation (or connect real Firebase via 'Auth / Backend Setup' in footer):", "Dr. Ocean Explorer");
          if (guestName) {
            await authService.loginWithGoogle(guestName);
            authDialog.close();
            this.checkCertificateStatusAfterAuth();
          }
        }
      } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
        oceanAudio.playIncorrect();
      }
    });

    // Guest button in modal
    document.getElementById('btn-login-guest-modal')?.addEventListener('click', () => {
      oceanAudio.playClick();
      authService.loginAsGuest();
      authDialog.close();
      this.navigateTo('lesson');
    });

    // Guest Certificate Claim Dialog Form
    document.getElementById('form-claim-register')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fullName = document.getElementById('claim-name').value;
        const email = document.getElementById('claim-email').value;
        const password = document.getElementById('claim-password').value;
        await authService.register({ fullName, email, password });
        oceanAudio.playCelebration();
        claimDialog.close();
        this.renderUnlockedCertificate();
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById('btn-claim-cert-guest')?.addEventListener('click', () => {
      oceanAudio.playClick();
      claimDialog.showModal();
    });

    document.getElementById('btn-overlay-claim')?.addEventListener('click', () => {
      oceanAudio.playClick();
      claimDialog.showModal();
    });

    // Backend config dialog
    document.getElementById('btn-open-backend-config')?.addEventListener('click', () => {
      oceanAudio.playClick();
      const cfg = authService.getBackendConfig();
      const select = document.getElementById('cfg-provider');
      if (select) select.value = cfg.provider || 'local';
      const jsonArea = document.getElementById('cfg-firebase-json');
      if (jsonArea && cfg.provider === 'firebase') {
        jsonArea.value = JSON.stringify(cfg, null, 2);
      }
      backendDialog.showModal();
    });

    document.getElementById('form-backend-config')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const provider = document.getElementById('cfg-provider').value;
      if (provider === 'firebase') {
        const raw = document.getElementById('cfg-firebase-json')?.value.trim() || '';
        let parsed = null;
        try {
          if (raw.startsWith('{')) {
            parsed = JSON.parse(raw);
          } else {
            const extract = (key) => {
              const m = raw.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
              return m ? m[1] : '';
            };
            parsed = {
              apiKey: extract('apiKey'),
              authDomain: extract('authDomain'),
              projectId: extract('projectId'),
              storageBucket: extract('storageBucket'),
              messagingSenderId: extract('messagingSenderId'),
              appId: extract('appId')
            };
          }
          if (!parsed.apiKey || !parsed.projectId) {
            throw new Error('Please ensure apiKey and projectId are present in your Firebase config.');
          }
          parsed.provider = 'firebase';
          authService.saveBackendConfig(parsed);
          alert('Firebase configuration saved successfully! The app is now connected to live Firebase Authentication.');
          backendDialog.close();
          window.location.reload();
        } catch (err) {
          alert('Error parsing Firebase config: ' + err.message);
        }
      } else {
        authService.saveBackendConfig({ provider: 'local' });
        alert('Switched to Built-in Local Storage (Offline / Demo Mode).');
        backendDialog.close();
        window.location.reload();
      }
    });

    // Profile logout
    document.getElementById('btn-logout-profile')?.addEventListener('click', () => {
      oceanAudio.playClick();
      authService.logout();
      this.navigateTo('home');
    });

    // Certificate download buttons
    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      oceanAudio.playClick();
      if (this.certManager) this.certManager.downloadPDF();
    });

    document.getElementById('btn-download-png')?.addEventListener('click', () => {
      oceanAudio.playClick();
      if (this.certManager) this.certManager.downloadPNG();
    });

    document.getElementById('btn-copy-cert-link')?.addEventListener('click', () => {
      oceanAudio.playSuccess();
      const text = document.getElementById('cert-share-link-text')?.textContent;
      if (text) {
        navigator.clipboard.writeText(text);
        alert('Verification link copied to clipboard!');
      }
    });
  }

  openAuthModal(defaultTab = 'login') {
    const dialog = document.getElementById('auth-dialog');
    if (dialog) {
      if (defaultTab === 'register') {
        document.getElementById('tab-auth-register')?.click();
      } else {
        document.getElementById('tab-auth-login')?.click();
      }
      dialog.showModal();
    }
  }

  // Render Courses Cards in Home View
  renderCourseCards() {
    const grid = document.getElementById('course-cards-grid');
    if (!grid) return;

    grid.innerHTML = coursesData.map(course => `
      <div class="bg-white border border-slate-200 hover:border-sky-400 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200">
              ${course.code}
            </span>
            <span class="text-xs text-amber-600 font-semibold">${course.badge}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition leading-snug">
            ${course.title}
          </h3>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">
            ${course.subtitle}
          </p>
          <div class="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-sky-600"></i> ${course.estimatedHours}</span>
            <span>•</span>
            <span class="flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-teal-600"></i> ${course.passingThreshold}% Passing Grade</span>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <button type="button" class="btn-enroll-course flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-1.5 shadow-sm" data-cid="${course.id}">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Study Course
          </button>
          ${course.quiz ? `
            <button type="button" class="btn-quiz-course px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition" data-cid="${course.id}" title="Take Quiz">
              <i data-lucide="brain" class="w-4 h-4 text-sky-600"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-enroll-course').forEach(btn => {
      btn.addEventListener('click', () => {
        oceanAudio.playClick();
        const cid = btn.dataset.cid;
        const course = coursesData.find(c => c.id === cid);
        if (course) {
          this.loadCourse(course);
          this.navigateTo('lesson');
        }
      });
    });

    grid.querySelectorAll('.btn-quiz-course').forEach(btn => {
      btn.addEventListener('click', () => {
        oceanAudio.playClick();
        const cid = btn.dataset.cid;
        const course = coursesData.find(c => c.id === cid);
        if (course) {
          this.loadCourse(course);
          this.startQuiz();
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: grid });
    }
  }

  // Load Course into Lesson View
  loadCourse(course) {
    this.currentCourse = course;
    document.getElementById('lesson-course-title').textContent = course.title;

    const container = document.getElementById('lesson-modules-container');
    if (!container) return;

    container.innerHTML = course.modules.map(mod => `
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-xl font-bold text-sky-800">${mod.title}</h3>
          <span class="text-xs text-slate-500 flex items-center gap-1">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${mod.readTime}
          </span>
        </div>
        <div class="space-y-4 text-slate-700 text-sm leading-relaxed">
          ${mod.sections.map(sec => `
            <div>
              <h4 class="font-bold text-slate-900 text-base mb-1">${sec.heading}</h4>
              <div class="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">${sec.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }
  }

  // Interactive Depth Explorer Widget
  setupDepthExplorer() {
    const tabs = document.querySelectorAll('.zone-tab');
    const box = document.getElementById('zone-detail-box');
    if (!tabs.length || !box) return;

    const zoneDetails = {
      epi: `<strong class="text-sky-800">Epipelagic (Sunlight Zone, 0–200m):</strong> High solar irradiance powers chlorophyll photosynthesis by diatoms and dinoflagellates. In the Bay of Bengal, major surface fisheries (Hilsa, Indian Mackerel, Yellowfin Tuna) and green sea turtles occupy this layer. Primary salinity changes occur here due to the discharge of the Ganges-Brahmaputra-Meghna system.`,
      meso: `<strong class="text-blue-800">Mesopelagic (Twilight Zone, 200–1,000m):</strong> Sunlight decays to near total darkness. Organisms utilize photophores for bioluminescence. Hosts the daily Diel Vertical Migration. In the northern Bay of Bengal, this layer coincides with a pronounced Oxygen Minimum Zone (OMZ) where specialized mid-water shrimp and lanternfish thrive.`,
      bathy: `<strong class="text-indigo-800">Bathypelagic (Midnight Zone, 1,000–4,000m):</strong> Complete darkness, water temperatures hovering at 2–4°C, and pressure exceeding 200 atmospheres. Inhabitants include deep-sea anglerfish (*Ceratiidae*), gulper eels, and pelagic octopods feeding on marine snow.`,
      abyss: `<strong class="text-purple-800">Abyssal &amp; Hadal Trenches (>4,000m):</strong> The abyssal floor of the Bay of Bengal is covered by the colossal Bengal Fan, reaching south into the Central Indian Basin. Characterized by chemotrophic bacterial mats, hexactinellid glass sponges, and benthic holothurians.`
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        oceanAudio.playClick();
        tabs.forEach(t => t.classList.remove('ring-2', 'ring-sky-500'));
        tab.classList.add('ring-2', 'ring-sky-500');
        const zone = tab.dataset.zone;
        box.innerHTML = zoneDetails[zone] || '';
      });
    });
  }

  // Launch Quiz View
  startQuiz() {
    if (!this.currentCourse.quiz) {
      alert("This elective's quiz is unlocked after completing Course 101!");
      return;
    }

    this.navigateTo('quiz');
    const mount = document.getElementById('quiz-mount-point');

    this.quizEngine = new QuizEngine(this.currentCourse.quiz, mount, (result) => {
      this.handleQuizCompletion(result);
    });
    this.quizEngine.init();
  }

  // Handle Quiz Results & Certificate Gating
  handleQuizCompletion(result) {
    this.lastScoreResult = result;

    if (result.passed) {
      const isGuest = !authService.currentUser;
      const certData = this.certManager.createCertificateRecord({
        course: this.currentCourse,
        scoreResult: result,
        userName: authService.currentUser ? authService.currentUser.fullName : "Guest Learner"
      });

      authService.saveUserQuizResult(this.currentCourse.id, result, certData);
      this.certManager.renderCertificate(certData, isGuest);

      const linkEl = document.getElementById('cert-share-link-text');
      if (linkEl) linkEl.textContent = certData.verificationUrl;

      const lockBanner = document.getElementById('guest-lock-banner');
      const guestOverlay = document.getElementById('cert-guest-overlay');
      const btnPdf = document.getElementById('btn-download-pdf');
      const btnPng = document.getElementById('btn-download-png');

      if (isGuest) {
        lockBanner.classList.remove('hidden');
        guestOverlay.classList.remove('hidden');
        btnPdf.classList.add('opacity-50', 'cursor-not-allowed');
        btnPng.classList.add('opacity-50', 'cursor-not-allowed');
        btnPdf.setAttribute('disabled', 'true');
        btnPng.setAttribute('disabled', 'true');
      } else {
        lockBanner.classList.add('hidden');
        guestOverlay.classList.add('hidden');
        btnPdf.classList.remove('opacity-50', 'cursor-not-allowed');
        btnPng.classList.remove('opacity-50', 'cursor-not-allowed');
        btnPdf.removeAttribute('disabled');
        btnPng.removeAttribute('disabled');
      }

      setTimeout(() => {
        this.navigateTo('certificate');
      }, 1500);
    }
  }

  renderUnlockedCertificate() {
    if (!this.lastScoreResult && authService.currentUser) {
      const cert = authService.currentUser.certificates?.[0];
      if (cert) {
        this.certManager.renderCertificate(cert, false);
      }
    } else if (this.lastScoreResult && authService.currentUser) {
      const certData = this.certManager.createCertificateRecord({
        course: this.currentCourse,
        scoreResult: this.lastScoreResult,
        userName: authService.currentUser.fullName
      });
      authService.saveUserQuizResult(this.currentCourse.id, this.lastScoreResult, certData);
      this.certManager.renderCertificate(certData, false);

      const linkEl = document.getElementById('cert-share-link-text');
      if (linkEl) linkEl.textContent = certData.verificationUrl;
    }

    document.getElementById('guest-lock-banner')?.classList.add('hidden');
    document.getElementById('cert-guest-overlay')?.classList.add('hidden');
    const btnPdf = document.getElementById('btn-download-pdf');
    const btnPng = document.getElementById('btn-download-png');
    btnPdf?.classList.remove('opacity-50', 'cursor-not-allowed');
    btnPng?.classList.remove('opacity-50', 'cursor-not-allowed');
    btnPdf?.removeAttribute('disabled');
    btnPng?.removeAttribute('disabled');
  }

  checkCertificateStatusAfterAuth() {
    if (this.lastScoreResult && this.lastScoreResult.passed) {
      this.renderUnlockedCertificate();
      this.navigateTo('certificate');
    }
  }

  // Update Profile Dashboard
  updateProfileView() {
    const user = authService.currentUser;
    if (!user) return;

    document.getElementById('profile-name').textContent = user.fullName;
    document.getElementById('profile-email').textContent = user.email;

    const avatarBox = document.getElementById('profile-avatar-container');
    if (avatarBox) {
      avatarBox.innerHTML = `<img src="${user.avatar}" class="w-full h-full object-cover">`;
    }

    const enrolled = user.enrolledCourses ? user.enrolledCourses.length : 1;
    const completed = user.completedCourses ? Object.keys(user.completedCourses).length : 0;
    const certs = user.certificates ? user.certificates.length : 0;

    document.getElementById('stat-enrolled').textContent = enrolled;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-certs').textContent = certs;

    const certsList = document.getElementById('profile-certs-list');
    if (!certsList) return;

    if (!user.certificates || user.certificates.length === 0) {
      certsList.innerHTML = `
        <div class="col-span-2 p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          No certificates earned yet. Complete Course 101 with an 80% score to generate your first diploma!
        </div>
      `;
    } else {
      certsList.innerHTML = user.certificates.map(c => `
        <div class="p-5 rounded-xl bg-white border border-sky-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Accredited Diploma</div>
            <h4 class="text-sm font-bold text-slate-900">${c.courseTitle}</h4>
            <div class="text-xs text-slate-500 mt-1">ID: <span class="font-mono text-sky-700">${c.certId}</span> • Score: ${c.score}%</div>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <button type="button" class="btn-view-saved-cert px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm" data-certid="${c.certId}">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Diploma
            </button>
            <a href="${c.verificationUrl}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Verify
            </a>
          </div>
        </div>
      `).join('');

      certsList.querySelectorAll('.btn-view-saved-cert').forEach(btn => {
        btn.addEventListener('click', () => {
          oceanAudio.playClick();
          const cert = user.certificates.find(x => x.certId === btn.dataset.certid);
          if (cert && this.certManager) {
            this.certManager.renderCertificate(cert, false);
            this.renderUnlockedCertificate();
            this.navigateTo('certificate');
          }
        });
      });
    }

    if (window.lucide) {
      window.lucide.createIcons({ root: certsList });
    }
  }

  // Certificate Verification Lookup
  setupVerificationView() {
    const form = document.getElementById('form-verify');
    const resultBox = document.getElementById('verify-result-box');
    if (!form || !resultBox) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      oceanAudio.playClick();
      const queryId = document.getElementById('verify-input-id').value.trim().toUpperCase();

      const users = authService.getUsers();
      let foundCert = null;
      let recipientName = "Verified Scholar";

      for (const u of users) {
        if (u.certificates) {
          const match = u.certificates.find(c => c.certId === queryId);
          if (match) {
            foundCert = match;
            recipientName = u.fullName;
            break;
          }
        }
      }

      if (!foundCert && this.certManager?.currentCert?.certId === queryId) {
        foundCert = this.certManager.currentCert;
        recipientName = foundCert.userName;
      }

      resultBox.classList.remove('hidden');

      if (foundCert) {
        oceanAudio.playSuccess();
        resultBox.innerHTML = `
          <div class="flex items-center gap-3 border-b border-emerald-200 pb-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Authentication Verified</div>
              <h3 class="text-lg font-bold text-slate-900">Official Credential Authenticated</h3>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
            <div>
              <span class="text-slate-500">Recipient Name:</span>
              <div class="text-sm font-bold text-slate-900 mt-0.5">${recipientName}</div>
            </div>
            <div>
              <span class="text-slate-500">Certificate Serial ID:</span>
              <div class="text-sm font-mono font-bold text-sky-700 mt-0.5">${foundCert.certId}</div>
            </div>
            <div>
              <span class="text-slate-500">Course Title:</span>
              <div class="text-sm font-semibold text-slate-800 mt-0.5">${foundCert.courseTitle}</div>
            </div>
            <div>
              <span class="text-slate-500">Issuing Authority:</span>
              <div class="text-sm font-semibold text-slate-800 mt-0.5">IOI Ocean Academy BD</div>
            </div>
            <div>
              <span class="text-slate-500">Director:</span>
              <div class="text-sm font-semibold text-slate-800 mt-0.5">Md. Mostafa Monwar</div>
            </div>
            <div>
              <span class="text-slate-500">Examination Score:</span>
              <div class="text-sm font-bold text-emerald-700 mt-0.5">${foundCert.score}% (Honors Pass)</div>
            </div>
            <div>
              <span class="text-slate-500">Date of Conformance:</span>
              <div class="text-sm text-slate-700 mt-0.5">${foundCert.issueDate}</div>
            </div>
          </div>
        `;
      } else {
        oceanAudio.playIncorrect();
        resultBox.innerHTML = `
          <div class="flex items-center gap-3 border-b border-rose-200 pb-3">
            <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-rose-700 uppercase tracking-wider">Verification Unconfirmed</div>
              <h3 class="text-base font-bold text-slate-900">Record ID Not Found</h3>
            </div>
          </div>
          <p class="text-xs text-slate-600 mt-3 leading-relaxed">
            No active certificate matching serial <code class="text-sky-700 font-mono font-bold">${queryId}</code> was found in the database. Please verify the alphanumeric code.
          </p>
        `;
      }

      if (window.lucide) {
        window.lucide.createIcons({ root: resultBox });
      }
    });
  }

  // Handle URL Query Params (?verify=...)
  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify');
    if (verifyId) {
      this.navigateTo('verify');
      const input = document.getElementById('verify-input-id');
      if (input) {
        input.value = verifyId;
        document.getElementById('form-verify')?.dispatchEvent(new Event('submit'));
      }
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
