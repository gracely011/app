// 0. INIT CHECK
// Debug log removed as per user request
// Last Deploy: 2026-02-08 23:15 (Domain Lock Active)


// 0. REDIRECT BLOCKER FOR LOCAL DEVELOPMENT
(function () {
    try {
        // Only activate for local testing (file://, localhost, etc.)
        const isLocal = window.location.protocol === 'file:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (isLocal) {
            // Override window.location.href setter to block redirects to live site
            try {
                Object.defineProperty(window, '__gracelyBlockRedirect', {
                    value: function (url) {
                        if (url && typeof url === 'string' && url.includes('draft.gracely.my.id')) {
                            console.warn('🚫 BLOCKED redirect to:', url);
                            return true; // blocked
                        }
                        return false; // allow
                    },
                    writable: false
                });
            } catch (err) {
                console.warn('Could not define __gracelyBlockRedirect:', err);
            }

            console.log('🛡️ Local Dev Mode: Redirect blocker ACTIVE');
        }
    } catch (e) {
        console.error("Redirect blocker error:", e);
    }
})();

// GRACELY BRANDING - shows on all pages that load script.js
(function () {
    if (window.gracelyBrandingShown) return;
    window.gracelyBrandingShown = true;

    console.log('%cgracely', 'color: black; font-size: 60px; font-weight: bold; font-family: "Montserrat", sans-serif;');
    console.log('%cUnlock Premium Together', 'color: black; font-size: 20px; font-weight: bold; font-family: "Montserrat", sans-serif;');
    console.log('%ccontact@gracely.my.id', 'color: black; font-size: 15px; font-weight: bold; font-family: "Montserrat", sans-serif;');
})();

// 2. Domain Security Check
(function () {
    // Allow file protocol for local testing without redirect
    if (window.location.protocol === 'file:') return;

    var a = ["draft.gracely.my.id", "localhost", "127.0.0.1"],
        h = window.location.hostname,
        p = window.location.pathname,
        o = !1;
    for (var i = 0; i < a.length; i++) {
        if (h === a[i]) {
            o = !0;
            break;
        }
    }

    if (!o) {
        // Only redirect if NOT local development/file
        // window.location.href = "https://draft.gracely.my.id/";
        console.warn("⚠️ Domain check failed but redirect DISABLED for local dev");
    }
})();

function initializeScripts() {
    "use strict";

    // Scroll handling
    window.onscroll = function () {
        const ud_header = document.querySelector(".ud-header");
        if (!ud_header) return;
        const sticky = ud_header.offsetTop;
        const logo = document.querySelector(".navbar-brand img");
        if (window.pageYOffset > sticky) {
            ud_header.classList.add("sticky");
        } else {
            ud_header.classList.remove("sticky");
        }
        if (logo) {
            if (ud_header.classList.contains("sticky")) {
                logo.src = "assets/images/logo/gracely_mobile_black.png";
            } else {
                logo.src = "assets/images/logo/gracely_mobile_white.png";
            }
        }
        const backToTop = document.querySelector(".back-to-top");
        if (backToTop) {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                backToTop.style.display = "flex";
            } else {
                backToTop.style.display = "none";
            }
        }
    };

    // Back to top button
    document.body.addEventListener('click', function (event) {
        if (event.target.closest('.back-to-top')) {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    });



    // 1. Login form
    const loginForm = document.getElementById('login-form') || document.querySelector('.ud-login-form[action*="login"]');
    if (loginForm && !window.location.pathname.includes('signup') && !window.location.pathname.includes('reset') && !window.location.pathname.includes('password') && !window.location.pathname.includes('profile')) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let errorMessage = document.getElementById('login-error-message');
            if (errorMessage) errorMessage.remove();

            const showError = (msg) => {
                let err = document.getElementById('login-error-message');
                if (!err) {
                    err = document.createElement('div');
                    err.id = 'login-error-message';
                    err.className = 'alert alert-danger d-flex align-items-center mb-3';
                    loginForm.parentNode.insertBefore(err, loginForm);
                }
                const displayMsg = (msg && msg.trim()) ? msg : "Login failed. Please check your email and password.";
                err.innerHTML = '<i class="fa-solid fa-circle-exclamation me-2"></i><span>' + displayMsg + '</span>';
            };

            const emailInput = loginForm.querySelector('#email') || loginForm.querySelector('input[name="gracely_email"]') || loginForm.querySelector('input[name="email"]');
            const passwordInput = loginForm.querySelector('#password') || loginForm.querySelector('input[name="gracely_password"]') || loginForm.querySelector('input[name="password"]');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            if (!email || !password) {
                showError("Email and password are required.");
                return;
            }
            const submitButton = loginForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Loading...';
            }
            try {
                const result = typeof login === 'function' ? await login(email, password) : { success: false, message: 'Auth module not loaded' };
                if (result.success) {
                    window.location.href = "dashboard.html";
                } else {
                    showError(result.message || "Login failed. Please check your email and password.");
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Log in';
                    }
                    if (typeof turnstile !== 'undefined') {
                        try { turnstile.reset(); } catch(e) {}
                    }
                }
            } catch (err) {
                console.error("Login error:", err);
                showError(err.message || "An error occurred during login.");
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Log in';
                }
                if (typeof turnstile !== 'undefined') {
                    try { turnstile.reset(); } catch(e) {}
                }
            }
        });
    }

    // 2. Signup form
    const signupForm = document.getElementById('signup-form') || document.querySelector('.ud-login-form[action*="signup"]');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let errorMessage = document.getElementById('signup-error-message');
            if (errorMessage) errorMessage.remove();

            const showError = (msg) => {
                let err = document.getElementById('signup-error-message');
                if (!err) {
                    err = document.createElement('div');
                    err.id = 'signup-error-message';
                    err.className = 'alert alert-danger d-flex align-items-center mb-3';
                    signupForm.parentNode.insertBefore(err, signupForm);
                }
                const displayMsg = (msg && msg.trim()) ? msg : "Registration failed.";
                err.innerHTML = '<i class="fa-solid fa-circle-exclamation me-2"></i><span>' + displayMsg + '</span>';
            };

            const nameInput = signupForm.querySelector('#name') || signupForm.querySelector('input[name="name"]');
            const emailInput = signupForm.querySelector('#email') || signupForm.querySelector('input[name="email"]');
            const passwordInput = signupForm.querySelector('#password') || signupForm.querySelector('input[name="password"]');
            const confirmInput = signupForm.querySelector('#confirm_password') || signupForm.querySelector('input[name="confirm_password"]');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            const confirmPassword = confirmInput ? confirmInput.value : '';

            if (!name || !email || !password) {
                showError('All fields are required!');
                return;
            }
            if (password !== confirmPassword) {
                showError('Passwords do not match!');
                return;
            }
            if (password.length < 6) {
                showError('Password must be at least 6 characters!');
                return;
            }

            const submitButton = signupForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Signing up...';
            }

            try {
                if (typeof signup === 'function') {
                    const result = await signup(name, email, password);
                    if (result.success) {
                        if (submitButton) submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Logging in...';
                        const loginResult = typeof login === 'function' ? await login(email, password, true) : { success: false };
                        if (loginResult && loginResult.success) {
                            window.location.href = 'dashboard.html';
                        } else {
                            alert('Registration successful! Please log in.');
                            window.location.href = 'login.html';
                        }
                    } else {
                        let msg = result.message || 'Registration failed.';
                        if (msg.includes("already registered")) msg = "An account with this email is already registered. Please log in.";
                        showError(msg);
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.innerHTML = 'Sign up';
                        }
                        if (typeof turnstile !== 'undefined') {
                            try { turnstile.reset(); } catch(e) {}
                        }
                    }
                } else {
                    showError('Error: Auth module not loaded.');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Sign up';
                    }
                }
            } catch (err) {
                console.error("Signup error:", err);
                showError(err.message || 'Registration failed.');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Sign up';
                }
                if (typeof turnstile !== 'undefined') {
                    try { turnstile.reset(); } catch(e) {}
                }
            }
        });
    }

    // 3. Reset Password Form
    const resetForm = document.getElementById('reset-form') || document.querySelector('.ud-login-form[action*="reset"]');
    if (resetForm) {
        resetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let errorMessage = document.getElementById('reset-error-message');
            if (errorMessage) errorMessage.remove();

            const showError = (msg, isSuccess = false) => {
                let err = document.getElementById('reset-error-message');
                if (!err) {
                    err = document.createElement('p');
                    err.id = 'reset-error-message';
                    err.className = 'messagebox';
                    const wrapper = document.querySelector('.ud-login-wrapper') || resetForm.parentNode;
                    if (wrapper) wrapper.insertBefore(err, resetForm);
                }
                err.style.color = isSuccess ? '#10b981' : '';
                err.innerHTML = `<span class="icon"><i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i></span>` + msg;
            };

            const emailInput = resetForm.querySelector('#email') || resetForm.querySelector('input[name="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                showError('Harap masukkan email Anda.');
                return;
            }

            const resetButton = resetForm.querySelector('button[type="submit"]');
            if (resetButton) {
                resetButton.disabled = true;
                resetButton.innerHTML = 'Mengirim...';
            }

            if (typeof sendPasswordResetEmail === 'function') {
                const result = await sendPasswordResetEmail(email);
                showError(result.message, result.success);
            } else {
                showError('Error: Fungsi auth.js tidak dimuat.');
            }

            if (resetButton) {
                resetButton.disabled = false;
                resetButton.innerHTML = 'Send reset link';
            }
        });
    }

    // 4. Update Password Form
    const passwordForm = document.getElementById('update-password-form') || document.querySelector('.ud-login-form[action*="password"]');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let errorMessage = document.getElementById('password-message');
            if (errorMessage) errorMessage.remove();

            const showMsg = (msg, isSuccess = false) => {
                let err = document.getElementById('password-message');
                if (!err) {
                    err = document.createElement('p');
                    err.id = 'password-message';
                    err.className = 'messagebox';
                    const wrapper = document.querySelector('.ud-login-wrapper') || passwordForm.parentNode;
                    if (wrapper) wrapper.insertBefore(err, passwordForm);
                }
                err.style.color = isSuccess ? '#10b981' : '';
                err.innerHTML = `<span class="icon"><i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i></span>` + msg;
            };

            const newPwInput = passwordForm.querySelector('#password') || passwordForm.querySelector('#new-password') || passwordForm.querySelector('input[name="password"]');
            const confirmPwInput = passwordForm.querySelector('#confirm_password') || passwordForm.querySelector('#confirm-password') || passwordForm.querySelector('input[name="confirm_password"]');

            const newPassword = newPwInput ? newPwInput.value : '';
            const confirmPassword = confirmPwInput ? confirmPwInput.value : '';

            if (newPassword !== confirmPassword) {
                showMsg('Kata sandi tidak cocok.');
                return;
            }
            if (newPassword.length < 6) {
                showMsg('Kata sandi minimal harus 6 karakter.');
                return;
            }

            const updateButton = passwordForm.querySelector('button[type="submit"]');
            if (updateButton) {
                updateButton.disabled = true;
                updateButton.innerHTML = 'Memperbarui...';
            }

            if (typeof updateUserPassword === 'function') {
                const result = await updateUserPassword(newPassword);
                showMsg(result.message, result.success);
                if (result.success) {
                    passwordForm.reset();
                }
            } else {
                showMsg('Error: Fungsi auth.js tidak dimuat.');
            }

            if (updateButton) {
                updateButton.disabled = false;
                updateButton.innerHTML = 'Update password';
            }
        });
    }

    // 5. Profile Form
    const profileForm = document.getElementById('update-profile-form') || document.querySelector('.ud-login-form[action*="profile"]');
    if (profileForm) {
        const nameInput = profileForm.querySelector('#profile-name') || profileForm.querySelector('#name') || profileForm.querySelector('input[name="name"]');
        const emailInput = profileForm.querySelector('#profile-email') || profileForm.querySelector('#email') || profileForm.querySelector('input[name="email"]');
        const updateButton = profileForm.querySelector('button[type="submit"]') || profileForm.querySelector('#update-button');

        const showProfileMsg = (msg, isSuccess = false) => {
            let existingMsg = document.getElementById('profile-messagebox');
            if (existingMsg) existingMsg.remove();
            let msgEl = document.createElement('p');
            msgEl.id = 'profile-messagebox';
            msgEl.className = 'messagebox';
            msgEl.style.color = isSuccess ? '#10b981' : '';
            msgEl.innerHTML = `<span class="icon"><i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i></span>` + msg;
            const wrapper = document.querySelector('.ud-login-wrapper') || profileForm.parentNode;
            if (wrapper) wrapper.insertBefore(msgEl, profileForm);
        };

        // Populate user data dynamically
        (async function loadUserData() {
            try {
                const storedName = GracelyState.get('userName');
                const storedEmail = GracelyState.get('userEmail');
                if (nameInput && storedName) nameInput.value = storedName;
                if (emailInput && storedEmail) emailInput.value = storedEmail;

                if (storedName) {
                    document.querySelectorAll('.sync-fullname').forEach(el => el.textContent = storedName);
                    const initials = getInitials(storedName);
                    document.querySelectorAll('.sync-avatar').forEach(el => el.textContent = initials);
                }
                if (storedEmail) {
                    document.querySelectorAll('.sync-email').forEach(el => el.textContent = storedEmail);
                }

                if (typeof window.supabaseClient !== 'undefined') {
                    const { data: { user } } = await window.supabaseClient.auth.getUser();
                    if (user) {
                        if (emailInput) emailInput.value = user.email || '';
                        document.querySelectorAll('.sync-email').forEach(el => el.textContent = user.email || '');
                        if (user.user_metadata && user.user_metadata.full_name && !nameInput.value) {
                            nameInput.value = user.user_metadata.full_name;
                        }
                    }
                }
            } catch (e) {
                console.warn('Profile load data warning:', e);
            }
        })();

        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newName = nameInput ? nameInput.value.trim() : '';
            if (!newName) {
                showProfileMsg('Name cannot be empty.');
                return;
            }

            if (updateButton) {
                updateButton.disabled = true;
                updateButton.innerHTML = 'Saving...';
            }

            if (typeof updateUserName === 'function') {
                const result = await updateUserName(newName);
                showProfileMsg(result.success ? 'Profile updated successfully.' : result.message, result.success);
                if (result.success) {
                    GracelyState.set('userName', newName);
                    syncAuthState();
                }
            } else {
                showProfileMsg('Error: Auth module not loaded.');
            }

            if (updateButton) {
                updateButton.disabled = false;
                updateButton.innerHTML = 'Save profile';
            }
        });
    }

    // Logout button
    document.body.addEventListener('click', function (event) {
        if (event.target.closest('#logout-button')) {
            logout();
        }
    });

    // Video modals
    const videoModals = [
        { btnId: "openModalBtn", modalId: "videoModal", videoId: "videoElement" },
        { btnId: "openModalBtnKiwi", modalId: "videoModalKiwi", videoId: "videoElementKiwi" },
        { btnId: "openModalBtnOrion", modalId: "videoModalOrion", videoId: "videoElementOrion" },
        { btnId: "openModalBtnDemo", modalId: "videoModalDemo", videoId: "videoElementDemo" }
    ];
    videoModals.forEach(({ btnId, modalId, videoId }) => {
        const openBtn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const video = document.getElementById(videoId);
        if (openBtn && modal && video) {
            openBtn.addEventListener("click", () => {
                modal.style.display = "flex";
                video.currentTime = 0;
                video.play();
            });
            window.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.style.display = "none";
                    video.pause();
                }
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = "none";
                    video.pause();
                }
            });
        }
    });

    // Start session check
    startSessionCheckLoop();
}
function handleMultiLoginKick(message) {
    GracelyState.remove('isAuthenticated');
    GracelyState.remove('userEmail');
    GracelyState.remove('userName');
    GracelyState.remove('isPremium');
    GracelyState.remove('gracely_active_session_token');
    GracelyState.remove('premiumExpiryDate');
    GracelyState.remove('gracelyPremiumConfig');
    GracelyState.remove('gracely_db_session_id');

    // 1. Force Clear Main Session Cookie
    document.cookie = 'gracely_session_token=; Max-Age=-99999999; path=/; SameSite=Lax; Secure';
    document.cookie = 'gracely_session_token=; Max-Age=-99999999; path=/hai/; SameSite=Lax; Secure';

    // 2. Trigger Extension Logout (Critical)
    document.cookie = 'UnangJahaCookieOnLae=true; path=/; SameSite=Lax; Secure';

    if (typeof eraseCookie === 'function') {
        eraseCookie('gracely_active_session');
        eraseCookie('gracely_config_url');
        eraseCookie('is_premium');
        eraseCookie('gracely_session_token');
    }

    alert(message);
    window.location.href = 'login.html';
}
function handleStatusUpdate(dbStatus) {
    GracelyState.remove('isPremium');
    GracelyState.remove('premiumExpiryDate');
    GracelyState.remove('gracelyPremiumConfig');

    // Update Plan Details
    GracelyState.set('userPlanName', dbStatus.planName || 'No Premium');
    GracelyState.set('userPlanNumber', dbStatus.planNumber || '0');

    // Update Premium Status
    if (dbStatus.isPremium) {
        GracelyState.set('isPremium', 'true');
        GracelyState.set('premiumExpiryDate', dbStatus.premiumExpiryDate || '');
        GracelyState.set('gracelyPremiumConfig', dbStatus.premiumConfig || '');
    } else {
        GracelyState.set('isPremium', 'false');
    }
}

function startSessionCheckLoop() {
    // 1. Periksa apakah user login
    if (GracelyState.get('isAuthenticated') !== 'true') { return; }

    // 2. Ambil ID Sesi
    const localSessionId = GracelyState.get('gracely_db_session_id');
    if (!localSessionId) {
        return;
    }

    // --- FITUR 1: REALTIME LISTENER (CCTV-nya) ---
    try {
        const channel = supabaseClient.channel('session_guard_' + localSessionId)
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'user_sessions'
                },
                (payload) => {
                    // Manual filter client-side to avoid binding mismatches
                    if (payload.old && payload.old.session_token === localSessionId) {
                        handleMultiLoginKick("Akun Anda telah login di perangkat lain. Sesi ini dihentikan saat itu juga, bos!");
                    }
                }
            )
            .subscribe((status, err) => {
                // Silently subscribe
            });
    } catch (realtimeErr) {
        // Silent error handling
    }

    // --- FITUR 2: POLLING FALLBACK (Patroli Rutin) ---
    // Jaga-jaga kalau koneksi Realtime putus, tetap cek manual setiap 5 detik
    const checkInterval = 5000;

    // Cek awal langsung
    checkSessionValidity(localSessionId);

    setInterval(() => checkSessionValidity(localSessionId), checkInterval);
}

async function checkSessionValidity(localSessionId) {
    // A. Cek Eksistensi Sesi di Database
    const { data, error } = await supabaseClient
        .from('user_sessions')
        .select('session_token')
        .eq('session_token', localSessionId)
        .single();

    // CRITICAL FIX: Distinguish between network errors and actual session invalidation
    if (error) {
        // Check if this is a network error (should be IGNORED)
        const errorMsg = (error.message || '').toLowerCase();
        const isNetworkError = (
            errorMsg.includes('fetch') ||
            errorMsg.includes('network') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout') ||
            errorMsg.includes('failed to fetch') ||
            error.message === 'Failed to fetch' ||
            !error.message  // No message usually means network issue
        );

        if (isNetworkError) {
            return;  // EXIT - do NOT logout on network errors!
        }

        // Only logout if it's a confirmed DB error (not network)
        handleMultiLoginKick("Akun Anda login di perangkat lain. Sesi ini berakhir.");
        return;
    }

    // If no data returned, session was deleted
    if (!data) {
        handleMultiLoginKick("Akun Anda login di perangkat lain. Sesi ini berakhir.");
        return;
    }

    // B. Cek Premium/Config Update
    if (typeof getUserId === 'function' && typeof getPremiumStatus === 'function') {
        const userId = await getUserId();
        if (userId) {
            const dbStatus = await getPremiumStatus(userId);
            if (dbStatus) {
                const currentPremium = GracelyState.get('isPremium');
                const currentExpiry = GracelyState.get('premiumExpiryDate');
                const currentPlanName = GracelyState.get('userPlanName');
                const currentPlanNumber = GracelyState.get('userPlanNumber');

                const newPremium = dbStatus.isPremium ? 'true' : 'false';
                const premiumChanged = newPremium !== currentPremium;
                const expiryChanged = newPremium === 'true' && dbStatus.premiumExpiryDate != currentExpiry;
                const nameChanged = dbStatus.planName != currentPlanName;
                const numberChanged = dbStatus.planNumber != currentPlanNumber;

                if (premiumChanged || expiryChanged || nameChanged || numberChanged) {
                    handleStatusUpdate(dbStatus);
                }
            }
        }
    }
}

// --- TURNSTILE VALIDATION BLOCKER ---
window.onTurnstileSuccess = function (token) {
    document.querySelectorAll('.cf-turnstile').forEach(el => {
        const form = el.closest('form');
        if (form) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }
    });
};

window.onTurnstileExpired = function () {
    window.onTurnstileError();
};

window.onTurnstileError = function () {
    const isLocal = window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    document.querySelectorAll('.cf-turnstile').forEach(el => {
        const form = el.closest('form');
        if (form) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                if (isLocal) {
                    console.warn('⚠️ Turnstile dev mode: submit button remains unlocked on localhost');
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                }
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Kunci tombol submit secara default saat DOM dimuat
    window.onTurnstileError();
    
    // Notification Modal Logic
    let currentNotification = 0;
    const notifications = document.querySelectorAll(".notificationModal");
  
    // Show the first notification
    if (notifications.length > 0) {
      showNotification(currentNotification);
    }
  
    function showNotification(index) {
      if (notifications[index]) {
        notifications[index].style.display = "flex"; // Show modal
      }
    }
  
    function closeNotification(index) {
      if (notifications[index]) {
        notifications[index].style.display = "none"; // Hide current modal
        currentNotification++;
  
        // Show the next notification
        if (notifications[currentNotification]) {
          showNotification(currentNotification);
        }
      }
    }
  
    // Expose the closeNotification function to the global scope
    window.closeNotification = closeNotification;
    
    // Panggil sinkronisasi navbar
    syncAuthState();
});

// --- FUNGSI NAV DINAMIS ---
function getInitials(name) {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getUserPlanBadgeHTML() {
  const isPremium = String(GracelyState.get('isPremium')) === 'true';
  const planName = GracelyState.get('userPlanName') || (isPremium ? 'Premium' : 'Free');
  
  if (!isPremium || planName.toLowerCase().includes('no premium') || planName.toLowerCase() === 'free') {
    return `<div class="gp-plan-badge is-free">Free</div>`;
  }

  const expiryDateStr = GracelyState.get('premiumExpiryDate');
  let daysLeftText = '';
  if (expiryDateStr) {
    const exp = new Date(expiryDateStr);
    const diff = exp.getTime() - new Date().getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    if (days > 0) {
      daysLeftText = ` · ${days} days left`;
    }
  }
  let badgeClass = 'is-premium';
  const lower = planName.toLowerCase();
  if (lower.includes('phantom')) badgeClass = 'is-phantom';
  else if (lower.includes('pro')) badgeClass = 'is-pro';

  return `<div class="gp-plan-badge ${badgeClass}">${planName}${daysLeftText}</div>`;
}

function syncAuthState() {
    const isAuth = GracelyState.get('isAuthenticated') === 'true';
    
    // Toggle Mobile UI
    const mobProfile = document.getElementById('mobile-user-profile');
    if (mobProfile) {
        mobProfile.classList.toggle('is-authenticated', isAuth);
        mobProfile.style.removeProperty('display');
    }
    
    const mobTitle = document.getElementById('mobile-account-title');
    if (mobTitle) {
        mobTitle.classList.toggle('is-authenticated', isAuth);
        mobTitle.style.removeProperty('display');
    }
    
    const mobLinks = document.getElementById('mobile-account-links');
    if (mobLinks) {
        mobLinks.classList.toggle('is-authenticated', isAuth);
        mobLinks.style.removeProperty('display');
    }
    
    const mobOut = document.getElementById('mobile-auth-logged-out');
    if (mobOut) {
        mobOut.classList.toggle('is-authenticated', isAuth);
        mobOut.style.removeProperty('display');
    }
    
    const mobIn = document.getElementById('mobile-auth-logged-in');
    if (mobIn) {
        mobIn.classList.toggle('is-authenticated', isAuth);
        mobIn.style.removeProperty('display');
    }

    // Toggle Desktop & Mobile Header Auth Buttons
    const deskLogin = document.getElementById('desktop-login-btn');
    const deskSignup = document.getElementById('desktop-signup-btn');
    const mobNavLogin = document.getElementById('mobile-nav-login-btn');
    const deskDropdown = document.getElementById('desktop-user-dropdown');

    if (isAuth) {
        if (deskLogin) {
            deskLogin.style.display = 'none';
            deskLogin.className = 'ud-main-btn gp-glassbtn d-none';
        }
        if (deskSignup) {
            deskSignup.style.display = 'none';
            deskSignup.className = 'gp-rimbtn d-none gp-cta';
        }
        if (mobNavLogin) {
            mobNavLogin.style.display = 'none';
            mobNavLogin.className = 'ud-main-btn ud-login-btn gp-glassbtn d-none';
        }
        if (deskDropdown) {
            deskDropdown.style.removeProperty('display');
            deskDropdown.className = 'nav-item dropdown d-inline-block gp-user';
            
            // Populate user data
            const userName = GracelyState.get('userName') || 'Member';
            const initials = getInitials(userName);
            const firstName = userName.split(/\s+/)[0];
            const badgeHTML = getUserPlanBadgeHTML();
            
            document.querySelectorAll('.sync-avatar').forEach(el => el.textContent = initials);
            document.querySelectorAll('.sync-firstname').forEach(el => el.textContent = firstName);
            document.querySelectorAll('.sync-fullname').forEach(el => el.textContent = userName);
            document.querySelectorAll('.gp-plan-badge-container').forEach(el => el.innerHTML = badgeHTML);
        }
    } else {
        if (deskLogin) {
            deskLogin.style.removeProperty('display');
            deskLogin.className = 'ud-main-btn gp-glassbtn d-none d-md-inline-block';
        }
        if (deskSignup) {
            deskSignup.style.removeProperty('display');
            deskSignup.className = 'gp-rimbtn d-none d-md-inline-flex gp-cta';
        }
        if (mobNavLogin) {
            mobNavLogin.style.removeProperty('display');
            mobNavLogin.className = 'ud-main-btn ud-login-btn gp-glassbtn d-md-none';
        }
        if (deskDropdown) {
            deskDropdown.style.display = 'none';
            deskDropdown.className = 'nav-item dropdown d-none gp-user';
        }
    }

    // Toggle Hero & Bottom CTA Buttons
    const heroBtn = document.getElementById('hero-cta-btn');
    if (heroBtn) {
        if (isAuth) {
            heroBtn.href = './dashboard.html';
            heroBtn.innerHTML = 'Dashboard';
        } else {
            heroBtn.href = './login.html';
            heroBtn.innerHTML = 'Get started <i class="fa-solid fa-arrow-right"></i>';
        }
    }

    const bottomBtn = document.getElementById('bottom-cta-btn');
    if (bottomBtn) {
        if (isAuth) {
            bottomBtn.href = './dashboard.html';
            bottomBtn.innerHTML = 'Dashboard';
        } else {
            bottomBtn.href = './index.html#pricing';
            bottomBtn.innerHTML = 'See pricing';
        }
    }
}

// --- Dashboard & Logs Synchronization ---

function formatExpiryDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    const options = { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    return date.toLocaleDateString('en-US', options).replace('GMT', 'UTC');
}

function calculateDaysLeft(dateString) {
    if (!dateString) return 0;
    const expiry = new Date(dateString);
    const today = new Date();
    if (isNaN(expiry) || expiry < today) return 0;
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

function formatAlertDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function renderTier(name, cssClass, expiryDateStr) {
    let upgradeLink = './premium.html';
    if (name === 'The Phantom') upgradeLink = './premium.html?plan=302';
    else if (name === 'Pro') upgradeLink = './premium.html?plan=301';
    else if (name === 'Premium') upgradeLink = './premium.html?plan=30';
    
    if (!expiryDateStr) {
        return `<li>
            <a class="gp-dash-tier is-inactive" href="${upgradeLink}">
              <span class="gp-plan-badge ${cssClass}">${name}</span>
              <span class="gp-dash-tier-days">Upgrade to unlock</span>
              <span class="gp-dash-tier-until"><i class="fa-solid fa-lock"></i></span>
            </a>
        </li>`;
    }

    const daysLeft = calculateDaysLeft(expiryDateStr);
    const formattedDate = formatExpiryDate(expiryDateStr);
    
    if (daysLeft > 0) {
        return `<li class="gp-dash-tier">
            <span class="gp-plan-badge ${cssClass}">${name}</span>
            <span class="gp-dash-tier-days">${daysLeft} days left</span>
            <span class="gp-dash-tier-until">Ends ${formattedDate}</span>
        </li>`;
    } else {
        return `<li>
            <a class="gp-dash-tier is-inactive" href="${upgradeLink}">
              <span class="gp-plan-badge ${cssClass}">${name}</span>
              <span class="gp-dash-tier-days">Upgrade to unlock</span>
              <span class="gp-dash-tier-until"><i class="fa-solid fa-lock"></i></span>
            </a>
        </li>`;
    }
}

async function loadDashboardData() {
    const greetingName = document.getElementById('gpGreetingName');
    const badgeImgContainer = document.getElementById('gpDashBadge');
    const planNameEl = document.getElementById('gpDashPlanName');
    const planDescEl = document.getElementById('gpDashPlanDesc');
    const tiersContainer = document.getElementById('gpDashTiers');
    const alertContainer = document.getElementById('gpDashAlertContainer');
    const actionBtnEl = document.getElementById('gpDashActionBtn');

    if (!greetingName || !tiersContainer) return; // Not on dashboard

    const userName = GracelyState.get('userName') || 'Member';
    const firstName = userName.split(/\s+/)[0];
    greetingName.textContent = firstName;

    try {
        const userId = typeof getUserId === 'function' ? await getUserId() : (window.getUserId ? await window.getUserId() : null);
        if (!userId) return;

        const { data: profileData, error } = await window.supabaseClient
            .from('profiles')
            .select('premiumExpiryDate, pro_expiry_date, phantom_expiry_date')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const premDate = profileData.premiumExpiryDate;
        const proDate = profileData.pro_expiry_date;
        const phanDate = profileData.phantom_expiry_date;

        const isPhantomActive = phanDate && calculateDaysLeft(phanDate) > 0;
        const isProActive = proDate && calculateDaysLeft(proDate) > 0;
        const isPremActive = premDate && calculateDaysLeft(premDate) > 0;
        const isUserPremium = isPhantomActive || isProActive || isPremActive;

        let activePlanName = 'No premium';
        let badgeClass = 'is-free';
        let badgeImg = '';

        if (isPhantomActive) {
            activePlanName = 'The Phantom';
            badgeClass = 'is-phantom';
            badgeImg = 'assets/images/badge/phantom.png?v=1';
        } else if (isProActive) {
            activePlanName = 'Pro';
            badgeClass = 'is-pro';
            badgeImg = 'assets/images/badge/pro.png?v=1';
        } else if (isPremActive) {
            activePlanName = 'Premium';
            badgeClass = 'is-premium';
            badgeImg = 'assets/images/badge/premium.png?v=1';
        }

        if (planNameEl) {
            planNameEl.textContent = activePlanName;
            planNameEl.className = `gp-dash-plan-name ${badgeClass}`;
        }

        if (badgeImgContainer) {
            badgeImgContainer.className = `gp-dash-badge ${badgeClass}`;
            if (badgeImg) {
                badgeImgContainer.innerHTML = `<img src="${badgeImg}" alt="${activePlanName}" class="gp-dash-badge-img" width="128" height="128">`;
            } else {
                badgeImgContainer.innerHTML = '';
            }
        }

        if (isUserPremium) {
            if (planDescEl) planDescEl.style.display = 'none';
            if (actionBtnEl) {
                actionBtnEl.innerHTML = '<i class="fa-solid fa-crown"></i> Extend premium';
                actionBtnEl.href = './premium.html';
            }
            if (alertContainer) alertContainer.innerHTML = '';
        } else {
            if (planDescEl) planDescEl.style.display = 'block';
            if (actionBtnEl) {
                actionBtnEl.innerHTML = '<i class="fa-solid fa-crown"></i> Upgrade premium';
                actionBtnEl.href = './premium.html';
            }

            // Check if user had previous expired subscriptions
            const dates = [phanDate, proDate, premDate].filter(Boolean).map(d => new Date(d).getTime()).filter(t => !isNaN(t));
            if (dates.length > 0) {
                const latestExpiredTimestamp = Math.max(...dates);
                const expiredFormatted = formatAlertDate(new Date(latestExpiredTimestamp));
                if (alertContainer) {
                    alertContainer.innerHTML = `
                        <div class="gp-alert gp-alert-danger" role="alert">
                          <i class="fa-solid fa-bell" aria-hidden="true"></i>
                          <div class="gp-alert-text">Your Premium <b>expired on ${expiredFormatted}</b>. Renew it to regain access to Premium features.</div>
                          <a href="./premium.html" class="ud-main-btn gp-alert-btn">Renew premium</a>
                        </div>
                    `;
                }
            } else {
                if (alertContainer) {
                    alertContainer.innerHTML = `
                        <div class="gp-alert gp-alert-warning" role="alert">
                          <i class="fa-solid fa-crown" aria-hidden="true"></i>
                          <div class="gp-alert-text">Your account does not have an active Premium plan. Upgrade now to access all Gracely features.</div>
                          <a href="./premium.html" class="ud-main-btn gp-alert-btn">Upgrade premium</a>
                        </div>
                    `;
                }
            }
        }

        const premiumHtml = renderTier('Premium', 'is-premium', premDate);
        const proHtml = renderTier('Pro', 'is-pro', proDate);
        const phantomHtml = renderTier('The Phantom', 'is-phantom', phanDate);

        tiersContainer.innerHTML = premiumHtml + proHtml + phantomHtml;
    } catch (e) {
        console.error('Error loading dashboard data:', e);
        tiersContainer.innerHTML = '<li class="gp-dash-tier"><span class="gp-dash-tier-days">Error loading plans.</span></li>';
    }
}

// =========================================================
// Activity Logs Engine: Filter, Search, Pagination, IP Badges & Device Parsing
// =========================================================
let activityLogsState = {
    allLogs: [],
    filteredLogs: [],
    currentFilter: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
    currentIp: null
};

function parseDeviceAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
        return {
            browserIcon: '<i class="fa-solid fa-globe"></i>',
            browserName: 'Web Browser',
            osIcon: '<i class="fa-solid fa-laptop"></i>',
            osName: 'Device'
        };
    }

    let bIcon = '<i class="fa-solid fa-globe"></i>';
    let bName = 'Browser';
    let osIcon = '<i class="fa-solid fa-laptop"></i>';
    let osName = 'Device';

    // 1. Browser Detection
    if (/OPR\/(\d+)|Opera\/(\d+)/i.test(userAgent)) {
        const m = userAgent.match(/OPR\/(\d+[\.\d]*)|Opera\/(\d+[\.\d]*)/i);
        const ver = (m && (m[1] || m[2])) ? (m[1] || m[2]).split('.')[0] + '.0' : '';
        bIcon = '<i class="fa-brands fa-opera"></i>';
        bName = `Opera ${ver}`.trim();
    } else if (/Edg\/(\d+)/i.test(userAgent)) {
        const m = userAgent.match(/Edg\/(\d+[\.\d]*)/i);
        const ver = m ? m[1].split('.')[0] + '.0' : '';
        bIcon = '<i class="fa-brands fa-edge"></i>';
        bName = `Edge ${ver}`.trim();
    } else if (/Brave/i.test(userAgent)) {
        bIcon = '<i class="fa-brands fa-brave"></i>';
        bName = 'Brave';
    } else if (/Chrome\/(\d+)/i.test(userAgent)) {
        const m = userAgent.match(/Chrome\/(\d+[\.\d]*)/i);
        const ver = m ? m[1].split('.')[0] + '.0' : '';
        bIcon = '<i class="fa-brands fa-chrome"></i>';
        bName = `Chrome ${ver}`.trim();
    } else if (/Firefox\/(\d+)/i.test(userAgent)) {
        const m = userAgent.match(/Firefox\/(\d+[\.\d]*)/i);
        const ver = m ? m[1].split('.')[0] + '.0' : '';
        bIcon = '<i class="fa-brands fa-firefox-browser"></i>';
        bName = `Firefox ${ver}`.trim();
    } else if (/Safari\/(\d+)/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        const m = userAgent.match(/Version\/(\d+[\.\d]*)/i);
        const ver = m ? m[1].split('.')[0] + '.0' : '';
        bIcon = '<i class="fa-brands fa-safari"></i>';
        bName = `Safari ${ver}`.trim();
    }

    // 2. OS Detection
    if (/Windows NT/i.test(userAgent) || /Windows/i.test(userAgent)) {
        osIcon = '<i class="fa-brands fa-windows"></i>';
        osName = 'Windows';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        osIcon = '<i class="fa-brands fa-apple"></i>';
        osName = 'iOS';
    } else if (/Mac OS X|Macintosh/i.test(userAgent)) {
        osIcon = '<i class="fa-brands fa-apple"></i>';
        osName = 'macOS';
    } else if (/Android/i.test(userAgent)) {
        osIcon = '<i class="fa-brands fa-android"></i>';
        osName = 'Android';
    } else if (/Linux/i.test(userAgent)) {
        osIcon = '<i class="fa-brands fa-linux"></i>';
        osName = 'Linux';
    }

    return { browserIcon: bIcon, browserName: bName, osIcon, osName };
}

function formatLogDateTime(isoDateStr) {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return { date: 'Unknown', time: '' };
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour12: false });
    return { date: dateStr, time: timeStr };
}

function getActivityIconHtml(logAct) {
    if (!logAct || typeof logAct !== 'string') {
        return '<span class="gp-hl-act"><i class="fa-solid fa-clock-rotate-left"></i></span>';
    }
    const actLower = logAct.toLowerCase();

    // 1. Auth Events
    if (actLower.includes('login') || actLower.includes('logged in') || actLower.includes('sign in')) {
        return '<span class="gp-hl-act gp-hl-act-login"><i class="fa-solid fa-right-to-bracket"></i></span>';
    }
    if (actLower.includes('logout') || actLower.includes('logged out') || actLower.includes('sign out')) {
        return '<span class="gp-hl-act" style="background:#fee2e2; color:#dc2626;"><i class="fa-solid fa-arrow-right-from-bracket"></i></span>';
    }

    // 2. Service Access
    if (actLower.includes('accessing') || actLower.includes('service') || actLower.includes('inject')) {
        // A. Education & Academic
        if (
            actLower.includes('academia') ||
            actLower.includes('scribd') ||
            actLower.includes('coursera') ||
            actLower.includes('udemy') ||
            actLower.includes('turnitin') ||
            actLower.includes('studocu') ||
            actLower.includes('course hero') ||
            actLower.includes('quizlet') ||
            actLower.includes('datacamp') ||
            actLower.includes('codecademy') ||
            actLower.includes('scispace') ||
            actLower.includes('everand') ||
            actLower.includes('masterclass') ||
            actLower.includes('cramly') ||
            actLower.includes('mimo')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-graduation-cap"></i></span>';
        }

        // B. Streaming & Video / Entertainment
        if (
            actLower.includes('netflix') ||
            actLower.includes('hbo') ||
            actLower.includes('disney') ||
            actLower.includes('viu') ||
            actLower.includes('wetv') ||
            actLower.includes('youtube') ||
            actLower.includes('iqiyi') ||
            actLower.includes('crunchyroll') ||
            actLower.includes('vidio') ||
            actLower.includes('bein') ||
            actLower.includes('bstation') ||
            actLower.includes('alight motion') ||
            actLower.includes('capcut')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-film"></i></span>';
        }

        // C. Design & Creative
        if (
            actLower.includes('canva') ||
            actLower.includes('freepik') ||
            actLower.includes('flaticon') ||
            actLower.includes('envato') ||
            actLower.includes('motion array') ||
            actLower.includes('rawpixel') ||
            actLower.includes('coohom') ||
            actLower.includes('iloveimg') ||
            actLower.includes('vectorizer')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-palette"></i></span>';
        }

        // D. AI & Writing / PDF
        if (
            actLower.includes('chatgpt') ||
            actLower.includes('claude') ||
            actLower.includes('perplexity') ||
            actLower.includes('deepl') ||
            actLower.includes('jasper') ||
            actLower.includes('jenni') ||
            actLower.includes('merlin') ||
            actLower.includes('sider') ||
            actLower.includes('notion') ||
            actLower.includes('notegpt') ||
            actLower.includes('blackbox') ||
            actLower.includes('ilovepdf') ||
            actLower.includes('pdf')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-robot"></i></span>';
        }

        // E. Music & Audio
        if (
            actLower.includes('spotify') ||
            actLower.includes('epidemic') ||
            actLower.includes('sound')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-music"></i></span>';
        }

        // F. Finance & News
        if (
            actLower.includes('investing') ||
            actLower.includes('wall street') ||
            actLower.includes('wsj')
        ) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-chart-line"></i></span>';
        }

        // G. Discord
        if (actLower.includes('discord')) {
            return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-brands fa-discord"></i></span>';
        }

        // Fallback Access Key Icon
        return '<span class="gp-hl-act gp-hl-act-access"><i class="fa-solid fa-key"></i></span>';
    }

    // Default Event
    return '<span class="gp-hl-act"><i class="fa-solid fa-clock-rotate-left"></i></span>';
}

function applyActivityLogsFilter() {
    let filtered = activityLogsState.allLogs;

    // 1. Category Filter
    if (activityLogsState.currentFilter === 'login') {
        filtered = filtered.filter(l => {
            const act = (l.activity || '').toLowerCase();
            return act.includes('login') || act.includes('logged in') || act.includes('sign in');
        });
    } else if (activityLogsState.currentFilter === 'access') {
        filtered = filtered.filter(l => {
            const act = (l.activity || '').toLowerCase();
            return act.includes('accessing') || act.includes('service');
        });
    } else if (activityLogsState.currentFilter === 'other') {
        filtered = filtered.filter(l => {
            const act = (l.activity || '').toLowerCase();
            const isLogin = act.includes('login') || act.includes('logged in') || act.includes('sign in');
            const isAccess = act.includes('accessing') || act.includes('service');
            return !isLogin && !isAccess;
        });
    }

    // 2. Search Query Filter
    if (activityLogsState.searchQuery) {
        const q = activityLogsState.searchQuery.toLowerCase();
        filtered = filtered.filter(l => {
            const act = (l.activity || '').toLowerCase();
            const ip = (l.ip_address || '').toLowerCase();
            const dev = (l.device || '').toLowerCase();
            return act.includes(q) || ip.includes(q) || dev.includes(q);
        });
    }

    activityLogsState.filteredLogs = filtered;
    activityLogsState.currentPage = 1;
    renderActivityLogsTable();
}

function renderActivityLogsTable() {
    const tableBody = document.getElementById('logs-table-body');
    const paginationEl = document.getElementById('logs-pagination');
    const subtitle = document.getElementById('logs-subtitle');
    if (!tableBody) return;

    const total = activityLogsState.filteredLogs.length;
    const page = activityLogsState.currentPage;
    const pageSize = activityLogsState.pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;

    // Update Subtitle / Count
    if (subtitle) {
        if (total === 0) {
            subtitle.textContent = 'No matching activities found.';
        } else {
            const startIdx = (page - 1) * pageSize + 1;
            const endIdx = Math.min(page * pageSize, total);
            subtitle.textContent = `Showing activities ${startIdx} - ${endIdx} of ${total} (last 7 days)`;
        }
    }

    // Slice current page items
    const start = (page - 1) * pageSize;
    const currentItems = activityLogsState.filteredLogs.slice(start, start + pageSize);

    // Clear initial spinner and previous rows
    tableBody.innerHTML = '';

    if (currentItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5">
                    <div class="gp-hl-empty">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <p>No activity logs found.</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        currentItems.forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'gp-hl-row-access';

            const { date, time } = formatLogDateTime(log.created_at);
            const dev = parseDeviceAgent(log.device);
            const logAct = log.activity || 'Activity';

            // Smart Dynamic Activity badge icon
            const actIconHtml = getActivityIconHtml(logAct);

            // IP Address badge
            const logIp = log.ip_address || 'Unknown';
            let ipBadgeHtml = '';
            if (activityLogsState.currentIp && logIp !== 'Unknown') {
                if (logIp === activityLogsState.currentIp) {
                    ipBadgeHtml = `<span class="gp-hl-ip gp-hl-ip-me">This IP</span>`;
                } else {
                    ipBadgeHtml = `<span class="gp-hl-ip gp-hl-ip-other">Different IP</span>`;
                }
            }

            tr.innerHTML = `
                <td data-label="Date &amp; Time"><span class="gp-hl-dt"><span class="gp-hl-date">${date}</span><small>${time}</small></span></td>
                <td data-label="Activity">${actIconHtml} ${logAct}</td>
                <td data-label="IP Address"><span class="gp-hl-mono">${logIp}</span> ${ipBadgeHtml}</td>
                <td data-label="Device"><span class="gp-hl-device">${dev.browserIcon} ${dev.browserName} <span class="gp-hl-dot">·</span> ${dev.osIcon} ${dev.osName}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Render Pagination
    if (paginationEl) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        let pagesHtml = '';

        // First & Prev
        const isFirstDisabled = page === 1;
        pagesHtml += `<li class="page-item ${isFirstDisabled ? 'disabled' : ''}"><a class="page-link" href="#" data-page="1" aria-label="First"><i class="fas fa-angle-double-left"></i></a></li>`;
        pagesHtml += `<li class="page-item ${isFirstDisabled ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous"><i class="fas fa-angle-left"></i></a></li>`;

        // Numbered Pages (max 5 buttons around current page)
        let startP = Math.max(1, page - 2);
        let endP = Math.min(totalPages, startP + 4);
        if (endP - startP < 4) {
            startP = Math.max(1, endP - 4);
        }

        for (let p = startP; p <= endP; p++) {
            const activeClass = p === page ? 'active' : '';
            pagesHtml += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
        }

        // Next & Last
        const isLastDisabled = page === totalPages;
        pagesHtml += `<li class="page-item ${isLastDisabled ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}" aria-label="Next"><i class="fas fa-angle-right"></i></a></li>`;
        pagesHtml += `<li class="page-item ${isLastDisabled ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${totalPages}" aria-label="Last"><i class="fas fa-angle-double-right"></i></a></li>`;

        paginationEl.innerHTML = pagesHtml;

        // Attach click listeners to pagination links
        paginationEl.querySelectorAll('a.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = parseInt(link.getAttribute('data-page'), 10);
                if (targetPage && targetPage >= 1 && targetPage <= totalPages && targetPage !== activityLogsState.currentPage) {
                    activityLogsState.currentPage = targetPage;
                    renderActivityLogsTable();
                    const card = document.querySelector('.gp-hl-card');
                    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

async function loadActivityLogs() {
    const tableBody = document.getElementById('logs-table-body');
    const subtitle = document.getElementById('logs-subtitle');
    if (!tableBody) return; // Not on logs page

    try {
        const userId = typeof getUserId === 'function' ? await getUserId() : (window.getUserId ? await window.getUserId() : null);
        if (!userId) return;

        // Fetch current visitor IP for badge comparison
        if (typeof getClientIp === 'function') {
            try {
                activityLogsState.currentIp = await getClientIp();
            } catch(e) {}
        }

        const { data: logs, error } = await window.supabaseClient
            .from('activity_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;

        activityLogsState.allLogs = logs || [];

        // Calculate Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let loginsToday = 0;
        let servicesToday = 0;
        let ipsToday = new Set();
        let lastLogin = null;

        activityLogsState.allLogs.forEach(log => {
            const logDate = new Date(log.created_at);
            const isToday = logDate >= today;
            const actLower = (log.activity || '').toLowerCase();

            if (isToday) {
                if (actLower.includes('login') || actLower.includes('logged in') || actLower.includes('sign in')) {
                    loginsToday++;
                }
                if (actLower.includes('accessing') || actLower.includes('service')) {
                    servicesToday++;
                }
                if (log.ip_address) {
                    ipsToday.add(log.ip_address);
                }
            }

            if (!lastLogin && (actLower.includes('login') || actLower.includes('logged in') || actLower.includes('sign in'))) {
                lastLogin = logDate;
            }
        });

        const statLogins = document.getElementById('stat-logins-today');
        const statIps = document.getElementById('stat-unique-ips');
        const statServices = document.getElementById('stat-services');
        const statLastLogin = document.getElementById('stat-last-login');

        if (statLogins) statLogins.textContent = loginsToday;
        if (statIps) statIps.textContent = ipsToday.size;
        if (statServices) statServices.textContent = servicesToday;
        if (statLastLogin) {
            if (lastLogin) {
                const { date, time } = formatLogDateTime(lastLogin);
                statLastLogin.textContent = `${date} ${time.substring(0, 5)}`;
            } else {
                statLastLogin.textContent = 'Never';
            }
        }

        // Setup filter tabs event listeners
        const filterTabs = document.querySelectorAll('#logs-filter-tabs .lp-chip');
        filterTabs.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                filterTabs.forEach(c => c.classList.remove('is-active'));
                chip.classList.add('is-active');
                activityLogsState.currentFilter = chip.getAttribute('data-type') || 'all';
                applyActivityLogsFilter();
            });
        });

        // Setup search input event listener
        const searchInput = document.getElementById('logs-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                activityLogsState.searchQuery = e.target.value.trim();
                applyActivityLogsFilter();
            });
        }

        // Initial filter & render
        applyActivityLogsFilter();

    } catch (e) {
        console.error('Error loading activity logs:', e);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Failed to load logs.</td></tr>';
    }
}

// --- Supabase Announcement Bar Integration ---
async function loadAnnouncementBar() {
    try {
        const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
        if (!client) return;

        const { data, error } = await client
            .from('links_update')
            .select('html_content, is_enabled')
            .eq('page_name', 'announcement_bar')
            .maybeSingle();

        if (error) {
            console.warn('[Announcement] Fetch error:', error);
            return;
        }

        let announceBar = document.getElementById('gpAnnounce');

        if (data && data.is_enabled === true && data.html_content) {
            const rawContent = data.html_content.trim();
            if (!rawContent) {
                if (announceBar) announceBar.remove();
                return;
            }

            // Jika belum ada di DOM, buat container dan pasang di paling atas body
            if (!announceBar) {
                announceBar = document.createElement('div');
                announceBar.id = 'gpAnnounce';
                announceBar.className = 'announcement-bar gp-announce';
                document.body.prepend(announceBar);
            }

            announceBar.style.removeProperty('display');

            // Parse konten untuk menentukan formatnya
            const temp = document.createElement('div');
            temp.innerHTML = rawContent;

            // Jika konten memasukkan wrapper lengkap <div class="announcement-bar..." id="gpAnnounce">
            const outerDiv = temp.querySelector('#gpAnnounce') || temp.querySelector('.announcement-bar');
            if (outerDiv) {
                announceBar.innerHTML = outerDiv.innerHTML;
            } else {
                // Jika konten memasukkan <div class="gp-announce-inner"> atau teks HTML kustom
                const innerDiv = temp.querySelector('.gp-announce-inner');
                if (innerDiv) {
                    announceBar.innerHTML = innerDiv.outerHTML;
                } else {
                    // Bungkus teks/HTML kustom ke dalam struktur standar Gracely
                    announceBar.innerHTML = `
                        <div class="gp-announce-inner">
                            <span class="gp-announce-icon"><i class="fa-solid fa-bullhorn"></i></span>
                            <div class="gp-announce-text">${rawContent}</div>
                        </div>
                    `;
                }
            }
        } else {
            // Jika is_enabled FALSE atau tidak aktif, hapus elemen dari DOM untuk mencegah flicker
            if (announceBar) {
                announceBar.remove();
            }
        }
    } catch (e) {
        console.warn('[Announcement] Error loading announcement bar:', e);
    }
}

// ==========================================
// Gracely Multi-Language Engine (I18n)
// ==========================================
const GracelyI18n = {
    languages: {
        'en': { code: 'en', gtCode: 'en', flag: 'us', name: 'English' },
        'id': { code: 'id', gtCode: 'id', flag: 'id', name: 'Indonesia' },
        'my': { code: 'my', gtCode: 'ms', flag: 'my', name: 'Melayu' },
        'ph': { code: 'ph', gtCode: 'tl', flag: 'ph', name: 'Filipino' },
        'vn': { code: 'vn', gtCode: 'vi', flag: 'vn', name: 'Tiếng Việt' },
        'th': { code: 'th', gtCode: 'th', flag: 'th', name: 'ไทย' },
        'cn': { code: 'cn', gtCode: 'zh-CN', flag: 'cn', name: '中文' },
        'jp': { code: 'jp', gtCode: 'ja', flag: 'jp', name: '日本語' },
        'kr': { code: 'kr', gtCode: 'ko', flag: 'kr', name: '한국어' }
    },

    clearGoogleTranslateCookies() {
        const host = window.location.hostname;
        const domains = ['', host];
        if (host) {
            domains.push('.' + host);
            const parts = host.split('.');
            if (parts.length > 2) {
                domains.push('.' + parts.slice(1).join('.'));
                domains.push(parts.slice(1).join('.'));
            }
        }

        const cookieNames = ['googtrans', 'googtrans_saved'];
        cookieNames.forEach(cName => {
            domains.forEach(d => {
                const domainAttr = d ? `; domain=${d}` : '';
                document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainAttr}`;
                document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=;${domainAttr}`;
                document.cookie = `${cName}=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainAttr}`;
            });
        });
    },

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    },

    setCookie(name, value, days = 30) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
        if (window.location.hostname && !window.location.hostname.includes('localhost')) {
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
        }
    },

    getCurrentLang() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.languages[urlLang.toLowerCase()]) {
            return urlLang.toLowerCase();
        }
        const stored = localStorage.getItem('gracely_lang');
        if (stored && this.languages[stored]) {
            return stored;
        }
        const cookieLang = this.getCookie('gracely_lang');
        if (cookieLang && this.languages[cookieLang]) {
            return cookieLang;
        }
        return 'en';
    },

    updateUI(langCode) {
        const langInfo = this.languages[langCode] || this.languages['en'];
        
        // 1. Update flag icon in desktop navbar button
        document.querySelectorAll('.gp-lang-toggle .flag-icon').forEach(el => {
            el.className = `flag-icon flag-icon-${langInfo.flag}`;
        });

        // 2. Update active class in dropdowns
        document.querySelectorAll('.gp-dropdown a[href*="lang="], .gp-dropdown a[data-lang]').forEach(a => {
            const code = a.getAttribute('data-lang') || (a.getAttribute('href') || '').split('=')[1];
            a.classList.toggle('active', code === langCode);
        });

        // 3. Update active class in drawer mobile
        document.querySelectorAll('.gp-drawer-langs a[href*="lang="], .gp-drawer-langs a[data-lang]').forEach(a => {
            const code = a.getAttribute('data-lang') || (a.getAttribute('href') || '').split('=')[1];
            a.classList.toggle('active', code === langCode);
        });
    },

    setLanguage(langCode, trigger = true) {
        const langInfo = this.languages[langCode] || this.languages['en'];
        localStorage.setItem('gracely_lang', langCode);
        this.setCookie('gracely_lang', langCode);
        
        if (langCode === 'en') {
            this.clearGoogleTranslateCookies();
            this.updateUI('en');

            if (trigger) {
                const cleanUrl = window.location.pathname + (window.location.hash || '');
                window.location.href = cleanUrl;
            }
            return;
        }

        // For non-English languages
        this.setCookie('googtrans', `/en/${langInfo.gtCode}`);
        this.updateUI(langCode);

        if (trigger) {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.value = langInfo.gtCode;
                combo.dispatchEvent(new Event('change'));
            } else {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    const c = document.querySelector('.goog-te-combo');
                    if (c) {
                        clearInterval(interval);
                        c.value = langInfo.gtCode;
                        c.dispatchEvent(new Event('change'));
                    } else if (attempts > 30) {
                        clearInterval(interval);
                    }
                }, 100);
            }
        }
    },

    initGoogleTranslate() {
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,id,ms,tl,vi,th,zh-CN,ja,ko',
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };

        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }
    },

    init() {
        const currentLang = this.getCurrentLang();
        this.updateUI(currentLang);
        
        const langInfo = this.languages[currentLang] || this.languages['en'];
        if (currentLang === 'en') {
            this.clearGoogleTranslateCookies();
            if (window.location.search.includes('lang=en')) {
                const cleanUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        } else {
            this.setCookie('googtrans', `/en/${langInfo.gtCode}`);
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                const c = document.querySelector('.goog-te-combo');
                if (c) {
                    clearInterval(interval);
                    if (c.value !== langInfo.gtCode) {
                        c.value = langInfo.gtCode;
                        c.dispatchEvent(new Event('change'));
                    }
                } else if (attempts > 40) {
                    clearInterval(interval);
                }
            }, 100);
        }

        this.initGoogleTranslate();

        // Listen for all language clicks
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href*="lang="], a[data-lang]');
            if (a) {
                e.preventDefault();
                let code = a.getAttribute('data-lang');
                if (!code) {
                    const match = (a.getAttribute('href') || '').match(/lang=([a-zA-Z\-]+)/);
                    if (match) code = match[1];
                }
                if (code && this.languages[code.toLowerCase()]) {
                    this.setLanguage(code.toLowerCase(), true);
                }
            }
        });
    }
};

// --- CLEAN URL ENGINE (WEB HTTP/HTTPS ONLY) ---
function initializeCleanUrls() {
    if (!window.location.protocol.startsWith('http')) return;
    try {
        // 1. Normalize current address bar if needed
        const pathname = window.location.pathname;
        if (pathname.endsWith('/index.html') || pathname === '/index.html' || pathname === '/index') {
            const cleanPath = pathname.replace(/\/index(\.html)?$/, '') || '/';
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        } else if (pathname.endsWith('.html')) {
            const cleanPath = pathname.replace(/\.html$/, '');
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        }

        // 2. Transform relative internal links to clean URLs on DOM
        const links = document.querySelectorAll('a[href]');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (
                !href.startsWith('http://') &&
                !href.startsWith('https://') &&
                !href.startsWith('//') &&
                !href.startsWith('mailto:') &&
                !href.startsWith('tel:') &&
                !href.startsWith('javascript:') &&
                !href.startsWith('#') &&
                href.includes('.html')
            ) {
                let newHref = href;
                if (newHref === './index.html' || newHref === 'index.html' || newHref === '/index.html') {
                    newHref = newHref.startsWith('/') ? '/' : './';
                } else if (newHref.startsWith('./index.html#') || newHref.startsWith('index.html#') || newHref.startsWith('/index.html#')) {
                    newHref = newHref.replace(/^(\.\/|\/)?index\.html/, './');
                } else {
                    newHref = newHref.replace(/\.html(?=($|[?#]))/, '');
                }
                a.setAttribute('href', newHref);
            }
        });
    } catch (e) {
        console.warn('Clean URL initialization error:', e);
    }
}

function handleDataRefresh() {
    syncAuthState();
    loadAnnouncementBar();
    loadDashboardData();
    loadActivityLogs();
}

document.addEventListener('gracelyAuthStateChanged', handleDataRefresh);
document.addEventListener('gracelyPlanRefresh', handleDataRefresh);

document.addEventListener('DOMContentLoaded', () => {
    // 0. Initialize clean URLs for web domain
    initializeCleanUrls();

    // 1. Initialize core scripts, forms, video modals, scroll
    initializeScripts();

    // 2. Synchronize navbar authentication state & announcement bar
    syncAuthState();
    loadAnnouncementBar();

    // 3. Initialize Multi-Language Engine
    GracelyI18n.init();

    // 4. Lock turnstile buttons until challenge is completed
    window.onTurnstileError();

    // 5. Load dynamic dashboard & activity data
    setTimeout(() => {
        loadDashboardData();
        loadActivityLogs();
    }, 150);
});




