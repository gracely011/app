const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Built-in in Node 20+

const OLD_PASSWORD = "Dalam_Nama_Tuhan_Yesus";
const NEW_PASSWORD = "kuberserah_selalu_in_GOD";
const TARGET_FILE = path.join(__dirname, '../assets/halo/pro.js');

// --- CRYPTO LOGIC ---
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
            iterations: 100000, 
            hash: "SHA-256" 
        }, 
        keyMaterial, 
        { name: "AES-GCM", length: 256 }, 
        false, 
        ["encrypt", "decrypt"]
    );
}

async function decryptData(dataString, password) {
    try {
        const parsed = JSON.parse(dataString);
        if (!parsed.s || !parsed.i || !parsed.d) throw new Error("Invalid format");

        const salt = Buffer.from(parsed.s, 'base64');
        const iv = Buffer.from(parsed.i, 'base64');
        const ciphertext = Buffer.from(parsed.d, 'base64');

        const key = await getKey(password, salt);
        const decrypted = await crypto.webcrypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv }, 
            key, 
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption failed:", e.message);
        return null;
    }
}

async function encryptData(plainText, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await getKey(password, salt);
    const encrypted = await crypto.webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(plainText)
    );

    const result = {
        s: Buffer.from(salt).toString('base64'),
        i: Buffer.from(iv).toString('base64'),
        d: Buffer.from(encrypted).toString('base64')
    };
    return JSON.stringify(result);
}

// --- MAIN ---
(async () => {
    try {
        console.log(`Reading from: ${TARGET_FILE}`);
        if (!fs.existsSync(TARGET_FILE)) {
            console.error("File not found!");
            process.exit(1);
        }

        const fileContent = fs.readFileSync(TARGET_FILE, 'utf8');
        
        console.log("Attempting to decrypt with OLD password...");
        let decrypted = await decryptData(fileContent, OLD_PASSWORD);
        
        if (!decrypted) {
            console.log("Decryption failed with OLD password. Trying NEW password...");
            decrypted = await decryptData(fileContent, NEW_PASSWORD);
            if (decrypted) {
                console.log("File is ALREADY encrypted with NEW password. No changes needed.");
                process.exit(0);
            } else {
                console.error("FATAL: Could not decrypt file with either password.");
                process.exit(1);
            }
        }

        console.log("Decryption SUCCESS! Encrypting with NEW password...");
        const encrypted = await encryptData(decrypted, NEW_PASSWORD);
        
        fs.writeFileSync(TARGET_FILE, encrypted, 'utf8');
        console.log("SUCCESS: pro.js has been re-encrypted and saved.");

    } catch (e) {
        console.error("Error:", e);
    }
})();
