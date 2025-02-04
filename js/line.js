let canvas;
let ctx;


let syn;
let kaya;

let time = 0;

const hearts = new Map();

const darkPink = "#E4565D";
const pink = "#EDA6C6";
const red = "#DB2725";

export function initDrawLines() {
    canvas = document.getElementById("bgCanvas");
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", drawConnections);
    document.addEventListener("DOMContentLoaded", resizeCanvas);
    resizeCanvas();

    syn = document.getElementById("Syn");
    kaya = document.getElementById("Kaya");
    createHeart(kaya, syn);
}



function drawConnections() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawParentConnections(kaya, syn);
    time += 0.01;
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

function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}


const maxSize = 60;

function drawParentConnections(mom, dad) {


    if (mom && dad) {
        const momPos = getElementCenter(mom);
        const dadPos = getElementCenter(dad);
        drawLine(momPos, dadPos);

        const midX = (momPos.x + dadPos.x) / 2;
        const midY = (momPos.y + dadPos.y) / 2;

        const parentsID = createParentId(mom, dad);
        const heartList = hearts.get(parentsID);

        heartList.forEach(layer => {
            layer.size += 0.1;

            if (layer.size > 45) {
                layer.opacity -= 0.01;
                if (layer.opacity < 0) {
                    layer.opacity = 0;
                }
            }
            ctx.globalAlpha = layer.opacity;
            drawHeart(midX, midY, layer.size, layer.color);
        });

        if (heartList[0].size > maxSize) {
            heartList[0].size = 0;
            heartList[0].opacity = 1;
            heartList.push(heartList.shift());
        }


    } else {
        console.log("Element not found");
    }
}

function drawHeart(x, y, size = 60, color = "red") {
    ctx.strokeStyle = "#000000";
    ctx.shadowOffsetX = 2.0;
    ctx.shadowOffsetY = 2.0;
    ctx.lineWidth = 4.0;
    ctx.fillStyle = color;

    const k = x - size / 2;
    const d = size;

    // ✅ Shift up by half the size so it grows from the center
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
    let initialHeart = [new heartLayer(jump * 5, red), new heartLayer(jump * 4, pink), new heartLayer(jump * 3, darkPink), new heartLayer(jump * 2, red), new heartLayer(jump * 1, pink), new heartLayer(jump * 0, darkPink),];
    hearts.set(parentsID, initialHeart);
};

function createParentId(mom, dad) {
    return `${mom.id}-${dad.id}`;
}

function heartLayer(size, color) {
    this.size = size;
    this.color = color;
    this.opacity = 1;
}