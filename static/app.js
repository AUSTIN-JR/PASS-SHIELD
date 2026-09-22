// --- BACKGROUND PARTICLES ENGINE ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    draw() {
        ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateBackground);
}
animateBackground();

// --- TAB SWITCHING WITH ANIMATION ---
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

// --- PASSWORD VISIBILITY TOGGLE ---
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

// --- SMOOTH TICK COUNTER FOR ENTROPY ---
let currentEntropyDisplay = 0;
function animateValue(target) {
    const obj = document.getElementById('entropy-num');
    const diff = target - currentEntropyDisplay;
    if (diff === 0) return;
    
    currentEntropyDisplay += Math.sign(diff) * Math.ceil(Math.abs(diff) / 5);
    obj.innerText = currentEntropyDisplay;
    
    if (currentEntropyDisplay !== target) {
        requestAnimationFrame(() => animateValue(target));
    }
}

// --- REAL TIME CHECKER WITH SHIELD GLOW & CONFETTI ---
let hasCelebrated = false;
const passwordInput = document.getElementById('password-input');
const logoWrapper = document.getElementById('logo-glow-wrapper');

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

    let poolSize = 0;
    if (hasLow) poolSize += 26;
    if (hasUp) poolSize += 26;
    if (hasNum) poolSize += 10;
    if (hasSym) poolSize += 32;

    let entropy = (pwd.length > 0 && poolSize > 0)
        ? Math.floor(pwd.length * Math.log2(poolSize))
        : 0;

    // Pattern penalties
    const warnings = [];
    if (/(.)\1{2,}/i.test(pwd)) {
        warnings.push('Repeated characters detected (e.g. "aaa")');
        entropy = Math.max(0, entropy - 15);
    }
    if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(pwd)) {
        warnings.push('Sequential characters detected (e.g. "123", "abc")');
        entropy = Math.max(0, entropy - 15);
    }
    if (/(qwerty|asdfgh|zxcvbn|password|admin)/i.test(pwd)) {
        warnings.push('Common keyboard walk or dictionary word detected');
        entropy = Math.max(0, entropy - 25);
    }

    // Warnings Box
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

    // Smooth counter update
    animateValue(entropy);
    document.getElementById('crack-time').innerText = getCrackTime(entropy);

    const score = Math.min(Math.floor((entropy / 80) * 100), 100);
    const meter = document.getElementById('meter-bar');
    meter.style.width = `${score}%`;

    const label = document.getElementById('strength-label');

    if (pwd.length === 0) {
        meter.style.width = '0%';
        meter.style.backgroundColor = 'transparent';
        label.innerText = 'Enter a password';
        logoWrapper.style.filter = 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.35))';
        hasCelebrated = false;
    } else if (score < 30) {
        meter.style.backgroundColor = '#ef4444';
        label.innerText = 'Very Weak';
        logoWrapper.style.filter = 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.7))';
        hasCelebrated = false;
    } else if (score < 55) {
        meter.style.backgroundColor = '#f97316';
        label.innerText = 'Weak';
        logoWrapper.style.filter = 'drop-shadow(0 0 30px rgba(249, 115, 22, 0.7))';
        hasCelebrated = false;
    } else if (score < 75) {
        meter.style.backgroundColor = '#eab308';
        label.innerText = 'Fair';
        logoWrapper.style.filter = 'drop-shadow(0 0 30px rgba(234, 179, 8, 0.7))';
        hasCelebrated = false;
    } else if (score < 90) {
        meter.style.backgroundColor = '#84cc16';
        label.innerText = 'Strong';
        logoWrapper.style.filter = 'drop-shadow(0 0 30px rgba(132, 204, 22, 0.7))';
        hasCelebrated = false;
    } else {
        meter.style.backgroundColor = '#10b981';
        label.innerText = 'Very Strong';
        logoWrapper.style.filter = 'drop-shadow(0 0 35px rgba(16, 185, 129, 0.9))';

        // Trigger Confetti blast on achieving Very Strong
        if (!hasCelebrated && window.confetti) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
            hasCelebrated = true;
        }
    }
});

function updateRule(id, valid) {
    const el = document.getElementById(id);
    const badge = el.querySelector('.badge');
    if (valid) {
        el.classList.add('valid');
        badge.innerText = '✓';
    } else {
        el.classList.remove('valid');
        badge.innerText = '✕';
    }
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

// --- BATCH GENERATOR WITH STAGGER ANIMATION ---
function generateBatch(event) {
    const listContainer = document.getElementById('password-list');
    listContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const pwd = createSinglePassword();
        if (!pwd) return;

        const row = document.createElement('div');
        row.className = 'password-item';
        row.style.animationDelay = `${i * 0.08}s`;
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
    btn.style.background = '#10b981';
    btn.style.color = '#fff';
    setTimeout(() => {
        btn.innerText = 'Copy';
        btn.style.background = '';
        btn.style.color = '';
    }, 1200);
}