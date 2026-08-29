const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const PASSWORD = "kuberserah_selalu_in_GOD";
const ITERATIONS = 100000; // Matches gracely-extension.js (Tool has 10000, but extension uses 100000)

const PATHS = {
    aturhonma: path.join(__dirname, '../aturhonma.js'),
    whitelist: path.join(__dirname, '../whitelist.json'),
    outputAturhonma: path.join(__dirname, '../assets/halo/aturhonma.json'),
    outputWhitelist: path.join(__dirname, '../whitelist.json')
};

// --- CRYPTO FUNCTIONS ---
async function getKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.webcrypto.subtle.importKey(
        "raw", 
        enc.encode(password), 
        { name: "PBKDF2" }, 
        false, 
        ["deriveKey"]
    );
    return await crypto.webcrypto.subtle.deriveKey(
        { 
            name: "PBKDF2", 
            salt: salt, 
            iterations: ITERATIONS, 
            hash: "SHA-256" 
        }, 
        keyMaterial, 
        { name: "AES-GCM", length: 256 }, 
        false, 
        ["encrypt", "decrypt"]
    );
}

async function encryptData(plainDataObj, password) {
    const jsonString = JSON.stringify(plainDataObj);
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await getKey(password, salt);
    const encrypted = await crypto.webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(jsonString)
    );

    return JSON.stringify({
        s: Buffer.from(salt).toString('base64'),
        i: Buffer.from(iv).toString('base64'),
        d: Buffer.from(encrypted).toString('base64')
    });
}

// --- MAIN LOGIC ---
(async () => {
    try {
        console.log("🔒 Starting Automated Encryption...");

        // 1. Process aturhonma.js
        console.log(`Processing: ${PATHS.aturhonma}`);
        if (fs.existsSync(PATHS.aturhonma)) {
            let fileContent = fs.readFileSync(PATHS.aturhonma, 'utf8');
            
            // FIX: 'const' variables in VM are not attached to sandbox.
            // We use Regex to robustly replace 'const/let/var gracelyConfig =' with 'gracelyConfig ='
            // to make it a global property of sandbox.
            const regex = /(?:const|let|var)\s+gracelyConfig\s*=/g;
            if (regex.test(fileContent)) {
                 fileContent = fileContent.replace(regex, 'gracelyConfig =');
                 console.log("✅ Successfully patched variable declaration.");
            } else {
                 console.warn("⚠️ Warning: Could not find 'const gracelyConfig =' pattern. VM execution might fail if variable is not global.");
            }

            // Execute JS in sandbox to extract the object
            const sandbox = {};
            vm.createContext(sandbox);
            try {
                vm.runInContext(fileContent, sandbox);
            } catch (vmErr) {
                console.error("❌ VM Execution Failed:", vmErr);
                process.exit(1);
            }
            
            if (sandbox.gracelyConfig) {
                const encrypted = await encryptData(sandbox.gracelyConfig, PASSWORD);
                
                // OVERWRITE aturhonma.js with Encrypted JSON
                fs.writeFileSync(PATHS.aturhonma, encrypted, 'utf8');
                console.log(`✅ Encrypted and overwrote: ${PATHS.aturhonma}`);
            } else {
                console.error("❌ Could not find 'gracelyConfig' object in aturhonma.js after VM execution.");
                process.exit(1); // Fail the build
            }
        } else {
            console.warn(`⚠️ File not found: ${PATHS.aturhonma}`);
            process.exit(1);
        }

        // 2. Process whitelist.json
        console.log(`Processing: ${PATHS.whitelist}`);
        if (fs.existsSync(PATHS.whitelist)) {
            const content = fs.readFileSync(PATHS.whitelist, 'utf8');
            try {
                const jsonContent = JSON.parse(content);
                
                // Check if already encrypted
                if (jsonContent.s && jsonContent.i && jsonContent.d) {
                    console.log("⚠️ whitelist.json appears to be already encrypted. Skipping.");
                } else {
                    const encryptedWhitelist = await encryptData(jsonContent, PASSWORD);
                    fs.writeFileSync(PATHS.outputWhitelist, encryptedWhitelist, 'utf8');
                    console.log(`✅ Encrypted and overwrote: ${PATHS.outputWhitelist}`);
                }
            } catch (e) {
                console.error("❌ Failed to parse whitelist.json:", e.message);
            }
        } else {
            console.warn(`⚠️ File not found: ${PATHS.whitelist}`);
        }

        console.log("🎉 Encryption tasks completed.");

    } catch (e) {
        console.error("🔥 Fatal Error:", e);
        process.exit(1);
    }
})();
