// Tab Switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'check') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('check-section').classList.add('active');
    } else if (tab === 'generate') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('generate-section').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('learn-section').classList.add('active');
    }
}

// Toggle Visibility
function togglePasswordVisibility() {
    const input = document.getElementById('password-input');
    const btn = document.getElementById('toggle-vis');
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = 'Hide';
    } else {
        input.type = 'password';
        btn.innerText = 'Show';
    }
}

// Real-Time Checker with Pattern Detection
const passwordInput = document.getElementById('password-input');
passwordInput.addEventListener('input', () => {
    const pwd = passwordInput.value;
    
    const hasLen = pwd.length >= 8;
    const hasUp = /[A-Z]/.test(pwd);
    const hasLow = /[a-z]/.test(pwd);
    const hasNum = /\d/.test(pwd);
    const hasSym = /[!@#$%^&*]/.test(pwd);

    updateRule('rule-len', hasLen);
    updateRule('rule-up', hasUp);
    updateRule('rule-low', hasLow);
    updateRule('rule-num', hasNum);
    updateRule('rule-sym', hasSym);

    // Character Pool
    let poolSize = 0;
    if (hasLow) poolSize += 26;
    if (hasUp) poolSize += 26;
    if (hasNum) poolSize += 10;
    if (hasSym) poolSize += 32;

    let entropy = (pwd.length > 0 && poolSize > 0) 
        ? Math.floor(pwd.length * Math.log2(poolSize)) 
        : 0;

    // Pattern Detection
    const warnings = [];
    if (/(.)\1{2,}/i.test(pwd)) {
        warnings.push('Repeated characters detected (e.g., "aaa")');
        entropy = Math.max(0, entropy - 15);
    }
    if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(pwd)) {
        warnings.push('Sequential characters detected (e.g., "123", "abc")');
        entropy = Math.max(0, entropy - 15);
    }
    if (/(qwerty|asdfgh|zxcvbn|password|admin)/i.test(pwd)) {
        warnings.push('Common keyboard walk or dictionary word detected');
        entropy = Math.max(0, entropy - 25);
    }

    // Render Warnings
    const warnBox = document.getElementById('warnings-box');
    const warnList = document.getElementById('warnings-list');
    warnList.innerHTML = '';
    if (warnings.length > 0 && pwd.length > 0) {
        warnings.forEach(w => {
            const li = document.createElement('li');
            li.innerText = w;
            warnList.appendChild(li);
        });
        warnBox.style.display = 'block';
    } else {
        warnBox.style.display = 'none';
    }

    document.getElementById('entropy-label').innerText = `${entropy} bits`;
    document.getElementById('crack-time').innerText = getCrackTime(entropy);

    // Score & Color
    const score = Math.min(Math.floor((entropy / 80) * 100), 100);
    const meter = document.getElementById('meter-bar');
    meter.style.width = `${score}%`;

    const label = document.getElementById('strength-label');
    if (pwd.length === 0) {
        meter.style.width = '0%';
        label.innerText = 'Enter a password';
    } else if (score < 30) {
        meter.style.backgroundColor = '#ef4444';
        label.innerText = 'Very Weak';
    } else if (score < 55) {
        meter.style.backgroundColor = '#f97316';
        label.innerText = 'Weak';
    } else if (score < 75) {
        meter.style.backgroundColor = '#eab308';
        label.innerText = 'Fair';
    } else if (score < 90) {
        meter.style.backgroundColor = '#84cc16';
        label.innerText = 'Strong';
    } else {
        meter.style.backgroundColor = '#10b981';
        label.innerText = 'Very Strong';
    }
});

function updateRule(id, valid) {
    const el = document.getElementById(id);
    if (valid) el.classList.add('valid');
    else el.classList.remove('valid');
}

function getCrackTime(entropy) {
    if (entropy === 0) return 'Instant';
    const seconds = Math.pow(2, entropy) / 1e9;
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
}

// Generate 5 Passwords at Once
function generateBatch() {
    const listContainer = document.getElementById('password-list');
    listContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const pwd = createSinglePassword();
        if (!pwd) return;

        const row = document.createElement('div');
        row.className = 'password-item';
        row.innerHTML = `
            <span>${pwd}</span>
            <button onclick="copySpecific('${pwd}', this)">Copy</button>
        `;
        listContainer.appendChild(row);
    }
}

function createSinglePassword() {
    const len = parseInt(document.getElementById('gen-len').value, 10);
    const incUp = document.getElementById('gen-up').checked;
    const incLow = document.getElementById('gen-low').checked;
    const incNum = document.getElementById('gen-num').checked;
    const incSym = document.getElementById('gen-sym').checked;
    const noAmbig = document.getElementById('gen-no-ambig').checked;

    let upChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let lowChars = 'abcdefghijkmnopqrstuvwxyz';
    let numChars = '23456789';
    let symChars = '!@#$%^&*';

    if (!noAmbig) {
        upChars += 'IO';
        lowChars += 'l';
        numChars += '01';
    }

    let pool = '';
    if (incUp) pool += upChars;
    if (incLow) pool += lowChars;
    if (incNum) pool += numChars;
    if (incSym) pool += symChars;

    if (pool.length === 0) {
        alert('Please select at least one character type!');
        return null;
    }

    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < len; i++) {
        password += pool[array[i] % pool.length];
    }
    return password;
}

function copySpecific(text, btn) {
    navigator.clipboard.writeText(text);
    btn.innerText = 'Copied!';
    setTimeout(() => { btn.innerText = 'Copy'; }, 1200);
}