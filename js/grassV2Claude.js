const canvas = document.getElementById("grassCanvas");
const ctx = canvas.getContext("2d");

// Configuration
const CONFIG = {
    grass: {
        numBlades: 700,
        widthMin: 3,
        widthRandomFactor: 3,
        heightMin: 50,
        heightRandomFactor: 50,
        heightNivelling: 10,
        influence: {
            radius: 300,
            maxPush: 20
        }
    },
    ground: {
        heightHard: 14,
        nivellingA: 3,
        nivellingB: 2
    },
    wind: {
        speed: 0.0004
    }
};

// State management
const STATE = {
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    groundHeight: 0,
    groundGradient: null,
    grassBlades: []
};

class GrassBlade {
    constructor(x, height, swayAmount) {
        this.x = x;
        this.y = Math.random() * CONFIG.grass.heightNivelling;
        this.baseHeight = height;
        this.swayAmount = swayAmount;
        this.offset = Math.random() * Math.PI * 2;
        this.width = CONFIG.grass.widthMin + Math.random() * CONFIG.grass.widthRandomFactor;
        // Pre-calculate some values
        this.halfWidth = this.width / 2;
    }

    draw(time) {
        // Performance optimization: Check if blade is visible
        if (this.x + this.width < 0 || this.x - this.width > STATE.width) {
            return; // Skip drawing if off-screen
        }

        const distanceFromMouse = Math.abs(this.x - STATE.mouseX);
        const distanceFactor = Math.max(0, 1 - distanceFromMouse / CONFIG.grass.influence.radius);
        const swayDirection = this.x > STATE.mouseX ? 1 : -1;
        const swayForce = distanceFactor * swayDirection * CONFIG.grass.influence.maxPush;
        const naturalSway = Math.sin(time * CONFIG.wind.speed + this.offset) * this.swayAmount;

        const sway = naturalSway + swayForce;
        const topX = this.x + sway;
        const baseY = canvas.height - this.y;
        const topY = canvas.height - this.baseHeight;
        const midY = canvas.height - this.baseHeight / 2 - this.y;

        // Reuse gradient for similar blades (optimization)
        const gradient = ctx.createLinearGradient(this.x, baseY, topX, topY);
        gradient.addColorStop(0, "darkgreen");
        gradient.addColorStop(1, "lightgreen");

        ctx.beginPath();
        ctx.moveTo(this.x - this.halfWidth, baseY);
        ctx.quadraticCurveTo(this.x + sway, midY, topX, topY);
        ctx.lineTo(this.x + this.halfWidth, baseY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function generateGrass() {
    STATE.grassBlades = [];
    for (let i = 0; i < CONFIG.grass.numBlades; i++) {
        const x = Math.random() * STATE.width;
        const height = CONFIG.grass.heightMin + Math.random() * CONFIG.grass.heightRandomFactor;
        const swayAmount = 8 + Math.random() * 20;
        STATE.grassBlades.push(new GrassBlade(x, height, swayAmount));
    }
}

function drawGround() {
    ctx.fillStyle = STATE.groundGradient;
    ctx.beginPath();
    ctx.moveTo(0, STATE.groundHeight);

    // Optimize by using fewer points when the width is large
    const step = Math.max(5, Math.floor(STATE.width / 200)); // Adaptive step size

    for (let x = 0; x <= STATE.width; x += step) {
        const y = STATE.groundHeight +
            Math.sin(x * 0.02) * CONFIG.ground.nivellingA +
            Math.sin(x * 0.1) * CONFIG.ground.nivellingB;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(STATE.width, STATE.height);
    ctx.lineTo(0, STATE.height);
    ctx.closePath();
    ctx.fill();
}

function updateVisuals() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    STATE.width = canvas.width;
    STATE.height = canvas.height;
    STATE.groundHeight = STATE.height - CONFIG.ground.heightHard;

    STATE.groundGradient = ctx.createLinearGradient(0, STATE.groundHeight, 0, STATE.height);
    STATE.groundGradient.addColorStop(0, "#8B5A2B");
    STATE.groundGradient.addColorStop(1, "#A07850");
}

function initVisuals() {
    updateVisuals();
    generateGrass();

    // Initialize mouse position to center of canvas
    STATE.mouseX = STATE.width / 2;
    STATE.mouseY = STATE.height / 2;
}

// Use a timestamp for better animation consistency
let lastTime = 0;
function animate(timestamp) {
    // Calculate delta time to keep animation consistent regardless of frame rate
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, STATE.width, STATE.height);
    drawGround();

    // Only draw visible grass blades
    for (const blade of STATE.grassBlades) {
        blade.draw(timestamp);
    }

    requestAnimationFrame(animate);
}

function init() {
    initVisuals();
    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener("mousemove", (e) => {
    STATE.mouseX = e.clientX;
    STATE.mouseY = e.clientY;
}, { passive: true });

// Use throttled resize handler for better performance
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initVisuals();
    }, 100);
});

// Export initialization function
export { init };