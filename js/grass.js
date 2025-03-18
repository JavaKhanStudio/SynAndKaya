const canvas = document.getElementById("grassCanvas");
const ctx = canvas.getContext("2d");

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
const windSpeed = 0.0004;

const grassBlades = [];
const grass_NumBlades = 700;
const baseWidth = 1800;

const grass_Width_Min = 3;
const grass_Width_RandomFactor = 3;
const grass_Height_Min = 50;
const grass_Height_RandomFactor = 50;
const grass_Height_nivelling = 10;

const ground_Height_Hard = 14;
const ground_Height_nivelling_A = 3;
const ground_Height_nivelling_B = 2;
let ground_Height;
let ground_Gradient;

let width;
let height;

const influenceRadius = 300; // Larger radius for smoother effect
const maxPush = 20; // Maximum sway push away from mouse

export function init() {
    initVisuals();
    animate(0);
}

function updateVisuals() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width;
    height = canvas.height;

    ground_Height = height - ground_Height_Hard;
    ground_Gradient = ctx.createLinearGradient(0, ground_Height, 0, height);
    ground_Gradient.addColorStop(0, "#8B5A2B");
    ground_Gradient.addColorStop(1, "#A07850");

    grassBlades.length = 0;
}

function initVisuals() {
    updateVisuals();
    generateGrass();
}

class GrassBlade {
    constructor(x, height, swayAmount) {
        this.x = x;
        this.y = Math.random() * grass_Height_nivelling;
        this.baseHeight = height;
        this.swayAmount = swayAmount;
        this.offset = Math.random() * Math.PI * 2;
        this.width = grass_Width_Min + Math.random() * grass_Width_RandomFactor;
    }

    draw(time) {
        let distanceFromMouse = Math.abs(this.x - mouseX);
        let distanceFactor = Math.max(0, 1 - distanceFromMouse / influenceRadius); // Influence fades with distance
        let swayDirection = this.x > mouseX ? 1 : -1; // Push away from mouse
        let swayForce = distanceFactor * swayDirection * maxPush; // Push force scales with proximity
        let naturalSway = Math.sin(time * windSpeed + this.offset) * this.swayAmount;

        const sway = naturalSway + swayForce;
        const topX = this.x + sway;
        const topY = canvas.height - this.baseHeight;

        const gradient = ctx.createLinearGradient(this.x, canvas.height, topX, topY);
        gradient.addColorStop(0, "darkgreen");
        gradient.addColorStop(1, "lightgreen");

        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, canvas.height - this.y);
        ctx.quadraticCurveTo(this.x + sway, canvas.height - this.baseHeight / 2 - this.y, topX, topY);
        ctx.lineTo(this.x + this.width / 2, canvas.height - this.y);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function generateGrass() {
    for (let i = 0; i < grass_NumBlades; i++) {
        let x = Math.random() * canvas.width;
        let height = grass_Height_Min + Math.random() * grass_Height_RandomFactor;
        let swayAmount = 8 + Math.random() * 20;
        grassBlades.push(new GrassBlade(x, height, swayAmount));
    }
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    grassBlades.forEach(blade => blade.draw(time));
    requestAnimationFrame(animate);
}

function drawGround() {
    ctx.fillStyle = ground_Gradient;
    ctx.beginPath();

    ctx.moveTo(0, ground_Height);
    for (let x = 0; x <= width; x += 10) {
        let y = ground_Height + Math.sin(x * 0.02) * ground_Height_nivelling_A + Math.sin(x * 0.1) * ground_Height_nivelling_B;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

canvas.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
});

window.addEventListener('resize', () => {
    initVisuals();
});

init();
