// --- SECURE STATE HELPER ---
window.GracelyState = {
    _key: '_gx_state',
    _getAll: function() {
        try {
            const raw = localStorage.getItem(this._key);
            if (!raw) return {};
            return JSON.parse(decodeURIComponent(escape(atob(raw))));
        } catch (e) {
            return {};
        }
    },
    _saveAll: function(data) {
        try {
            localStorage.setItem(this._key, btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
        } catch (e) {
            console.warn('GracelyState Error:', e);
        }
    },
    get: function(key) {
        return this._getAll()[key];
    },
    set: function(key, value) {
        const data = this._getAll();
        data[key] = value;
        this._saveAll(data);
    },
    remove: function(key) {
        const data = this._getAll();
        delete data[key];
        this._saveAll(data);
    },
    clear: function() {
        localStorage.removeItem(this._key);
    }
};

// --- MIGRATION SCRIPT ---
// Pindahkan data lama yang terekspos ke state yang aman, lalu hapus dari root local storage
(function migrateOldState() {
    try {
        const oldKeys = [
            'isAuthenticated', 'userEmail', 'userName', 'isPremium',
            'userPlanName', 'userPlanNumber', 'premiumExpiryDate',
            'proExpiryDate', 'phantomExpiryDate', 'lastPopupDateDB',
            'lastExpiryWarningDateDB', 'gracely_db_session_id',
            'gracelyPremiumConfig', 'gracely_active_session_token',
            'gracely_config_url', 'notificationLastShown', 'notificationLastShownId'
        ];
        oldKeys.forEach(k => {
            const val = localStorage.getItem(k);
            if (val !== null) {
                window.GracelyState.set(k, val);
                localStorage.removeItem(k);
            }
        });
    } catch(e) {
        console.warn('Migrasi state gagal, dilewati:', e);
    }
})();
// --- END MIGRATION SCRIPT ---
// --- END SECURE STATE HELPER ---

// --- CLEAN URL INSTANT NORMALIZER (WEB HTTP/HTTPS ONLY) ---
(function initCleanUrlHead() {
    try {
        if (!window.location.protocol.startsWith('http')) return;
        const pathname = window.location.pathname;
        if (pathname.endsWith('/index.html') || pathname === '/index.html' || pathname === '/index') {
            const cleanPath = pathname.replace(/\/index(\.html)?$/, '') || '/';
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        } else if (pathname.endsWith('.html')) {
            const cleanPath = pathname.replace(/\.html$/, '');
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        }
    } catch (e) { /* Silent fail */ }
})();
// --- END CLEAN URL HEAD ---
// DOMAIN CHECK DISABLED FOR LOCAL DEV
// (function () {
//     var a = ["draft.gracely.my.id", "localhost", "127.0.0.1"],
//         h = window.location.hostname,
//         p = window.location.pathname,
//         o = !1;
//     for (var i = 0; i < a.length; i++)
//         if (h === a[i]) {
//             o = !0;
//             break
//         }

//     o || (window.location.href = "https://draft.gracely.my.id/")
// })();

// --- AGGRESSIVE CLEANUP START ---
(function cleanupLegacy() {
    try {
        // 1. Force delete the old cookie path
        document.cookie = "gracely_session_token=; Max-Age=-99999999; path=/hai/; SameSite=Lax; Secure";

        // 2. Remove legacy Local Storage
        // NOTE: DO NOT remove 'gracely_db_session_id', it is needed for script.js session safety check!
        const keysToRemove = [
            'gracely_config_url',
            'gracelyPremiumConfig',
            'gracely_active_session_token'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) { /* Silent error handling */ }
})();
// --- AGGRESSIVE CLEANUP END ---

// --- DEVICE FINGERPRINTING HELPER (formerly fingerprint.js) ---
// Generates unique fingerprint untuk bind session ke device
// NOTE: Logic disamakan dengan Extension (Service Worker) supaya hash MATCH
async function getDeviceFingerprint() {
    try {
        // Collect device-specific attributes
        // HARUS SAMA PERSIS dengan Extension (background.js environment)
        // Tidak boleh pakai screen.* atau canvas karena Extension tidak bisa akses
        const components = [
            navigator.userAgent || '',
            navigator.language || '',
            new Date().getTimezoneOffset().toString()
        ];

        // Combine semua komponen
        const fingerprint = components.join('|||');

        // Hash dengan SHA-256
        const msgBuffer = new TextEncoder().encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // console.log('Device fingerprint generated:', hashHex);
        return hashHex;
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        return await getFallbackFingerprint();
    }
}

async function getFallbackFingerprint() {
    // Simplified fingerprint untuk fallback
    // HARUS SAMA PERSIS dengan Extension
    const simple = [
        navigator.userAgent,
        new Date().getTimezoneOffset().toString(),
        navigator.language
    ].join('|||');

    const msgBuffer = new TextEncoder().encode(simple);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    console.warn('Using fallback fingerprint');
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// --- END DEVICE FINGERPRINTING HELPER ---

var SUPABASE_URL = 'https://mujasmmlozswplmtkijr.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11amFzbW1sb3pzd3BsbXRraWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDM4ODgsImV4cCI6MjA3NzI3OTg4OH0.tttyPcoVUtyPLfBm1irS2qYthzt84Yb0OhjxD-tZ4Nw';
var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SESSION RECOVERY (SYNC EXTENSION -> WEBSITE) ---
(async function syncSessionFromCookies() {
    try {
        const getCookie = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        };

        const cookieAccessToken = getCookie('gracely_session_token');
        const cookieRefreshToken = getCookie('gracely_refresh_token');

        if (cookieAccessToken && cookieRefreshToken) {
            const { data: { session } } = await supabaseClient.auth.getSession();

            // If Supabase has no session OR has a different access token, adopt the cookie's session
            if (!session || session.access_token !== cookieAccessToken) {
                console.log("Syncing session from Extension cookies...");
                const { error } = await supabaseClient.auth.setSession({
                    access_token: cookieAccessToken,
                    refresh_token: cookieRefreshToken
                });
                if (error) {
                    console.warn("Failed to sync session from cookies:", error);
                    // If syncing fails (e.g., token invalid), allow normal flow or logout
                } else {
                    console.log("Session synchronized successfully.");
                }
            }
        }
    } catch (e) {
        console.warn("Session sync error:", e);
    }
})();
// --- SESSION RECOVERY END ---

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Strict Path enforcement
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax; Secure';
    document.cookie = name + '=; Max-Age=-99999999; path=/hai/; SameSite=Lax; Secure'; // Explicit clearing for safety
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
            setCookie('gracely_session_token', session.access_token, 30);
            if (session.refresh_token) {
                setCookie('gracely_refresh_token', session.refresh_token, 30);
            }
        }
    } else if (event === 'SIGNED_OUT') {
        eraseCookie('gracely_session_token');
        eraseCookie('gracely_refresh_token');
    }
});

async function getUserId() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user ? user.id : null;
}

async function getPremiumStatus(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select(`
                premiumExpiryDate,
                pro_expiry_date,
                phantom_expiry_date,
                plan_gracely (
                    name_plan,
                    number_plan
                )
            `)
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        const plan = data.plan_gracely || { name_plan: 'No Premium', number_plan: '001' };

        // Check validity for ALL plans
        const today = new Date();
        const premiumDate = data.premiumExpiryDate ? new Date(data.premiumExpiryDate) : null;
        const proDate = data.pro_expiry_date ? new Date(data.pro_expiry_date) : null;
        const phantomDate = data.phantom_expiry_date ? new Date(data.phantom_expiry_date) : null;

        const isPremiumValid = premiumDate && today <= premiumDate;
        const isProValid = proDate && today <= proDate;
        const isPhantomValid = phantomDate && today <= phantomDate;

        // Determine Effective Plan based on Hierarchy: Phantom > Pro > Premium
        let finalPlanName = 'No Premium';
        let finalPlanNumber = '001';

        if (isPhantomValid) {
            finalPlanName = 'The Phantom';
            finalPlanNumber = '004';
        } else if (isProValid) {
            finalPlanName = 'Pro';
            finalPlanNumber = '003';
        } else if (isPremiumValid) {
            finalPlanName = 'Premium';
            finalPlanNumber = '002';
        }

        // isPremium is TRUE if ANY plan is valid
        const isPremium = (isPremiumValid || isProValid || isPhantomValid);

        return {
            isPremium: isPremium,
            premiumExpiryDate: data.premiumExpiryDate,
            proExpiryDate: data.pro_expiry_date,
            phantomExpiryDate: data.phantom_expiry_date,
            planName: finalPlanName,
            planNumber: finalPlanNumber
        };
    } catch (e) {
        console.error("Error fetching premium status:", e);
        return null;
    }
}

async function getClientIp() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

// --- ADVANCED DETECTION HELPERS ---
async function detectIncognito() {
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const { quota } = await navigator.storage.estimate();
            if (quota < 120000000) return true; // Incognito biasanya punya quota storage sangat kecil
        }
        return false;
    } catch (e) { return false; }
}

function getDetailedBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let version = "Unknown";

    if (ua.indexOf("Firefox") > -1) {
        browser = "Mozilla Firefox";
        version = ua.match(/Firefox\/([0-9.]+)/)[1];
    } else if (ua.indexOf("SamsungBrowser") > -1) {
        browser = "Samsung Internet";
        version = ua.match(/SamsungBrowser\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
        browser = "Opera";
        version = ua.match(/(Opera|OPR)\/([0-9.]+)/)[2];
    } else if (ua.indexOf("Trident") > -1) {
        browser = "Microsoft Internet Explorer";
    } else if (ua.indexOf("Edge") > -1) {
        browser = "Microsoft Edge";
        version = ua.match(/Edge\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Chrome") > -1) {
        browser = "Google Chrome";
        version = ua.match(/Chrome\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Safari") > -1) {
        browser = "Apple Safari";
        version = ua.match(/Version\/([0-9.]+)/)[1];
    }

    return `${browser} ${version}`;
}
// --- END ADVANCED DETECTION HELPERS ---

async function getClientIpInfo() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        let data;
        try {
            const response = await fetch('https://ipinfo.io/json?token=331facddfc11cf', { signal: controller.signal });
            data = await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
        
        // Deteksi Proxy Sederhana (TimeZone Mismatch)
        let isProxySuspect = false;
        try {
            if (data.timezone) {
                const ipTimezone = data.timezone;
                const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (ipTimezone !== browserTimezone) {
                    isProxySuspect = true;
                }
            }
        } catch (e) {}

        const isIncognito = await detectIncognito();
        const browserDetail = getDetailedBrowserInfo();

        return data.ip ? {
            query: data.ip,
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            isp: data.org || 'Unknown',
            timezone: data.timezone || 'Unknown',
            is_proxy: isProxySuspect,
            is_incognito: isIncognito,
            browser_detail: browserDetail
        } : { 
            query: 'Unknown', country: 'Unknown', city: 'Unknown', isp: 'Unknown',
            is_proxy: false, is_incognito: false, browser_detail: navigator.userAgent
        };
    } catch (e) {
        return { 
            query: 'Unknown', country: 'Unknown', city: 'Unknown', isp: 'Unknown',
            is_proxy: false, is_incognito: false, browser_detail: navigator.userAgent
        };
    }
}

// --- CENTRALIZED LOGGING HELPER ---
async function logUserActivity({ userId, userName, activity, deviceName = null, extraReason = null }) {
    try {
        const ipInfo = await getClientIpInfo();
        // Gunakan navigator.userAgent (Raw) agar layout.js bisa memparsing OS & Browser dengan benar
        // Jika deviceName diberikan (dari sesi lama), gunakan itu.
        const userAgent = deviceName || navigator.userAgent;
        
        const ispInfo = { 
            location: `${ipInfo.city}, ${ipInfo.country}`, 
            isp: ipInfo.isp,
            timezone: ipInfo.timezone,
            detected_proxy: ipInfo.is_proxy,
            detected_incognito: ipInfo.is_incognito
        };

        if (extraReason) {
            ispInfo.reason = extraReason;
        }

        const { error } = await supabaseClient.from('activity_logs').insert({
            user_id: userId,
            name: userName,
            activity: activity,
            ip_address: ipInfo.query,
            device: userAgent,
            isp_info: ispInfo
        });

        if (error) console.warn(`Failed to insert activity log (${activity}):`, error.message);

    } catch (err) {
        console.warn(`Failed to log activity (${activity}):`, err);
    }
}
// --- END LOGGING HELPER ---

function clearTurnstileError() {
    const existing = document.getElementById('login-error-message') || document.querySelector('.messagebox.turnstile-error');
    if (existing) existing.remove();
}

function showTurnstileError() {
    let err = document.getElementById('login-error-message');
    const form = document.querySelector('form');
    if (form && form.parentNode) {
        if (!err) {
            err = document.createElement('div');
            err.id = 'login-error-message';
            err.className = 'alert alert-danger d-flex align-items-center mb-3';
            form.parentNode.insertBefore(err, form);
        }
        err.innerHTML = '<i class="fa-solid fa-circle-exclamation me-2"></i><span>Silakan selesaikan verifikasi Cloudflare Turnstile terlebih dahulu.</span>';
    }
}

async function signup(name, email, password) {
    try {
        clearTurnstileError();
        const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!captchaToken) {
            showTurnstileError();
            throw new Error("Silakan selesaikan verifikasi Cloudflare Turnstile terlebih dahulu.");
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { 
                data: { full_name: name },
                captchaToken: captchaToken
            }
        });
        if (error) throw error;
        
        if (data.user) {
            // Gunakan centralized logging
            await logUserActivity({
                userId: data.user.id,
                userName: name,
                activity: 'Account Registered'
            });
        }
        
        return { success: true };
    } catch (error) { return { success: false, message: error.message }; }
}

async function login(email, password, skipCaptchaAndSignIn = false) {
    try {
        let authData;

        if (!skipCaptchaAndSignIn) {
            clearTurnstileError();
            const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
            if (!captchaToken) {
                showTurnstileError();
                throw new Error("Silakan selesaikan verifikasi Cloudflare Turnstile terlebih dahulu.");
            }

            let { data, error: authError } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
                options: {
                    captchaToken: captchaToken
                }
            });
            if (authError) throw authError;
            authData = data;
        } else {
            // Sesi sudah terbuat otomatis oleh Supabase saat signUp berhasil
            let { data, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError || !data.session) {
                throw new Error("Gagal mengambil sesi otomatis.");
            }
            authData = { user: data.session.user, session: data.session };
        }

        // Fetch Minimal Profile Data for UI
        let { data: profileData, error: profileError } = await supabaseClient
            .from('profiles')
            .select(`*, plan_gracely (number_plan, name_plan), allow_multilogin, max_devices, last_popup_date, last_expiry_warning_date`)
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.warn("Could not fetch full profile data:", profileError);
            profileData = profileData || {};
        }

        const userPlan = profileData.plan_gracely || {
            number_plan: '001',
            name_plan: 'No Premium'
        };

        const now = new Date().toISOString();
        const clientIp = await getClientIp();
        const userAgent = navigator.userAgent;
        const secureSessionToken = authData.session.access_token;
        const userName = profileData.name || 'User';
        const uniqueSessionID = crypto.randomUUID();

        // Generate device fingerprint untuk session binding
        const deviceFingerprint = await getDeviceFingerprint();
        console.log('Device fingerprint generated for session binding');


        /* 
           MULTI-LOGIN SUPPORT
           Cek setting allow_multilogin dan max_devices dari profile user
        */
        const allowMultilogin = profileData.allow_multilogin || false;
        const maxDevices = profileData.max_devices || 1;

        if (allowMultilogin) {
            // === MULTI-LOGIN ENABLED ===
            // Cek jumlah session yang sudah ada
            const { data: existingSessions } = await supabaseClient
                .from('user_sessions')
                .select('id, device_fingerprint, created_at, device_name')
                .eq('user_id', authData.user.id)
                .order('created_at', { ascending: true }); // Urutkan dari terlama
            
            const sessionCount = existingSessions?.length || 0;
            
            // Cek apakah device ini sudah punya session
            const existingDeviceSession = existingSessions?.find(
                s => s.device_fingerprint === deviceFingerprint
            );
            
            if (existingDeviceSession) {
                // Device yang sama login ulang: Update session yang ada
                console.log('Device sudah terdaftar, update session...');
                await supabaseClient
                    .from('user_sessions')
                    .update({ session_token: uniqueSessionID, device_name: userAgent })
                    .eq('id', existingDeviceSession.id);
            } else if (sessionCount >= maxDevices) {
                // Batas device tercapai: Hapus session paling lama, tambah yang baru
                console.log(`Batas ${maxDevices} device tercapai, hapus session terlama...`);
                
                // LOG: Catat kejadian kick sesi lama akibat batas device
                // Menggunakan centralized logging untuk konsistensi
                const sessionsToDeleteCount = sessionCount - maxDevices + 1;
                const sessionsToDelete = existingSessions.slice(0, sessionsToDeleteCount);
                const sessionIdsToDelete = sessionsToDelete.map(s => s.id);

                await supabaseClient
                    .from('user_sessions')
                    .delete()
                    .in('id', sessionIdsToDelete);

                for (const session of sessionsToDelete) {
                    await logUserActivity({
                        userId: authData.user.id,
                        userName: userName,
                        activity: 'Logout Multi Login',
                        deviceName: session.device_name || 'Unknown Device', // Gunakan device lama yang dihapus
                        extraReason: `Session terlama ditendang: batas ${maxDevices} device tercapai`
                    });
                }

                await supabaseClient.from('user_sessions').insert({
                    user_id: authData.user.id,
                    session_token: uniqueSessionID,
                    device_name: userAgent,
                    device_fingerprint: deviceFingerprint
                });
            } else {
                // Belum capai limit: Tambah session baru
                // console.log(`Menambah device baru (${sessionCount + 1}/${maxDevices})...`);
                await supabaseClient.from('user_sessions').insert({
                    user_id: authData.user.id,
                    session_token: uniqueSessionID,
                    device_name: userAgent,
                    device_fingerprint: deviceFingerprint
                });
            }
        } else {
            // === SINGLE-LOGIN (Default) ===
            // Hapus semua session lama, hanya 1 device yang boleh aktif
            const { data: oldSessions } = await supabaseClient
                .from('user_sessions')
                .select('id, device_name') // Ambil device_name
                .eq('user_id', authData.user.id);

            const { error: deleteError } = await supabaseClient
                .from('user_sessions')
                .delete()
                .eq('user_id', authData.user.id);

            if (deleteError) console.warn("Gagal menghapus session lama:", deleteError);

            // LOG: Catat kick sesi lama hanya jika memang ada sesi lama sebelumnya
            if (oldSessions && oldSessions.length > 0) {
                for (const session of oldSessions) {
                    await logUserActivity({
                        userId: authData.user.id,
                        userName: userName,
                        activity: 'Logout Multi Login',
                        deviceName: session.device_name || 'Unknown Device', // Gunakan device lama
                        extraReason: 'Sesi lama ditendang: login perangkat baru (single-device policy)'
                    });
                }
            }

            await supabaseClient.from('user_sessions').insert({
                user_id: authData.user.id,
                session_token: uniqueSessionID,
                device_name: userAgent,
                device_fingerprint: deviceFingerprint
            });
        }

        // ... existing code ...
        let isCurrentlyPremium = false;

        const expiryDate = profileData.premiumExpiryDate ? new Date(profileData.premiumExpiryDate) : null;
        const proDate = profileData.pro_expiry_date ? new Date(profileData.pro_expiry_date) : null;
        const phantomDate = profileData.phantom_expiry_date ? new Date(profileData.phantom_expiry_date) : null;

        const today = new Date();
        const isPremiumValid = expiryDate && today <= expiryDate;
        const isProValid = proDate && today <= proDate;
        const isPhantomValid = phantomDate && today <= phantomDate;

        // Determine Effective Plan based on Hierarchy: Phantom > Pro > Premium
        let finalPlanName = 'No Premium';
        let finalPlanNumber = '001';

        if (isPhantomValid) {
            finalPlanName = 'The Phantom';
            finalPlanNumber = '004';
        } else if (isProValid) {
            finalPlanName = 'Pro';
            finalPlanNumber = '003';
        } else if (isPremiumValid) {
            finalPlanName = 'Premium';
            finalPlanNumber = '002';
        }

        // Global Active Check
        if (finalPlanNumber !== '001') {
            isCurrentlyPremium = true;
        }

        // Only store purely UI-related data
        GracelyState.set('isAuthenticated', 'true');
        GracelyState.set('userEmail', authData.user.email);
        GracelyState.set('userName', userName);
        GracelyState.set('isPremium', isCurrentlyPremium); // UI toggle
        GracelyState.set('userPlanName', finalPlanName);
        GracelyState.set('userPlanNumber', finalPlanNumber);
        GracelyState.set('premiumExpiryDate', profileData.premiumExpiryDate);
        GracelyState.set('proExpiryDate', profileData.pro_expiry_date);
        GracelyState.set('phantomExpiryDate', profileData.phantom_expiry_date);
        
        // Simpan waktu terakhir popup dari Profil jika ada
        if (profileData.last_popup_date) {
            GracelyState.set('lastPopupDateDB', profileData.last_popup_date);
        } else {
            GracelyState.remove('lastPopupDateDB');
        }

        if (profileData.last_expiry_warning_date) {
            GracelyState.set('lastExpiryWarningDateDB', profileData.last_expiry_warning_date);
        } else {
            GracelyState.remove('lastExpiryWarningDateDB');
        }

        // IMPORTANT: Store the DB Session ID so script.js can verify it!
        GracelyState.set('gracely_db_session_id', uniqueSessionID);

        // CLEANUP: Remove legacy items to avoid confusion
        GracelyState.remove('gracely_config_url');
        GracelyState.remove('gracelyPremiumConfig');
        // GracelyState.remove('gracely_db_session_id'); // DO NOT REMOVE THIS!
        GracelyState.remove('gracely_active_session_token');

        eraseCookie('gracely_active_session');
        eraseCookie('is_premium');
        if (typeof eraseCookie === 'function') eraseCookie('UnangJahaCookieOnLae');

        // The most important part: The Session Cookie for the Extension
        setCookie('gracely_session_token', secureSessionToken, 30);
        if (authData.session.refresh_token) {
            setCookie('gracely_refresh_token', authData.session.refresh_token, 30);
        }

        await supabaseClient.from('profiles').update({
            last_sign_in: now,
            last_ip: clientIp,
            last_browser: userAgent
        }).eq('id', authData.user.id);

        // Gunakan centralized logging
        await logUserActivity({
            userId: authData.user.id,
            userName: userName,
            activity: 'Logged In'
        });

        return { success: true };
    } catch (error) {
        GracelyState.clear(); localStorage.clear();
        eraseCookie('gracely_active_session');
        eraseCookie('is_premium');
        eraseCookie('gracely_config_url');
        eraseCookie('gracely_config_url');
        eraseCookie('gracely_session_token');
        eraseCookie('gracely_refresh_token');
        if (error.message && (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials"))) {
            return { success: false, message: 'Invalid email or password. Please check your credentials and try again.' };
        }
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}

async function sendPasswordResetEmail(email) {
    try {
        clearTurnstileError();
        const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!captchaToken) {
            showTurnstileError();
            throw new Error(" ");
        }

        // 1. Cek apakah email terdaftar di database menggunakan RPC
        const { data: emailExists, error: rpcError } = await supabaseClient.rpc('check_email_exists', {
            check_email: email
        });

        if (rpcError || !emailExists) {
            return { success: false, message: 'No account found with that email address.' };
        }

        // 2. Jika email terdaftar, jalankan reset password
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://draft.gracely.my.id/password.html',
            captchaToken: captchaToken
        });
        
        if (error) {
            if (error.message.includes("User not found") || error.status === 404) {
                return { success: false, message: 'No account found with that email address.' };
            }
            throw error;
        }

        return { success: true, message: 'Reset link sent successfully.' };
    } catch (error) { 
        if (error.message && error.message.includes("User not found")) {
            return { success: false, message: 'No account found with that email address.' };
        }
        return { success: false, message: 'No account found with that email address.' };
    }
}

async function updateUserPassword(newPassword) {
    try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) throw error;
        
        return { success: true, message: 'Password updated successfully.' };
    } catch (error) { return { success: false, message: 'Failed to update password.' }; }
}

async function checkProfileUpdateLimit(userId) {
    try {
        const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { error, count } = await supabaseClient
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('activity', 'Profile Name Updated')
            .gte('created_at', past24h);

        if (error) {
            console.warn('Error checking update limit:', error);
            return { limited: false, count: 0 };
        }
        
        const updatesCount = count || 0;
        return { limited: updatesCount >= 3, count: updatesCount };
    } catch (e) {
        console.warn('Exception checking update limit:', e);
        return { limited: false, count: 0 };
    }
}

async function updateUserName(newName) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("Session expired.");

        const limitCheck = await checkProfileUpdateLimit(user.id);
        if (limitCheck.limited) {
            throw new Error("Profile edit limit reached (maximum 3 times per 24 hours).");
        }

        const { error } = await supabaseClient.from('profiles').update({ name: newName }).eq('id', user.id);
        if (error) throw error;
        
        await supabaseClient.auth.updateUser({ data: { full_name: newName } });
        GracelyState.set('userName', newName);

        await logUserActivity({
            userId: user.id,
            userName: newName,
            activity: 'Profile Name Updated'
        });

        return { success: true, message: 'Name updated successfully!' };
    } catch (error) { return { success: false, message: error.message }; }
}

// Helper untuk mencatat kapan User melihat popup hari ini
async function updateLastPopupDate(type) {
    try {
        const userId = await getUserId();
        if (!userId) return false;
        
        const now = new Date().toISOString();
        const updateData = {};
        
        if (type === 'info') {
            updateData.last_popup_date = now;
            GracelyState.set('lastPopupDateDB', now);
        } else if (type === 'expiry') {
            updateData.last_expiry_warning_date = now;
            GracelyState.set('lastExpiryWarningDateDB', now);
        }

        const { error } = await supabaseClient.from('profiles')
            .update(updateData)
            .eq('id', userId);
            
        if (error) {
            console.warn(`Gagal mengupdate tanggal popup (${type}):`, error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.warn(`Error updating popup date (${type}):`, e);
        return false;
    }
}

async function logout(redirect = true) {
    const userId = await getUserId();
    const currentName = GracelyState.get('userName') || 'Unknown';
    // Ambil session ID SEBELUM GracelyState.clear(); localStorage.clear() dipanggil
    const mySessionId = GracelyState.get('gracely_db_session_id');

    if (userId) {
        const now = new Date().toISOString();
        await supabaseClient.from('profiles').update({ last_sign_out: now }).eq('id', userId);

        // Hapus session ini dari user_sessions agar login ulang tidak trigger "Logout Multi Login" palsu
        if (mySessionId) {
            try {
                await supabaseClient.from('user_sessions')
                    .delete()
                    .eq('user_id', userId)
                    .eq('session_token', mySessionId);
            } catch (sessErr) { console.warn('Gagal menghapus user_sessions:', sessErr); }
        }

        // Gunakan centralized logging
        await logUserActivity({
            userId: userId,
            userName: currentName,
            activity: 'Logout Manual'
        });
    }

    GracelyState.clear(); localStorage.clear();
    eraseCookie('gracely_active_session');
    eraseCookie('is_premium');
    eraseCookie('gracely_config_url');
    eraseCookie('gracely_session_token');
    eraseCookie('gracely_refresh_token');

    // Explicit trigger for extension to wipe data
    setCookie('UnangJahaCookieOnLae', 'true', 1);

    if (redirect) {
        // Handle Redirect Gracefully
        if (window.location.pathname.includes('admin')) {
            window.location.reload();
        } else {
            window.location.href = 'login.html';
        }
    }
}

function isAuthenticated() { return GracelyState.get('isAuthenticated') === 'true'; }

// CRITICAL SECURITY: Server-side validation untuk multiuser environment
async function requireAuth() {
    // 1. Instant UI check (prevent flash of login page)
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Background server validation menggunakan SECURITY STANDARD (Seperti Ekstensi)
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
            await logout();
            return;
        }

        // Ambil Fingerprint unik Dasbor ini
        const myBrowserFingerprint = await getDeviceFingerprint();

        // Panggil RPC Keamanan Gracely (Mencocokkan sidik jari dengan isi user_sessions)
        const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_gracely_auth_status`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                p_fingerprint: myBrowserFingerprint 
            })
        });

        if (!rpcResponse.ok) {
            // Jika error jaringan murni (misal Supabase down/RTO), longgarkan
            return;
        }

        const rpcData = await rpcResponse.json();

        // 3. VALIDASI KEPUTUSAN HAKIM
        if (!rpcData || !rpcData.isValid) {
            const reason = rpcData ? rpcData.reason : 'unknown_error';
            
            // JIKA DIVONIS NO_SESSION KARENA DEVICE LIMIT: CERAiKAN!
            if (reason === 'unauthorized' || reason === 'no_session' || reason === 'profile_not_found') {
                console.error("RPC menolak validitas. Alasan:", reason);
                await logout();
                return;
            }
            
            // Jika alasan 'expired' (Paket Habis), Dasbor tetap terbuka (berfungsi sebatas Free Tier)
            // karena session-nya sendiri masih legal.
        }

        // Optional check: Ensure the correct profile is being viewed
        const storedEmail = GracelyState.get('userEmail');
        const { data: userData } = await supabaseClient.auth.getUser();
        if (userData?.user && storedEmail && userData.user.email !== storedEmail) {
            await logout();
            return;
        }

    } catch (e) {
        // Abaikan Network Error demi kenyamanan User Experience
        // await logout();
    }
}

function redirectIfAuthenticated() { if (isAuthenticated()) { window.location.href = 'dashboard.html'; } }

// --- REALTIME PROFILE LISTENER ---
let profileListenerChannel = null;

async function initRealtimeProfileListener() {
    if (!isAuthenticated() || profileListenerChannel) return;
    
    const userId = await getUserId();
    if (!userId) return;

    // Listen only to changes for THIS user's profile
    profileListenerChannel = supabaseClient.channel(`public:profiles:id=eq.${userId}`)
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
            async (payload) => {
                // console.log('Realtime Profile Update Received:', payload);
                
                const newData = payload.new;
                
                const today = new Date();
                const premiumDate = newData.premiumExpiryDate ? new Date(newData.premiumExpiryDate) : null;
                const proDate = newData.pro_expiry_date ? new Date(newData.pro_expiry_date) : null;
                const phantomDate = newData.phantom_expiry_date ? new Date(newData.phantom_expiry_date) : null;
        
                const isPremiumValid = premiumDate && today <= premiumDate;
                const isProValid = proDate && today <= proDate;
                const isPhantomValid = phantomDate && today <= phantomDate;
        
                // Determine Effective Plan based on Hierarchy: Phantom > Pro > Premium
                let finalPlanName = 'No Premium';
                let finalPlanNumber = '001';
        
                if (isPhantomValid) {
                    finalPlanName = 'The Phantom';
                    finalPlanNumber = '004';
                } else if (isProValid) {
                    finalPlanName = 'Pro';
                    finalPlanNumber = '003';
                } else if (isPremiumValid) {
                    finalPlanName = 'Premium';
                    finalPlanNumber = '002';
                }

                let isCurrentlyPremium = (finalPlanNumber !== '001');

                // Update Local Storage purely UI
                GracelyState.set('isPremium', isCurrentlyPremium);
                GracelyState.set('userPlanName', finalPlanName);
                GracelyState.set('userPlanNumber', finalPlanNumber);

                if (newData.premiumExpiryDate) GracelyState.set('premiumExpiryDate', newData.premiumExpiryDate);
                else GracelyState.remove('premiumExpiryDate');

                if (newData.pro_expiry_date) GracelyState.set('proExpiryDate', newData.pro_expiry_date);
                else GracelyState.remove('proExpiryDate');

                if (newData.phantom_expiry_date) GracelyState.set('phantomExpiryDate', newData.phantom_expiry_date);
                else GracelyState.remove('phantomExpiryDate');

                // FORCE EXTENSION TO WAKE UP AND SYNC via Cookie 
                // Extension usually listens to cookie changes or validates per action
                // Changing the UnangJahaCookieOnLae temporarily triggers reload in background script if configured.
                // We'll set a special sync cookie instead:
                setCookie('gracely_plan_sync', Date.now().toString(), 1); 

                // Dispatch Custom Event so layout.js can re-render dashboard instantly
                document.dispatchEvent(new Event('gracelyPlanRefresh'));
            }
        )
        .subscribe((status) => {
            // console.log('Realtime Subscription Status:', status);
        });
}

// Auto-start listener if authenticated upon load
if (isAuthenticated()) {
    setTimeout(initRealtimeProfileListener, 2000); // Delay slightly to ensure getUserId is ready
}
// --- END REALTIME PROFILE LISTENER ---

