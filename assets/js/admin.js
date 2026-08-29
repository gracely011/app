// admin.js - Logika Manajemen Dasbor Admin Gracely

let currentAdminUid = null;
let allUsersCache = [];

// DOM Elements
const authLoader = document.getElementById('authLoader');
const tabs = {
    overview: document.getElementById('panel-overview'),
    users: document.getElementById('panel-users'),
    activity: document.getElementById('panel-activity'),
    notifications: document.getElementById('panel-notifications'),
    services: document.getElementById('panel-services')
};
const tabButons = {
    overview: document.getElementById('tab-overview'),
    users: document.getElementById('tab-users'),
    activity: document.getElementById('tab-activity'),
    notifications: document.getElementById('tab-notifications'),
    services: document.getElementById('tab-services')
};

// State Modal Edit Sub
let activeEditTargetUid = null;
let activePlanType = 'premium'; // default
let activeOriginalDate = null;
let activeDrawerUid = null; // for Drawer Context

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    setupTheme();
    initResizableTables();
    
    // Panggil logika autentikasi khusus Admin (tanpa requireAuth global)
    await initAdminAuth();
});

async function initAdminAuth() {
    const loginPanel = document.getElementById('adminLoginPanel');
    const authLoader = document.getElementById('authLoader');
    
    try {
        const adminUid = await getUserId();
        if (!adminUid) {
            // Belum login sama sekali -> Tampilkan Form Login
            authLoader.classList.add('hidden');
            loginPanel.classList.remove('hidden');
            return;
        }

        // Sudah ada sesi, verifikasi apakah dia Admin
        await verifyAdminAccess();
        
    } catch (e) {
        console.error("Error setting up admin auth:", e);
        authLoader.classList.add('hidden');
        loginPanel.classList.remove('hidden');
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnAdminLogin');
    const errDiv = document.getElementById('adminLoginError');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = `<div class="loader w-4 h-4 border-2 border-t-white inline-block align-middle mr-2"></div> Memeriksa...`;
    btn.disabled = true;
    errDiv.classList.add('hidden');
    
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    
    try {
        const result = await login(email, pass);
        if (!result.success) {
            throw new Error(result.message || 'Login gagal.');
        }
        
        currentAdminUid = await getUserId();
        const { data: isAdmin, error } = await supabaseClient.rpc('is_admin');
        
        if (error || !isAdmin) {
            // Jika bukan admin, tendang sesi tersebut
            await supabaseClient.auth.signOut();
            GracelyState.remove('isAuthenticated');
            throw new Error('Akses Ditolak: Anda bukan administrator.');
        }
        
        // Pindah ke tampilan Dashboard Load
        document.getElementById('adminLoginPanel').classList.add('hidden');
        document.getElementById('authLoader').classList.remove('hidden'); 
        
        await verifyAdminAccess();
        
    } catch(err) {
        errDiv.textContent = err.message;
        errDiv.classList.remove('hidden');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Sidebar Togglers
function toggleAdminSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (sidebar && overlay) {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }
}

// Setup Tema Tampilan & Sidebar UI
function setupTheme() {
    try {
        const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeSidebarUI();
    } catch (e) {
        console.warn('Storage disabled or incognito block. Theme fallback to light.');
    }
}

function setAdminTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('theme', theme); } catch(e) {}
    updateThemeSidebarUI();
}

function toggleThemeOnly() {
    // Old theme toggler, preserved if needed elsewhere. Next features use toggleIGTheme.
    const isDark = document.documentElement.classList.contains('dark');
    setAdminTheme(isDark ? 'light' : 'dark');
}

function updateThemeSidebarUI() {
    // Update the IG Theme Toggle Checkbox to match system state
    const isDark = document.documentElement.classList.contains('dark');
    const igToggle = document.getElementById('igThemeToggle');
    if (igToggle) {
        igToggle.checked = isDark;
    }
}

// Verifikasi Hak Akses Admin melalui RPC
async function verifyAdminAccess() {
    try {
        currentAdminUid = await getUserId();
        if (!currentAdminUid) throw new Error("Not logged in");

        // Panggil RPC 'is_admin' yang sudah dibuat di SQL
        const { data: isAdmin, error } = await supabaseClient.rpc('is_admin');
        
        if (error || !isAdmin) {
            console.warn("RESTRICTED: You do not have admin access.");
            throw new Error("Akses Ditolak: Anda bukan administrator.");
        }

        // Set nama admin
        document.getElementById('adminNameDisplay').textContent = GracelyState.get('userName') || 'Admin Utama';
        
        // Hide Loader, Hide Login Form, Show Main Dashboard
        document.getElementById('authLoader').classList.add('hidden');
        document.getElementById('adminLoginPanel').classList.add('hidden');
        
        const dbLayout = document.getElementById('adminDashboardLayout');
        if (dbLayout) {
            dbLayout.classList.remove('hidden');
            dbLayout.classList.add('flex');
        }

        // Load Initial Data
        loadDashboardData();

    } catch (e) {
        console.error("Admin verification failed:", e);
        
        // Jika akses gagal (sesi ditolak/bukan admin), kembalikan ke layar login pannel
        supabaseClient.auth.signOut(); // Bersihkan dari local state juga
        
        document.getElementById('authLoader').classList.add('hidden');
        const loginPanel = document.getElementById('adminLoginPanel');
        if (loginPanel) loginPanel.classList.remove('hidden');
        
        const errDiv = document.getElementById('adminLoginError');
        if (errDiv) {
            errDiv.textContent = e.message || "Akses Ditolak. Silakan coba lagi.";
            errDiv.classList.remove('hidden');
        }
    }
}

// Tab Switching
// Tab Switching
function switchTab(tabId) {
    // Hide all
    Object.values(tabs).forEach(el => el.classList.add('hidden'));
    Object.values(tabButons).forEach(el => {
        el.classList.remove('active');
    });

    // Show active
    tabs[tabId].classList.remove('hidden');
    tabButons[tabId].classList.add('active');

    // Update Mobile Title
    const mobileTitle = document.getElementById('mobilePageTitle');
    if (mobileTitle) {
        if (tabId === 'overview') mobileTitle.textContent = 'Dasbor Admin';
        if (tabId === 'users') mobileTitle.textContent = 'Kelola Akun';
        if (tabId === 'activity') mobileTitle.textContent = 'Log Aktivitas';
        if (tabId === 'notifications') mobileTitle.textContent = 'Notifikasi';
        if (tabId === 'services') mobileTitle.textContent = 'Layanan Kustom';
    }

    // Auto-close mobile sidebar if open
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        if(overlay) overlay.classList.add('hidden');
    }

    // Lazy Load Data
    if (tabId === 'users') loadUsers();
    if (tabId === 'activity') loadActivityLogs();
    if (tabId === 'notifications') loadNotifications();
    if (tabId === 'services') loadServices();
}

// "Lainnya" More Menu Popup Toggle
function toggleMoreMenu(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const menu = document.getElementById('moreMenuPopup');
    if(menu) {
        menu.classList.toggle('open');
        // Selalu kembalikan ke panel utama setiap kali dibuka
        if (menu.classList.contains('open')) {
            menu.classList.remove('show-theme');
        }
    }
}

// Menampilkan Panel Mode Gelap di dalam Popup "Lainnya"
function showThemePanel(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const menu = document.getElementById('moreMenuPopup');
    if (menu) {
        menu.classList.add('show-theme');
    }
}

// Menyembunyikan Panel Mode Gelap / Kembali ke Menu Utama
function hideThemePanel(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const menu = document.getElementById('moreMenuPopup');
    if (menu) {
        menu.classList.remove('show-theme');
    }
}

// Logic untuk Toggle Mode Gelap
function toggleIGTheme(checkbox) {
    // Jika checkbox tercentang, aktifkan dark mode
    setAdminTheme(checkbox.checked ? 'dark' : 'light');
}

// Close "Lainnya" menu when clicked outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('moreMenuPopup');
    if(menu && menu.classList.contains('open')) {
        // If the click is not inside the menu
        if(!menu.contains(e.target) && !e.target.closest('[onclick="toggleMoreMenu(event)"]')) {
            menu.classList.remove('open');
        }
    }
});

// Format Tanggal
function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date)) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric', month: 'short', day: '2-digit', 
        hour: '2-digit', minute:'2-digit'
    }).format(date);
}

// Load Dashboard Overview
async function loadDashboardData() {
    // 1. Fetch Profiles Top 10
    try {
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (!error && profiles) {
            const tbody = document.getElementById('overviewUserTableBody');
            tbody.innerHTML = '';
            profiles.forEach(p => {
                const planInfo = getEffectivePlanStatus(p);
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer";
                tr.onclick = () => openDrawer(p.id);
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900 dark:text-white">${p.name || 'Unknown'}</div>
                        <div class="text-[11px] text-gray-500">${p.id.substring(0,8)}...</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${getPlanColorClass(planInfo.name)}">${planInfo.name}</span>
                    </td>
                    <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">${formatDate(p.created_at)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(e) { console.warn("Profiles error:", e); }

    // 2. Counts
    try {
        const { count: totalUsers } = await supabaseClient.from('profiles').select('id', { count: 'exact', head: true });
        document.getElementById('statTotalUsers').textContent = totalUsers || 0;
    } catch(e) {}
    
    try {
        const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
        const { count: todayActivity } = await supabaseClient.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString());
        document.getElementById('statTodayActivity').textContent = todayActivity || 0;
    } catch(e) {}

    try {
        const { count: activeSessions } = await supabaseClient.from('user_sessions').select('id', { count: 'exact', head: true });
        document.getElementById('statActiveSessions').textContent = activeSessions || "N/A";
    } catch(e) {}

    // 3. Render Chart (dilindungi sendiri di dalam fungsinya)
    renderActivityChart();
}

// Helper Get Effective Plan
function getEffectivePlanStatus(data) {
    const today = new Date();
    const premiumDate = data.premiumExpiryDate ? new Date(data.premiumExpiryDate) : null;
    const proDate = data.pro_expiry_date ? new Date(data.pro_expiry_date) : null;
    const phantomDate = data.phantom_expiry_date ? new Date(data.phantom_expiry_date) : null;

    if (phantomDate && today <= phantomDate) return { name: 'Phantom', date: phantomDate };
    if (proDate && today <= proDate) return { name: 'Pro', date: proDate };
    if (premiumDate && today <= premiumDate) return { name: 'Premium', date: premiumDate };
    return { name: 'Free', date: null };
}

function getPlanColorClass(planName) {
    switch(planName) {
        case 'Phantom': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
        case 'Pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        case 'Premium': return 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
}

// Load Users Table
async function loadUsers() {
    document.getElementById('usersLoading').classList.remove('hidden');
    document.getElementById('usersTableBody').innerHTML = '';

    try {
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        allUsersCache = profiles;
        renderUsers(profiles);
    } catch (e) {
        console.error("Error loading users:", e);
    } finally {
        document.getElementById('usersLoading').classList.add('hidden');
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    users.forEach(p => {
        const eff = getEffectivePlanStatus(p);
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group";
        tr.onclick = () => openDrawer(p.id);
        
        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">${p.name || 'Unnamed'}</div>
                <div class="text-[10px] text-gray-500 font-mono mt-0.5">${p.id}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getPlanColorClass(eff.name)}">${eff.name}</span>
                </div>
                <div class="text-[10px] ${p.allow_multilogin ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}">
                    <i data-lucide="${p.allow_multilogin ? 'smartphone' : 'monitor'}" class="w-3 h-3 inline"></i> 
                    ${p.allow_multilogin ? `Multi (${p.max_devices} Dev)` : 'Single Device'}
                </div>
            </td>
            <td class="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                ${formatDate(p.premiumExpiryDate)}
            </td>
            <td class="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                ${formatDate(p.pro_expiry_date)}
            </td>
            <td class="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                ${formatDate(p.phantom_expiry_date)}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2" onclick="event.stopPropagation()">
                    <button onclick="openEditSubModal('${p.id}')" title="Ubah Langganan" class="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:hover:bg-brand-900/60 dark:text-brand-400 rounded transition-colors">
                        <i data-lucide="calendar-plus" class="w-4 h-4"></i>
                    </button>
                    ${p.id !== currentAdminUid ? `
                    <button onclick="openDeleteModal('${p.id}')" title="Hapus Permanen" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/60 dark:text-red-400 rounded transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

// Serach Users Client Side
document.getElementById('userSearchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsersCache.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) || 
        (u.id && u.id.toLowerCase().includes(term))
    );
    renderUsers(filtered);
});

// Load Activity Logs
async function loadActivityLogs() {
    document.getElementById('activityLoading').classList.remove('hidden');
    document.getElementById('activityTableBody').innerHTML = '';

    try {
        const { data: logs, error } = await supabaseClient
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        
        const tbody = document.getElementById('activityTableBody');
        logs.forEach(log => {
            const isp = log.isp_info || {};
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${formatDate(log.created_at)}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 dark:text-white">${log.name || 'Unknown'}</div>
                    <div class="text-[10px] text-gray-500">${log.user_id ? log.user_id.substring(0,8) + '...' : '-'}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-[10px] font-bold rounded-full ${getActivityColor(log.activity)}">${log.activity}</span>
                </td>
                <td class="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                    <div class="font-mono">${log.ip_address || '-'}</div>
                    <div class="text-[10px] mt-0.5">${isp.location || 'Unknown Location'}</div>
                </td>
                <td class="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate" title="${log.device}">
                    ${log.device || '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error loading activity:", e);
    } finally {
        document.getElementById('activityLoading').classList.add('hidden');
    }
}

function getActivityColor(act) {
    if(!act) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    const a = act.toLowerCase();
    if(a.includes('login') && !a.includes('logout')) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    if(a.includes('logout') || a.includes('kick')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    if(a.includes('register') || a.includes('sign')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
}

// Modal Logics
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openEditSubModal(uid) {
    const user = allUsersCache.find(u => u.id === uid);
    if(!user) return;
    
    activeEditTargetUid = uid;
    document.getElementById('editSubUserName').textContent = user.name || 'User';
    
    // Default form configuration
    selectPlanForm('premium');
    document.getElementById('modalEditSub').classList.add('active');
}

function openDeleteModal(uid) {
    const user = allUsersCache.find(u => u.id === uid);
    if(!user) return;
    
    activeEditTargetUid = uid;
    document.getElementById('deleteUserName').textContent = `${user.name} (${uid})`;
    document.getElementById('modalDeleteUser').classList.add('active');
}

// Plan Form Logic
function selectPlanForm(planType) {
    activePlanType = planType;
    const user = allUsersCache.find(u => u.id === activeEditTargetUid);
    
    // Reset buttons
    ['premium', 'pro', 'phantom'].forEach(p => {
        const btn = document.getElementById('btnPlan' + p.charAt(0).toUpperCase() + p.slice(1));
        btn.className = "py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-lg text-sm hover:border-brand-500 transition-all";
    });

    // Active button
    const activeBtn = document.getElementById('btnPlan' + planType.charAt(0).toUpperCase() + planType.slice(1));
    activeBtn.className = "py-2 border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold rounded-lg text-sm transition-all shadow-sm";

    // Set Date input
    let targetDateStr = null;
    if (planType === 'premium') targetDateStr = user.premiumExpiryDate;
    if (planType === 'pro') targetDateStr = user.pro_expiry_date;
    if (planType === 'phantom') targetDateStr = user.phantom_expiry_date;

    const dateInput = document.getElementById('editSubDate');
    if (targetDateStr) {
        // format datetime-local input YYYY-MM-DDThh:mm
        const d = new Date(targetDateStr);
        if(!isNaN(d)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const h = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            dateInput.value = `${y}-${m}-${day}T${h}:${min}`;
        } else {
            dateInput.value = '';
        }
    } else {
        dateInput.value = '';
    }

    // Set Multi Login Setup
    const mLoginChk = document.getElementById('editMultiLogin');
    const mLoginMax = document.getElementById('editMaxDevices');
    if(mLoginChk) mLoginChk.checked = user.allow_multilogin || false;
    if(mLoginMax) mLoginMax.value = user.max_devices || 1;
}

// Tanggal Preset Calculator
function addDatePreset(days) {
    let baseDate = new Date();
    // Kalau kolom sudah isi, tambah dari tanggal itu. Kalau kosong, tambah dari sekarang.
    const inputVal = document.getElementById('editSubDate').value;
    if (inputVal) {
        baseDate = new Date(inputVal);
    }
    baseDate.setDate(baseDate.getDate() + days);
    
    // Update Input
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const h = String(baseDate.getHours()).padStart(2, '0');
    const min = String(baseDate.getMinutes()).padStart(2, '0');
    document.getElementById('editSubDate').value = `${y}-${m}-${day}T${h}:${min}`;
}

// EXECUTE: Save Subscription RPC
async function saveSubscription() {
    const btn = document.getElementById('btnSaveSub');
    btn.innerHTML = `<div class="loader w-4 h-4 border-2 border-t-white"></div> Menyimpan...`;
    btn.disabled = true;

    try {
        const inputVal = document.getElementById('editSubDate').value;
        const targetDate = inputVal ? new Date(inputVal).toISOString() : null;

        // Panggil RPC
        const { error } = await supabaseClient.rpc('admin_update_subscription', {
            p_target_uid: activeEditTargetUid,
            p_plan_type: activePlanType,
            p_expire_date: targetDate
        });

        if (error) throw error;

        // Menyimpan status multi-login langsung ke tabel profiles
        const mLogChk = document.getElementById('editMultiLogin');
        const mLogMax = document.getElementById('editMaxDevices');
        if(mLogChk && mLogMax) {
            const isMulti = mLogChk.checked;
            const maxDev = parseInt(mLogMax.value) || 1;
            const res = await supabaseClient.from('profiles').update({
                allow_multilogin: isMulti,
                max_devices: maxDev
            }).eq('id', activeEditTargetUid);
            if(res.error) console.warn("Failed updating multi-login:", res.error);
        }

        // Sukses
        closeModal('modalEditSub');
        loadUsers(); // Refresh Grid

    } catch (e) {
        console.error(e);
        alert("Gagal mengupdate paket: " + e.message);
    } finally {
        btn.innerHTML = "Simpan Perubahan";
        btn.disabled = false;
    }
}

// EXECUTE: Delete User RPC
async function confirmDeleteUser() {
    const btn = document.getElementById('btnConfirmDelete');
    btn.innerHTML = `<div class="loader w-4 h-4 border-2 border-t-white"></div> Menghapus...`;
    btn.disabled = true;

    try {
        const { data, error } = await supabaseClient.rpc('admin_delete_user', {
            p_target_uid: activeEditTargetUid
        });

        if (error) throw error;

        // Log the activity to our table purely for audit trail
        await logUserActivity({
            userId: currentAdminUid,
            userName: document.getElementById('adminNameDisplay').textContent,
            activity: 'Force Deleted User (' + activeEditTargetUid + ')',
            deviceName: navigator.userAgent
        });

        closeModal('modalDeleteUser');
        loadUsers();
        loadDashboardData();

    } catch (e) {
        console.error(e);
        alert("Gagal menghapus profil secara permanen: " + e.message);
    } finally {
        btn.innerHTML = "Ya, Hapus Permanen";
        btn.disabled = false;
    }
}

// ======== NEW EXTENSION FEATURES ========

// -- 1. Chart.js Logic
let activityChartInstance = null;
async function renderActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    try {
        const labels = [];
        const today = new Date();
        for(let i=6; i>=0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }));
        }

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: logs, error } = await supabaseClient
            .from('activity_logs')
            .select('created_at, activity')
            .gte('created_at', sevenDaysAgo.toISOString());
            
        const dataCounts = [0, 0, 0, 0, 0, 0, 0];
        if (!error && logs) {
            logs.forEach(log => {
                const logDate = new Date(log.created_at);
                logDate.setHours(0,0,0,0);
                const td = new Date(today);
                td.setHours(0,0,0,0);
                
                const diffTime = Math.abs(td - logDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 6) {
                    dataCounts[6 - diffDays]++;
                }
            });
        }

        if (activityChartInstance) {
            activityChartInstance.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#9ca3af' : '#6b7280';

        activityChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Login Harian',
                    data: dataCounts,
                    borderColor: '#14b8a6', // brand-500
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#14b8a6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        titleColor: isDark ? '#ffffff' : '#111827',
                        bodyColor: isDark ? '#d1d5db' : '#4b5563',
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor, drawBorder: false },
                        ticks: { color: textColor, stepSize: 1 }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    } catch (e) { console.error("Chart Error:", e); }
}

// -- 2. Profil Drawer 
async function openDrawer(uid) {
    if (!uid) return;
    const drawer = document.getElementById('drawerUserDetail');
    const overlay = document.getElementById('drawerOverlay');
    const content = document.getElementById('drawerContent');
    const loader = document.getElementById('drawerLoading');

    activeDrawerUid = uid;
    
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    content.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const { data: user, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) throw error;
        
        document.getElementById('dl-name').textContent = user.name || 'Unnamed User';
        document.getElementById('dl-id').textContent = user.id;

        const plan = getEffectivePlanStatus(user);
        document.getElementById('dl-plan').textContent = plan.name;
        document.getElementById('dl-plan').className = `px-2 py-0.5 text-xs font-bold uppercase rounded ${getPlanColorClass(plan.name)}`;

        document.getElementById('dl-login-type').textContent = user.allow_multilogin ? 'Multi Login' : 'Single Session';
        document.getElementById('dl-login-type').className = `text-xs font-bold ${user.allow_multilogin ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`;
        document.getElementById('dl-max-device').textContent = user.allow_multilogin ? `${user.max_devices} Perangkat` : '1 Perangkat';
        
        document.getElementById('dl-prem-exp').textContent = formatDate(user.premiumExpiryDate);
        document.getElementById('dl-pro-exp').textContent = formatDate(user.pro_expiry_date);
        document.getElementById('dl-phant-exp').textContent = formatDate(user.phantom_expiry_date);

        document.getElementById('dl-created').textContent = formatDate(user.created_at);
        document.getElementById('dl-last-login').textContent = formatDate(user.last_sign_in);

    } catch(err) {
        console.error(err);
        document.getElementById('dl-name').textContent = 'Profile tidak ditemukan';
    } finally {
        loader.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

function closeDrawer(id) {
    document.getElementById(id).classList.add('translate-x-full');
    document.getElementById('drawerOverlay').classList.add('hidden');
}

// -- 3. Export CSV
function exportTableToCSV(tbodyId, filename) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody || tbody.children.length === 0) return alert("Tidak ada data untuk diekspor.");

    let csv = [];
    const thead = tbody.parentElement.querySelector('thead');
    if (thead) {
        const headers = Array.from(thead.querySelectorAll('th')).map(th => `"${th.innerText.replace(/"/g, '""')}"`);
        csv.push(headers.join(","));
    }

    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
        let row = [];
        Array.from(tr.querySelectorAll('td')).forEach(td => {
            let text = td.innerText.trim().replace(/\n/g, ' - ');
            row.push(`"${text.replace(/"/g, '""')}"`);
        });
        csv.push(row.join(","));
    });

    let csvFile = new Blob(["\uFEFF"+csv.join("\n")], {type: "text/csv;charset=utf-8;"});
    let downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// -- 4. Quick Actions
async function quickActionForceLogout() {
    if(!confirm("âš ï¸ KELUARKAN SEMUA PENGGUNA?\n\nIni akan menendang semua sesi aktif di seluruh perangkat pengguna.\nLanjutkan?")) return;
    try {
        const { error } = await supabaseClient
            .from('user_sessions')
            .delete()
            .neq('id', 0); // Hack to delete all records
        
        if (error) throw error;
        alert("âœ… Seluruh sesi aktif pengguna berhasil dikeluarkan.");
        loadDashboardData();
    } catch (e) {
        alert("Aksi sukses (Jika error, pastikan Delete tanpa WHERE diizinkan RLS).");
    }
}

async function quickActionCreateDummy() {
    const btn = document.getElementById('btnCreateDummy');
    const originalContent = btn.innerHTML;
    try {
        btn.innerHTML = `<span class="flex items-center gap-2"><div class="loader w-3 h-3 hover:border-indigo-500"></div> Memproses...</span>`;
        btn.disabled = true;
        
        const testEmail = `tester${Math.floor(Math.random() * 90000) + 10000}@gracely.test`;
        const testPass = 'Grc88!!Dummy';
        
        const { error } = await supabaseClient.auth.signUp({
            email: testEmail,
            password: testPass,
            options: { data: { full_name: 'Akun Uji Coba' } }
        });
        
        if (error) throw error;
        
        alert(`âœ… Dummy User Dibuat!\nEmail: ${testEmail}\nSandi: ${testPass}`);
        loadDashboardData();
        if(!document.getElementById('panel-users').classList.contains('hidden')) loadUsers();
    } catch (e) { alert("Gagal membuat user dummy: " + e.message); } 
    finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

// -- 5. Notifications CRUD
let cachedNotifications = [];

async function loadNotifications() {
    document.getElementById('notificationsLoading').classList.remove('hidden');
    document.getElementById('notificationsTableBody').innerHTML = '';
    try {
        const { data: notifs, error } = await supabaseClient
            .from('gracely_notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        cachedNotifications = notifs || [];
        const tbody = document.getElementById('notificationsTableBody');
        if (cachedNotifications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-xs text-gray-500">Tidak ada notifikasi sistem di database.</td></tr>`;
            return;
        }

        cachedNotifications.forEach((n, index) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors";
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-xs font-bold text-gray-800 dark:text-gray-200">${n.key_id}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-[10px] font-bold rounded-md bg-gray-100 dark:bg-gray-800 border ${n.type === 'announcement' ? 'border-brand-500 text-brand-600' : 'border-indigo-500 text-indigo-600'}">${n.type.toUpperCase()}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <span class="relative flex h-2.5 w-2.5">
                            ${n.is_enabled ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>` : `<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>`}
                        </span>
                        <span class="text-xs font-bold ${n.is_enabled ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">${n.is_enabled ? 'Aktif Menyiarkan' : 'Dinonaktifkan'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="editNotification(${index})" title="Edit Popup" class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/60 dark:text-blue-400">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
    } catch (e) { console.error(e); } 
    finally { document.getElementById('notificationsLoading').classList.add('hidden'); }
}

function openNotificationModal() {
    document.getElementById('notifId').value = '';
    document.getElementById('notifType').value = 'announcement';
    document.getElementById('notifKeyId').value = '';
    document.getElementById('notifHtmlContent').value = '';
    document.getElementById('notifIsEnabled').checked = true;
    document.getElementById('notifModalTitle').innerHTML = '<i data-lucide="bell" class="w-5 h-5 text-brand-500"></i> Buat Notifikasi Baru';
    lucide.createIcons();
    document.getElementById('modalEditNotification').classList.add('active');
}

function editNotification(index) {
    const data = cachedNotifications[index];
    if(!data) return;
    document.getElementById('notifId').value = data.id;
    document.getElementById('notifType').value = data.type;
    document.getElementById('notifKeyId').value = data.key_id;
    document.getElementById('notifHtmlContent').value = data.html_content || '';
    document.getElementById('notifIsEnabled').checked = data.is_enabled;
    document.getElementById('notifModalTitle').innerHTML = '<i data-lucide="edit-3" class="w-5 h-5 text-brand-500"></i> Edit Notifikasi (' + data.key_id + ')';
    lucide.createIcons();
    document.getElementById('modalEditNotification').classList.add('active');
}

function copyHtmlTemplate() {
    const type = document.getElementById('notifType').value;
    const txt = document.getElementById('notifHtmlContent');
    if (type === 'announcement') {
        txt.value = `<div class="p-4 bg-brand-50 border border-brand-200 rounded-lg text-center">\n  <h4 class="font-bold text-gray-900 mb-2">ðŸŽ‰ Pengumuman Baru</h4>\n  <p class="text-sm text-gray-600">Pesan Anda!</p>\n</div>`;
    } else {
        txt.value = `<div class="notificationModal-content">\n  <i class="fa fa-times close-icon" id="notifictionCloseBtn"></i>\n  <h2 class="title">Info</h2>\n  <button class="action-btn" id="notifictionActionBtn">Buka Layanan</button>\n</div>`;
    }
}

async function saveNotification() {
    const btn = document.getElementById('btnSaveNotif');
    const id = document.getElementById('notifId').value;
    const payload = {
        type: document.getElementById('notifType').value,
        key_id: document.getElementById('notifKeyId').value.trim(),
        html_content: document.getElementById('notifHtmlContent').value,
        is_enabled: document.getElementById('notifIsEnabled').checked
    };

    if(!payload.key_id) return alert("Key ID Wajib!");
    
    const ori = btn.innerHTML;
    btn.innerHTML = 'Menyimpan...';
    btn.disabled = true;

    try {
        let error = null;
        if(id) {
            const res = await supabaseClient.from('gracely_notifications').update(payload).eq('id', id);
            error = res.error;
        } else {
            const res = await supabaseClient.from('gracely_notifications').insert([payload]);
            error = res.error;
        }
        
        if (error) throw error;
        closeModal('modalEditNotification');
        alert("Notifikasi disimpan!");
        loadNotifications();
    } catch (e) { 
        alert("Gagal Menyimpan Data! (Cek RLS/Koneksi):\n" + e.message); 
    } finally { 
        btn.innerHTML = ori;
        btn.disabled = false; 
    }
}

// -- 6. Services Logics
let currentServicePage = 1;

async function loadServices(page = 1) {
    currentServicePage = page;
    const limitInput = document.getElementById('serviceLimitInput');
    const limit = limitInput ? parseInt(limitInput.value) : 10;
    
    const tbody = document.getElementById('servicesTableBody');
    const loading = document.getElementById('servicesLoading');
    if (loading) loading.classList.remove('hidden');
    
    try {
        const fromRow = (page - 1) * limit;
        const toRow = fromRow + limit - 1;
        
        const { data: services, count, error } = await supabaseClient
            .from('gracely_services')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(fromRow, toRow);
            
        if (error) throw error;
        
        tbody.innerHTML = '';
        if (!services || services.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-xs text-gray-500 font-medium">Belum ada layanan eksternal yang dikonfigurasi.</td></tr>`;
            updateServicePagination(0, limit);
            return;
        }

        services.forEach(svc => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors";
            
            const name = svc.name || svc.title || svc.service_name || svc.id || 'Layanan Anonim';
            const isActive = svc.is_active !== undefined ? svc.is_active : (svc.status === 'active' || svc.is_enabled);
            const url = svc.url || svc.endpoint || svc.link || '-';
            
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 dark:text-gray-100">${name}</div>
                    <div class="text-[10px] text-gray-500 font-mono mt-0.5">${svc.id || '-'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <span class="relative flex h-2.5 w-2.5">
                            ${isActive ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>` : `<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>`}
                        </span>
                        <span class="text-xs font-bold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">${isActive ? 'Layanan Tersedia' : 'Sedang Gangguan / Mati'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title="${url}">
                    ${url}
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="alert('Fungsi Edit Layanan (Update Row) Belum Disediakan')" class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/60 dark:text-blue-400">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        updateServicePagination(count, limit);
        lucide.createIcons();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-xs text-red-500 font-medium whitespace-pre-wrap">Gagal memuat tabel:\n${e.message}</td></tr>`;
        console.error("Gagal load layanan: ", e);
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

function updateServicePagination(totalRows, limit) {
    const totalPages = Math.ceil(totalRows / limit) || 1;
    const label = document.getElementById('servicePageLabel');
    if(label) label.textContent = `Halaman ${currentServicePage} / ${totalPages} (${totalRows} total)`;
}

function changeServicePage(dir) {
    // Basic navigation (dir === 1 or -1)
    if(dir === 1) { loadServices(currentServicePage + 1); }
    else if(dir === -1 && currentServicePage > 1) { loadServices(currentServicePage - 1); }
}

function openServiceModal() { alert("Kerangka Modal Tersedia. Tambahkan form HTML jika table schema sudah permanen."); }

// --- Table Explorer (Resizable Columns) ---
function initResizableTables() {
    const tables = document.querySelectorAll('.resizable-table');
    tables.forEach(table => {
        const ths = table.querySelectorAll('thead th');
        ths.forEach(th => {
            if (!th.classList.contains('resizable-th')) {
                th.classList.add('resizable-th');
            }
            if (!th.querySelector('.resizer')) {
                const resizer = document.createElement('div');
                resizer.classList.add('resizer');
                th.appendChild(resizer);
                createResizableColumn(th, resizer);
            }
        });
    });
}

function createResizableColumn(th, resizer) {
    let x = 0;
    let w = 0;

    const mouseDownHandler = function(e) {
        // Hentikan select teks
        e.preventDefault();
        
        x = e.clientX;
        const styles = window.getComputedStyle(th);
        w = parseInt(styles.width, 10);

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        resizer.classList.add('resizing');
    };

    const mouseMoveHandler = function(e) {
        const dx = e.clientX - x;
        th.style.width = `${w + dx}px`;
    };

    const mouseUpHandler = function() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        resizer.classList.remove('resizing');
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
}

