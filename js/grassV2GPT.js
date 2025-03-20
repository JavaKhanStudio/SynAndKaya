const canvas = document.getElementById("grassCanvas");
const ctx = canvas.getContext("2d");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
const windSpeed = 0.0004;

const grassBlades = [];
const grass_NumBlades = 700;
const influenceRadiusSquared = 300 * 300; // Squared for optimized distance calculation
const maxPush = 20;

const grass_Width_Min = 3;
const grass_Width_RandomFactor = 3;
const grass_Height_Min = 50;
const grass_Height_RandomFactor = 50;
const grass_Height_nivelling = 10;

const ground_Height_Hard = 14;
const ground_Height_nivelling_A = 3;
const ground_Height_nivelling_B = 2;
let ground_Height, ground_Gradient, width, height;

class GrassBlade {
    constructor(x, height, swayAmount) {
        this.x = x;
        this.y = Math.random() * grass_Height_nivelling;
        this.baseHeight = height;
        this.swayAmount = swayAmount;
        this.offset = Math.random() * Math.PI * 2;
        this.width = grass_Width_Min + Math.random() * grass_Width_RandomFactor;

        // Precompute gradient once per blade
        this.gradient = ctx.createLinearGradient(this.x, canvas.height, this.x, canvas.height - this.baseHeight);
        this.gradient.addColorStop(0, "darkgreen");
        this.gradient.addColorStop(1, "lightgreen");
    }

    draw(time) {
        const dx = this.x - mouseX;
        const distanceSquared = dx * dx;
        const distanceFactor = Math.max(0, 1 - distanceSquared / influenceRadiusSquared);
        const swayForce = distanceFactor * maxPush * Math.sign(dx);
        const naturalSway = Math.sin(time * windSpeed + this.offset) * this.swayAmount;
        const sway = naturalSway + swayForce;
        const topX = this.x + sway;
        const topY = canvas.height - this.baseHeight;

        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, canvas.height - this.y);
        ctx.quadraticCurveTo(this.x + sway, canvas.height - this.baseHeight / 2 - this.y, topX, topY);
        ctx.lineTo(this.x + this.width / 2, canvas.height - this.y);
        ctx.closePath();
        ctx.fillStyle = this.gradient;
        ctx.fill();
    }
}

function updateVisuals() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width;
    height = canvas.height;
    ground_Height = height - ground_Height_Hard;

    // Precompute ground gradient
    ground_Gradient = ctx.createLinearGradient(0, ground_Height, 0, height);
    ground_Gradient.addColorStop(0, "#8B5A2B");
    ground_Gradient.addColorStop(1, "#A07850");

    grassBlades.length = 0;
}

function generateGrass() {
    for (let i = 0; i < grass_NumBlades; i++) {
        grassBlades.push(new GrassBlade(
            Math.random() * width,
            grass_Height_Min + Math.random() * grass_Height_RandomFactor,
            8 + Math.random() * 20
        ));
    }
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

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    drawGround();
    grassBlades.forEach(blade => blade.draw(time));
    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    updateVisuals();
    generateGrass();
});

export function init() {
    updateVisuals();
    generateGrass();
    animate(0);

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
    });
}

init();
