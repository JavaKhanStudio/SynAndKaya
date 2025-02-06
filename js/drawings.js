// Used to draw lines and hearts

let canvas;
let ctx;


let syn;
let kaya;
let maman_syn;
let papa_syn;
let maman_kaya;
let papa_kaya;

let time = 0;

//const hearts = new Map();
const heartList = [];

const darkPink = "#E4565D";
const pink = "#EDA6C6";
const red = "#DB2725";

let lines = [];

let lineDistanceBuffer_HoldingMode = 3 ;
let lineDistanceBuffer_GrabbingMode = 40 ;

let foundLine = null;

export function initCanvas() {
    canvas = document.getElementById("bgCanvas");
    ctx = canvas.getContext("2d");

    //window.addEventListener("resize", resizeCanvas);
    //window.addEventListener("scroll", drawConnections);
    document.addEventListener("DOMContentLoaded", resizeCanvas);

    document.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;

        let newFoundLine = null;

        for (let line of lines) {
            let mouseNear = isMouseNearLine(mx, my, line.x1, line.y1, line.x2, line.y2, line.isBeingPulled);

            if (mouseNear) {
                newFoundLine = line;
                line.isBeingPulled = true;

                // 🔥 Continuously update the target pull point
                line.targetPullPoint = { x: mx, y: my };

                if (!line.pullPoint) {
                    line.pullPoint = { x: mx, y: my };
                }
            }
        }

        // If the mouse moves away, stop pulling and start oscillation
        if (foundLine && newFoundLine !== foundLine) {
            foundLine.isBeingPulled = false;
            startOscillation(foundLine);
        }

        foundLine = newFoundLine;
    });

    initConnections() ;
    resizeCanvas();
}

function initConnections() {
    syn = document.getElementById("Syn");
    kaya = document.getElementById("Kaya");

    maman_syn = document.getElementById("Maman_Syn");

    createHeart(kaya, syn);

}

function drawConnections() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //drawParentConnections(kaya, syn);

    heartList.forEach(heart => {
        heart.draw();
    });
    requestAnimationFrame(drawConnections);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawConnections();
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function drawLine(line) {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);

    // Smooth transition between current position and target pull point
    if (line.isBeingPulled) {
        line.pullPoint.x = lerp(line.pullPoint.x, line.targetPullPoint.x, 0.2);
        line.pullPoint.y = lerp(line.pullPoint.y, line.targetPullPoint.y, 0.2);
    }

    let cx = line.isBeingPulled ? line.pullPoint.x : (line.x1 + line.x2) / 2;
    let cy = line.isBeingPulled ? line.pullPoint.y : (line.y1 + line.y2) / 2 + line.offset;

    ctx.quadraticCurveTo(cx, cy, line.x2, line.y2);
    ctx.stroke();
}


const maxSize = 60;

function drawHeart(x, y, size = 60, color = "red") {
    ctx.strokeStyle = "#000000";
    ctx.shadowOffsetX = 2.0;
    ctx.shadowOffsetY = 2.0;
    ctx.lineWidth = 4.0;
    ctx.fillStyle = color;

    const k = x - size / 2;
    const d = size;

    let decalY = y - size / 2;

    ctx.beginPath();
    ctx.moveTo(k, decalY + d / 4);
    ctx.quadraticCurveTo(k, decalY, k + d / 4, decalY);
    ctx.quadraticCurveTo(k + d / 2, decalY, k + d / 2, decalY + d / 4);
    ctx.quadraticCurveTo(k + d / 2, decalY, k + d * 3 / 4, decalY);
    ctx.quadraticCurveTo(k + d, decalY, k + d, decalY + d / 4);
    ctx.quadraticCurveTo(k + d, decalY + d / 2, k + d * 3 / 4, decalY + d * 3 / 4);
    ctx.lineTo(k + d / 2, decalY + d);
    ctx.lineTo(k + d / 4, decalY + d * 3 / 4);
    ctx.quadraticCurveTo(k, decalY + d / 2, k, decalY + d / 4);

    ctx.fill();
    ctx.globalAlpha = 1;
}


const jump = 10;

function createHeart(mom, dad) {
    let parentsID = createParentId(mom, dad);
    const momPos = getElementCenter(mom);
    const dadPos = getElementCenter(dad);
    let heartLayers = [
        new HeartLayer(jump * 5, red),
        new HeartLayer(jump * 4, pink),
        new HeartLayer(jump * 3, darkPink),
        new HeartLayer(jump * 2, red),
        new HeartLayer(jump * 1, pink),
        new HeartLayer(jump * 0, darkPink),];

    const midX = (momPos.x + dadPos.x) / 2;
    const midY = (momPos.y + dadPos.y) / 2;
    // hearts.set(parentsID, heartLayers);
    heartList.push(new Heart(heartLayers, midX, midY, mom, dad, parentsID));
}

function createParentId(mom, dad) {
    return `${mom.id}-${dad.id}`;
}

function HeartLayer(size, color) {
    this.size = size;
    this.color = color;
    this.opacity = 1;
}

function Heart(layers, positionX, positionY, mom, dad) {
    this.layers = layers;
    this.positionX = positionX ;
    this.positionY = positionY ;
    this.parents = [mom, dad] ;

    this.parentsLines = [] ;

    this.parents.forEach(parent => {
        let line = new Line(this.positionX, this.positionY, getElementCenter(parent).x, getElementCenter(parent).y)
        lines.push(line);
        this.parentsLines.push(line);
    });

}

Heart.prototype.draw = function() {

    this.parentsLines.forEach(line => {
        drawLine(line) ;
    }) ;

    this.layers.forEach(layer => {
        layer.size += 0.1;

        if (layer.size > 45) {
            layer.opacity -= 0.01;
            if (layer.opacity < 0) {
                layer.opacity = 0;
            }
        }
        ctx.globalAlpha = layer.opacity;
        drawHeart(this.positionX, this.positionY, layer.size, layer.color);
    });

    if (this.layers[0].size > maxSize) {
        this.layers[0].size = 0;
        this.layers[0].opacity = 1;
        this.layers.push(this.layers.shift());
    }
}

function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.oscillate = false;
    this.offset = 0;
}

function isMouseNearLine(mx, my, x1, y1, x2, y2, toGrab = false) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let px = mx - x1;
    let py = my - y1;

    let dot = px * dx + py * dy;
    let lenSq = dx * dx + dy * dy; // Length squared of the line segment

    let param = lenSq !== 0 ? dot / lenSq : -1;
    param = Math.max(0, Math.min(1, param)); // Clamp between 0 (start) and 1 (end)

    let nearestX = x1 + param * dx;
    let nearestY = y1 + param * dy;
    if(toGrab){
        return Math.hypot(mx - nearestX, my - nearestY) < lineDistanceBuffer_GrabbingMode;
    } else {
        return Math.hypot(mx - nearestX, my - nearestY) < lineDistanceBuffer_HoldingMode;
    }
}



function animateLine(line) {
    function step() {
        if (!line.oscillate) return;
        line.offset += 0.3;
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function startOscillation(line) {
    if (!line) return;

    line.oscillate = true;
    line.time = 0;
    line.damping = 1; // Start with full strength

    function step() {
        if (!line.oscillate) return;

        line.offset = Math.sin(line.time) * 10 * line.damping; // 10px max swing
        line.damping *= 0.98; // Reduce amplitude over time (damping effect)

        if (line.damping < 0.02) {
            line.oscillate = false; // Stop when the vibration is too small
            line.offset = 0;
        } else {
            line.time += 0.2; // Adjust speed of vibration
            requestAnimationFrame(step);
        }
    }
    step();
}
