@echo off
rem ===============================================================================
rem PENGELOLA AKUN ^& SINKRONISASI EKSTENSI GRACELY (AUTO-PROVISIONING RUNTIME)
rem ===============================================================================
rem Skrip cerdas mandiri [All-In-One / Self-Healing] untuk mengelola Login, Logout,
rem Buat Akun Gracely, dan sinkronisasi cookie ke domain draft.gracely.my.id.
rem Jika Node.js belum terpasang di komputer ini, skrip akan otomatis mengunduh
rem Portable Node.js resmi [~35MB] ke folder profil pengguna (Zero-Admin / No UAC).
rem ===============================================================================

setlocal EnableDelayedExpansion
title Pengelola Akun Gracely - Web Downloader ^& Extension Sync
color 0B

:: Pindah ke folder lokasi script berada
cd /d "%~dp0"

set "NODE_CMD="

:: Simpan argumen pertama jika dipanggil via CLI
set "CLI_ARG=%~1"

:: -------------------------------------------------------------------------------
:: 1. PEMERIKSAAN MULTI-TIER RUNTIME NODE.JS
:: -------------------------------------------------------------------------------
:: Tier 1: Periksa PATH sistem global
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "NODE_CMD=node"
    goto CHECK_ENGINE
)

:: Tier 2: Periksa lokasi Program Files standar
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto CHECK_ENGINE
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    goto CHECK_ENGINE
)

:: Tier 3: Periksa Portable Node.js yang pernah diunduh sebelumnya
if exist "%LOCALAPPDATA%\gracely_engine\node.exe" (
    set "NODE_CMD=%LOCALAPPDATA%\gracely_engine\node.exe"
    goto CHECK_ENGINE
)
if exist "%~dp0bin\node.exe" (
    set "NODE_CMD=%~dp0bin\node.exe"
    goto CHECK_ENGINE
)

:: -------------------------------------------------------------------------------
:: 2. TIER 4: AUTO-PROVISIONING PORTABLE NODE.JS (ZERO-ADMIN / NO-UAC)
:: -------------------------------------------------------------------------------
cls
echo ===============================================================================
echo   NODE.JS BELUM TERPASANG DI SISTEM INI [PORTABLE RUNTIME PROVISIONING]
echo ===============================================================================
echo   Agar pengelola akun Gracely dapat berjalan mandiri:
echo   - Melayani local micro-server port 3000 untuk autentikasi offline
echo   - Menjalankan transparent Chromium DNS resolver [draft.gracely.my.id]
echo   - Menyinkronkan session cookies langsung ke Gracely Extension
echo.
echo   Skrip akan mengunduh Portable Node.js resmi [~35MB] secara otomatis
echo   ke folder profil pengguna [%LOCALAPPDATA%\gracely_engine]
echo   TANPA PERLU MENGINSTAL MANUAL DAN TANPA HAK ADMINISTRATOR / UAC WINDOWS.
echo ===============================================================================
echo.
echo Menyiapkan direktori penyimpanan runtime...
if not exist "%LOCALAPPDATA%\gracely_engine" mkdir "%LOCALAPPDATA%\gracely_engine" >nul 2>&1

set "NODE_URL=https://nodejs.org/dist/v20.18.0/win-x64/node.exe"
set "NODE_TARGET=%LOCALAPPDATA%\gracely_engine\node.exe"

echo [*] Mengunduh biner resmi portable node.exe dari nodejs.org...
where curl >nul 2>nul
if %ERRORLEVEL% equ 0 (
    curl -# -L -o "%NODE_TARGET%" "%NODE_URL%"
    goto VERIFY_DOWNLOAD
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13; Write-Host 'Mengunduh via PowerShell...'; (New-Object Net.WebClient).DownloadFile('%NODE_URL%', '%NODE_TARGET%')"

:VERIFY_DOWNLOAD
if exist "%NODE_TARGET%" (
    echo.
    echo [+] Portable Node.js berhasil disiapkan secara otomatis!
    set "NODE_CMD=%NODE_TARGET%"
    ping 127.0.0.1 -n 2 >nul 2>&1
    goto CHECK_ENGINE
)

echo.
echo [ERROR] Gagal mengunduh biner Node.js [Koneksi internet terblokir atau offline].
echo Silakan pastikan koneksi internet aktif atau pasang Node.js dari https://nodejs.org/
echo.
pause
exit /b 1

:: -------------------------------------------------------------------------------
:: 3. SELF-HEALING ENGINE RESOLVER (PORTABILITAS 1 FILE TUNGGAL)
:: -------------------------------------------------------------------------------
:CHECK_ENGINE
set "ENGINE_PATH=%~dp0scripts\gracely_auth_engine.js"
if exist "!ENGINE_PATH!" goto DISPATCH

if exist "D:\DOCUMENT\WEB\Web Downloader\scripts\gracely_auth_engine.js" (
    set "ENGINE_PATH=D:\DOCUMENT\WEB\Web Downloader\scripts\gracely_auth_engine.js"
    goto DISPATCH
)

:: Jika file engine eksternal tidak ditemukan (misal file .bat dibawa sendirian)
echo [*] Menyiapkan modul engine Gracely [Self-Healing Extract]...
if not exist "%LOCALAPPDATA%\gracely_engine" mkdir "%LOCALAPPDATA%\gracely_engine" >nul 2>&1
set "ENGINE_PATH=%LOCALAPPDATA%\gracely_engine\gracely_auth_engine.js"
"!NODE_CMD!" -e "const fs=require('fs');const p=process.argv;const s=fs.readFileSync(p[1],'utf8');const m=['/*===','GRACELY_AUTH_ENGINE','_START===*/'].join('');const code=s.split(m).pop();fs.writeFileSync(p[2],code,'utf8');" "%~f0" "!ENGINE_PATH!"

:DISPATCH
:: Jika ada argumen CLI langsung, bypass menu interaktif
if defined CLI_ARG (
    set "PILIHAN=!CLI_ARG!"
    goto HANDLE_CHOICE
)

:MENU
cls
echo ===============================================================================
echo            PENGELOLA AKUN ^& SINKRONISASI EKSTENSI GRACELY
echo ===============================================================================
echo  Domain Sasaran : draft.gracely.my.id [Lokal Micro-Server Port 3000]
echo  Status Runtime : Siap [!NODE_CMD!]
echo ===============================================================================
echo.
echo  [1] Quick Login 1-Klik [Preset: petrus@admin.com]  [Disarankan]
echo  [2] Login Manual [Gunakan Akun / Sandi Lain]
echo  [3] Buat Akun Baru [Register Form]
echo  [4] Logout Akun Gracely [Hapus Sesi ^& Reset Ekstensi]
echo  [5] Buka Dashboard Gracely [Cek Status Akun ^& Tools]
echo  [6] Pindai Semua Browser ^& Deteksi Ekstensi Gracely
echo  [7] Jalankan Server Port 3000 Saja [Mode Standalone]
echo  [0] Keluar
echo.
echo ===============================================================================
set "PILIHAN="
set /p "PILIHAN=Pilih menu [0-7] lalu tekan ENTER: "

:HANDLE_CHOICE
:: Pangkas spasi dari input
for /f "tokens=1" %%a in ("!PILIHAN!") do set "PILIHAN=%%a"

if "!PILIHAN!"=="1" goto QUICK_LOGIN
if "!PILIHAN!"=="2" goto MANUAL_LOGIN
if "!PILIHAN!"=="3" goto SIGNUP
if "!PILIHAN!"=="4" goto LOGOUT
if "!PILIHAN!"=="5" goto DASHBOARD
if "!PILIHAN!"=="6" goto SCAN_BROWSER
if "!PILIHAN!"=="7" goto RUN_SERVER
if "!PILIHAN!"=="0" goto KELUAR

echo.
echo [!] Pilihan tidak valid, silakan coba lagi...
ping 127.0.0.1 -n 2 >nul 2>&1
if defined CLI_ARG exit /b 1
goto MENU

:QUICK_LOGIN
cls
echo ===============================================================================
echo                  MEMBUKA QUICK LOGIN 1-KLIK GRACELY
echo ===============================================================================
echo [*] Akun Preset     : petrus@admin.com
echo [*] Sandi Preset    : 12345678a
echo [*] Form Login      : Otomatis terisi ^& auto-submit saat Turnstile diverifikasi
echo ===============================================================================
echo.
"!NODE_CMD!" "!ENGINE_PATH!" launch --mode=quick
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:MANUAL_LOGIN
cls
echo ===============================================================================
echo                     MEMBUKA HALAMAN LOGIN MANUAL
echo ===============================================================================
"!NODE_CMD!" "!ENGINE_PATH!" launch --mode=login
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:SIGNUP
cls
echo ===============================================================================
echo                   MEMBUKA FORM PENDAFTARAN AKUN BARU
echo ===============================================================================
"!NODE_CMD!" "!ENGINE_PATH!" launch --mode=signup
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:LOGOUT
cls
echo ===============================================================================
echo                    LOGOUT ^& BERSIHKAN SESI GRACELY
echo ===============================================================================
"!NODE_CMD!" "!ENGINE_PATH!" launch --mode=logout
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:DASHBOARD
cls
echo ===============================================================================
echo                     MEMBUKA DASHBOARD GRACELY
echo ===============================================================================
"!NODE_CMD!" "!ENGINE_PATH!" launch --mode=dashboard
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:SCAN_BROWSER
cls
"!NODE_CMD!" "!ENGINE_PATH!" scan
if defined CLI_ARG exit /b 0
echo.
echo [i] Tekan tombol apa saja untuk kembali ke menu...
pause >nul
goto MENU

:RUN_SERVER
cls
echo ===============================================================================
echo           MICRO-SERVER GRACELY BERJALAN DI LATAR BELAKANG [PORT 3000]
echo ===============================================================================
echo Alamat: http://127.0.0.1:3000/
echo Tekan Ctrl+C untuk menghentikan server kapan saja.
echo ===============================================================================
echo.
"!NODE_CMD!" "!ENGINE_PATH!" server
if defined CLI_ARG exit /b 0
goto MENU

:KELUAR
cls
echo Terima kasih telah menggunakan Pengelola Akun Gracely.
ping 127.0.0.1 -n 2 >nul 2>&1
exit /b 0

:: ===============================================================================
:: EMBEDDED JAVASCRIPT ENGINE PAYLOAD (SELF-HEALING ARCHITECTURE)
:: ===============================================================================
/*===GRACELY_AUTH_ENGINE_START===*/
/**
 * ============================================================================
 * GRACELY AUTH ENGINE & BROWSER LAUNCHER
 * ============================================================================
 * Mesin lokal independen untuk mengelola Login, Logout, Buat Akun Gracely,
 * deteksi browser terinstal, dan sinkronisasi cookie domain draft.gracely.my.id
 * ke Gracely Extension.
 *
 * Fitur Utama:
 * 1. Multi-Browser Scanner: Chrome, Edge, Opera, Opera GX, Brave, Vivaldi.
 * 2. Gracely Extension Detector: Mendeteksi profil mana saja yang terpasang ekstensi.
 * 3. Local Micro HTTP Server (Port 3000): Melayani static assets hai-main antigravity.
 * 4. Transparent Host Resolver Launch: Chromium --host-resolver-rules tanpa ubah hosts file.
 * 5. Quick 1-Click Login: Preset kredensial petrus@admin.com / 12345678a.
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const PORT = 3000;
// Direktori target sumber web hai-main antigravity
const HAI_MAIN_DIR = 'D:\\DOCUMENT\\WEB\\hai-main antigravity';
const ROOT_DIR = fs.existsSync(HAI_MAIN_DIR) ? HAI_MAIN_DIR : path.resolve(__dirname, '..');

const LOCAL_APPDATA = process.env.LOCALAPPDATA || '';
const APPDATA = process.env.APPDATA || '';
const PROGRAM_FILES = process.env.ProgramFiles || 'C:\\Program Files';
const PROGRAM_FILES_X86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.txt': 'text/plain; charset=utf-8'
};

// Konfigurasi Browser
const BROWSER_CONFIGS = [
    {
        name: 'Google Chrome',
        type: 'chromium',
        executables: [
            path.join(PROGRAM_FILES, 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(PROGRAM_FILES_X86, 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(LOCAL_APPDATA, 'Google\\Chrome\\Application\\chrome.exe')
        ],
        userDataDir: path.join(LOCAL_APPDATA, 'Google\\Chrome\\User Data'),
        isSingleProfile: false
    },
    {
        name: 'Microsoft Edge',
        type: 'chromium',
        executables: [
            path.join(PROGRAM_FILES_X86, 'Microsoft\\Edge\\Application\\msedge.exe'),
            path.join(PROGRAM_FILES, 'Microsoft\\Edge\\Application\\msedge.exe'),
            path.join(LOCAL_APPDATA, 'Microsoft\\Edge\\Application\\msedge.exe')
        ],
        userDataDir: path.join(LOCAL_APPDATA, 'Microsoft\\Edge\\User Data'),
        isSingleProfile: false
    },
    {
        name: 'Opera Stable',
        type: 'chromium',
        executables: [
            path.join(LOCAL_APPDATA, 'Programs\\Opera\\opera.exe'),
            path.join(PROGRAM_FILES, 'Opera\\launcher.exe'),
            path.join(PROGRAM_FILES_X86, 'Opera\\launcher.exe')
        ],
        userDataDir: path.join(APPDATA, 'Opera Software\\Opera Stable'),
        isSingleProfile: true
    },
    {
        name: 'Opera GX',
        type: 'chromium',
        executables: [
            path.join(LOCAL_APPDATA, 'Programs\\Opera GX\\opera.exe'),
            path.join(PROGRAM_FILES, 'Opera GX\\launcher.exe')
        ],
        userDataDir: path.join(APPDATA, 'Opera Software\\Opera GX Stable'),
        isSingleProfile: true
    },
    {
        name: 'Brave Browser',
        type: 'chromium',
        executables: [
            path.join(PROGRAM_FILES, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
            path.join(LOCAL_APPDATA, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe')
        ],
        userDataDir: path.join(LOCAL_APPDATA, 'BraveSoftware\\Brave-Browser\\User Data'),
        isSingleProfile: false
    },
    {
        name: 'Vivaldi',
        type: 'chromium',
        executables: [
            path.join(LOCAL_APPDATA, 'Vivaldi\\Application\\vivaldi.exe'),
            path.join(PROGRAM_FILES, 'Vivaldi\\Application\\vivaldi.exe')
        ],
        userDataDir: path.join(LOCAL_APPDATA, 'Vivaldi\\User Data'),
        isSingleProfile: false
    }
];

/**
 * Memindai semua browser dan profil yang terpasang ekstensi Gracely
 */
function scanBrowsers() {
    const results = [];

    BROWSER_CONFIGS.forEach(b => {
        const exeFound = b.executables.find(p => fs.existsSync(p));
        const installed = !!exeFound;
        const profiles = [];

        if (installed && fs.existsSync(b.userDataDir)) {
            const profileDirs = b.isSingleProfile
                ? [b.userDataDir]
                : fs.readdirSync(b.userDataDir)
                    .filter(f => f === 'Default' || f.startsWith('Profile '))
                    .map(f => path.join(b.userDataDir, f));

            profileDirs.forEach(pDir => {
                const pName = b.isSingleProfile ? 'Default' : path.basename(pDir);
                let hasGracely = false;
                let extVersion = '';

                // 1. Cek folder Extensions
                const extDir = path.join(pDir, 'Extensions');
                if (fs.existsSync(extDir)) {
                    try {
                        const exts = fs.readdirSync(extDir);
                        for (const extId of exts) {
                            const extSub = path.join(extDir, extId);
                            if (fs.statSync(extSub).isDirectory()) {
                                const versions = fs.readdirSync(extSub);
                                for (const v of versions) {
                                    const manifestPath = path.join(extSub, v, 'manifest.json');
                                    if (fs.existsSync(manifestPath)) {
                                        try {
                                            const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                                            if (m.name && m.name.toLowerCase().includes('gracely')) {
                                                hasGracely = true;
                                                extVersion = m.version || v;
                                                break;
                                            }
                                        } catch (e) { }
                                    }
                                }
                            }
                            if (hasGracely) break;
                        }
                    } catch (e) { }
                }

                // 2. Cek file Preferences jika unpacked extension
                if (!hasGracely) {
                    const prefPath = path.join(pDir, 'Preferences');
                    if (fs.existsSync(prefPath)) {
                        try {
                            const prefStr = fs.readFileSync(prefPath, 'utf8');
                            if (prefStr.toLowerCase().includes('gracely')) {
                                hasGracely = true;
                                extVersion = 'Terdeteksi di Profil';
                            }
                        } catch (e) { }
                    }
                }

                profiles.push({
                    name: pName,
                    hasGracely: hasGracely,
                    extVersion: extVersion
                });
            });
        }

        results.push({
            name: b.name,
            type: b.type,
            installed: installed,
            exePath: exeFound || null,
            userDataDir: b.userDataDir,
            isSingleProfile: b.isSingleProfile,
            profiles: profiles
        });
    });

    return results;
}

/**
 * Menampilkan laporan tabel scan browser ke terminal
 */
function printScanReport(browsers) {
    console.log('\n===============================================================================');
    console.log('              HASIL DETEKSI BROWSER & EKSTENSI GRACELY');
    console.log('===============================================================================');

    let totalInstalled = 0;
    let totalWithGracely = 0;

    browsers.forEach((b) => {
        if (!b.installed) {
            console.log(`[X] ${b.name.padEnd(18)} : TIDAK TERINSTAL`);
            return;
        }

        totalInstalled++;
        const gracelyProfiles = b.profiles.filter(p => p.hasGracely);
        const hasGracely = gracelyProfiles.length > 0;
        if (hasGracely) totalWithGracely++;

        const statusTag = hasGracely ? '[GRACELY TERPASANG]' : '[BELUM ADA EKSTENSI]';
        console.log(`[+] ${b.name.padEnd(18)} : TERINSTAL -> ${statusTag}`);
        console.log(`    Path Executable: ${b.exePath}`);

        b.profiles.forEach(p => {
            const pStatus = p.hasGracely
                ? `AKTIF (Gracely Extension - ${p.extVersion})`
                : 'Tidak ada ekstensi';
            console.log(`    - Profil [${p.name}]: ${pStatus}`);
        });
    });

    console.log('===============================================================================');
    console.log(`Total Browser Terinstal : ${totalInstalled}`);
    console.log(`Browser Memiliki Gracely: ${totalWithGracely}`);
    console.log('===============================================================================\n');
}

/**
 * Menjalankan Micro HTTP Server
 */
function startServer(onReady) {
    const server = http.createServer((req, res) => {
        try {
            const parsedUrl = url.parse(req.url);
            let pathname = decodeURIComponent(parsedUrl.pathname);

            // API Endpoint untuk Notifikasi Status Logout
            if (pathname === '/api/logout-notify') {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache'
                });
                res.end(JSON.stringify({ success: true, message: 'Sesi akun berhasil dibersihkan.' }));
                console.log('\n[+] Sinyal diterima dari browser: Cookie sesi berhasil dihapus & sinyal ekstensi aktif!');
                return;
            }

            // Routing Clean URL
            if (pathname === '/' || pathname === '') {
                pathname = '/index.html';
            } else if (!path.extname(pathname)) {
                // Cek apakah ada file .html
                if (fs.existsSync(path.join(ROOT_DIR, pathname + '.html'))) {
                    pathname = pathname + '.html';
                }
            }

            const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
            const filePath = path.join(ROOT_DIR, safePath);

            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>404 Not Found</h1><p>File tidak ditemukan: ${pathname}</p>`);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            // CORS & Cache Headers
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error: ' + err.message);
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[i] Port ${PORT} sudah aktif digunakan. Melanjutkan peluncuran browser...`);
            if (typeof onReady === 'function') onReady(null);
        } else {
            console.error('[!] Error server:', err);
        }
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log(`[+] Gracely Local Server aktif di http://127.0.0.1:${PORT}`);
        console.log(`[+] Melayani file dari: ${ROOT_DIR}`);
        if (typeof onReady === 'function') onReady(server);
    });

    return server;
}

/**
 * Meluncurkan browser dengan argumen host-resolver-rules
 */
function launchBrowser(options = {}) {
    const mode = options.mode || 'quick'; // quick, login, signup, logout, dashboard
    const chosenBrowserName = options.browser || '';
    const chosenProfile = options.profile || '';

    const browsers = scanBrowsers();
    const installedBrowsers = browsers.filter(b => b.installed);

    if (installedBrowsers.length === 0) {
        console.error('[!] Tidak ada browser yang terdeteksi di sistem ini!');
        return;
    }

    // Pilih browser terbaik: yang dipilih pengguna atau yang memiliki Gracely Extension
    let targetBrowser = null;
    if (chosenBrowserName) {
        targetBrowser = installedBrowsers.find(b => b.name.toLowerCase().includes(chosenBrowserName.toLowerCase()));
    }
    if (!targetBrowser) {
        // Prioritaskan yang memiliki Gracely
        targetBrowser = installedBrowsers.find(b => b.profiles.some(p => p.hasGracely)) || installedBrowsers[0];
    }

    // Tentukan profil
    let targetProfile = chosenProfile;
    if (!targetProfile && targetBrowser.profiles) {
        const gracelyProfile = targetBrowser.profiles.find(p => p.hasGracely);
        targetProfile = gracelyProfile ? gracelyProfile.name : (targetBrowser.profiles[0]?.name || 'Default');
    }

    // Siapkan URL tujuan
    let targetUrl = '';
    const baseUrl = `http://draft.gracely.my.id:${PORT}`;

    switch (mode) {
        case 'quick':
            // 1-Click Quick Login preset petrus@admin.com / 12345678a
            targetUrl = `${baseUrl}/login.html?quick=1&email=petrus%40admin.com&password=12345678a`;
            break;
        case 'login':
            // Manual Login
            targetUrl = `${baseUrl}/login.html`;
            break;
        case 'signup':
            // Buat Akun
            targetUrl = `${baseUrl}/signup.html`;
            break;
        case 'logout':
            // Logout
            targetUrl = `${baseUrl}/logout.html`;
            break;
        case 'dashboard':
            // Dashboard
            targetUrl = `${baseUrl}/dashboard.html`;
            break;
        default:
            targetUrl = `${baseUrl}/login.html`;
    }

    console.log(`\n===============================================================================`);
    console.log(`[>] Meluncurkan ${targetBrowser.name} (Profil: ${targetProfile})`);
    console.log(`[>] Mode Operasi: ${mode.toUpperCase()}`);
    console.log(`[>] URL Sasaran : ${targetUrl}`);
    console.log(`===============================================================================\n`);

    // Argumen Chromium transparan DNS & Secure Context Override
    const args = [
        `--host-resolver-rules=MAP draft.gracely.my.id 127.0.0.1`,
        `--unsafely-treat-insecure-origin-as-secure=http://draft.gracely.my.id:${PORT},http://draft.gracely.my.id`,
        `--disable-features=HttpsUpgrades,HttpsFirstMode,InsecureConnectionWarning`,
        `--ignore-certificate-errors`,
        `--allow-insecure-localhost`
    ];

    if (!targetBrowser.isSingleProfile && targetProfile) {
        args.push(`--profile-directory=${targetProfile}`);
    }

    args.push(targetUrl);

    startServer(() => {
        try {
            const child = spawn(targetBrowser.exePath, args, {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();

            console.log(`[+] Browser berhasil dibuka!`);
            console.log(`[i] DNS draft.gracely.my.id otomatis dipetakan ke 127.0.0.1:${PORT}`);
            console.log(`[i] Server aktif melayani file di http://draft.gracely.my.id:${PORT}`);
            if (mode === 'logout') {
                console.log(`[i] Halaman logout sedang membersihkan cookie sesi & menyetel sinyal reset.`);
                console.log(`[i] Catatan: Jika browser menampilkan tombol 'Lanjutkan ke situs', silakan klik tombol tersebut.`);
            }
            console.log(`[i] Ekstensi Gracely akan mendeteksi login/logout secara langsung.\n`);

            if (options.keepAlive) {
                console.log(`[i] Server tetap aktif di background. Tekan Ctrl+C untuk keluar.`);
            } else if (process.stdin.isTTY) {
                console.log(`[i] Sesi aktif. Tekan ENTER di jendela ini kapan saja jika sudah selesai untuk kembali ke menu...`);
                const readline = require('readline');
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                rl.question('', () => {
                    console.log('[+] Selesai. Menutup server lokal Gracely...');
                    rl.close();
                    process.exit(0);
                });
            } else {
                setTimeout(() => {
                    console.log(`[+] Selesai. Jendela browser sedang memuat halaman Gracely.`);
                    process.exit(0);
                }, 15000);
            }
        } catch (err) {
            console.error('[!] Gagal meluncurkan browser:', err);
        }
    });
}

// ============================================================================
// CLI DISPATCHER
// ============================================================================
const cliArgs = process.argv.slice(2);
const command = cliArgs[0] || 'scan';

function getArgValue(flag) {
    const match = cliArgs.find(a => a.startsWith(flag + '='));
    return match ? match.split('=')[1].replace(/^["']|["']$/g, '') : null;
}

switch (command) {
    case 'scan': {
        const browsers = scanBrowsers();
        printScanReport(browsers);
        break;
    }
    case 'scan-json': {
        const browsers = scanBrowsers();
        console.log(JSON.stringify(browsers, null, 2));
        break;
    }
    case 'server': {
        startServer();
        break;
    }
    case 'launch': {
        const mode = getArgValue('--mode') || 'quick';
        const browser = getArgValue('--browser') || '';
        const profile = getArgValue('--profile') || '';
        const keepAlive = cliArgs.includes('--keep-alive');
        launchBrowser({ mode, browser, profile, keepAlive });
        break;
    }
    default: {
        console.log(`Penggunaan: node scripts/gracely_auth_engine.js [scan | scan-json | server | launch]`);
        console.log(`Contoh launch: node scripts/gracely_auth_engine.js launch --mode=quick --browser="Chrome"`);
        break;
    }
}
