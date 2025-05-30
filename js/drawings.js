/* Used to draw lines and hearts */

let colorUtils ;
let canvas;
let ctx;
let animationFrameId;

let pulledLines = [];
let currentRunningAnimationId;
let linesListContainers = [];
let lineList = [];
let heartList = [];

let syn;
let taia;
let maman_syn;
let papa_syn;
let maman_taia;
let papa_taia;

let puppy_1 ;
let puppy_2 ;
let puppy_3 ;
let puppy_4 ;
let puppy_5 ;

const darkPink = "#E4565D";
const pink = "#EDA6C6";
const red = "#DC2624";

const green_light = "#52C755" ;
const green_basic = "#43B446" ;
const green_dark = "#33A036" ;
const green_darker = "#248D27" ;

const ConnectionPoint = Object.freeze({
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right"
});

let time = 0;

const heartSize_base = 80;
const heartSize_small = 60;

const heartBaseColor = [darkPink, pink, red, darkPink, pink, red] ;
const lineColorParent = [darkPink, pink, red, pink, darkPink] ;
const lineColorChild = [green_light, green_basic, green_dark, green_darker] ;

const heartGrowthSpeed= 0.08 ;
const heartOpacityReductionSpeed = 0.01 ;
const heartBrakeUpPoint = 0.80 ;

const lineDistanceBuffer_HoldingMode = 3 ;
const lineDistanceBuffer_GrabbingMode = 50 ;
const vibrationSpeed = 0.2;


export async function initCanvas(doggyData) {

    if(!colorUtils) {
        colorUtils = await import('./colorUtils.js');
    }

    canvas = document.getElementById("bgCanvas");
    ctx = canvas.getContext("2d");

    document.addEventListener("DOMContentLoaded", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);


    document.addEventListener("mousemove", (event) => manageLinesInteractions(event));
    document.addEventListener("touchmove", (event) => manageLinesInteractions(event, true));

    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    window.addEventListener("scroll", resizeCanvas);

    initConnections(doggyData);
    updateLineGroup();

    window.onload = () => {
        setTimeout(() => {
            requestAnimationFrame(() => resizeCanvas());
        }, 100);
    };

    resizeCanvas();

}

function waitForElementsToBeInserted(selectors, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const elementsFound = new Set();
        let observer = null; // Ensure observer is declared

        function checkAllElements() {
            selectors.forEach(selector => {
                if (document.querySelector(selector)) {
                    elementsFound.add(selector);
                }
            });

            if (elementsFound.size === selectors.length) {
                if (observer) observer.disconnect(); // Only disconnect if observer exists
                resolve();
            }
        }

        checkAllElements(); // Initial check in case elements are already there

        observer = new MutationObserver(() => {
            checkAllElements();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            if (observer) observer.disconnect(); // Again, only if observer is defined
            if (elementsFound.size !== selectors.length) {
                reject(new Error(`Timeout: Some elements were not inserted`));
            }
        }, timeout);
    });
}

function initConnections(doggyData) {
    resizeCanvas();
    heartList = [];

    waitForElementsToBeInserted(["#" + findContainerName("Puppy_1"),"#" + findContainerName("Papa_Taia"), "#" + findContainerName("Syn")]).then(() => {
        syn = extractReferenceElement("Syn");
        taia = extractReferenceElement("Taia");

        maman_syn = extractReferenceElement("Maman_Syn");
        papa_syn = extractReferenceElement("Papa_Syn");

        maman_taia = extractReferenceElement("Maman_Taia");
        papa_taia = extractReferenceElement("Papa_Taia");

        puppy_1 = extractReferenceElement("Puppy_1");
        puppy_2 = extractReferenceElement("Puppy_2");
        puppy_3 = extractReferenceElement("Puppy_3");
        puppy_4 = extractReferenceElement("Puppy_4");
        puppy_5 = extractReferenceElement("Puppy_5");

        // Connect Puppies to parents
        let couple_taia_syn = createHeart(taia, syn, heartSize_base);
        couple_taia_syn.addChildren(puppy_1, extractColor(doggyData.puppies[0]));
        couple_taia_syn.addChildren(puppy_2, extractColor(doggyData.puppies[1]));
        couple_taia_syn.addChildren(puppy_3, extractColor(doggyData.puppies[2]));
        couple_taia_syn.addChildren(puppy_4, extractColor(doggyData.puppies[3]));
        couple_taia_syn.addChildren(puppy_5, extractColor(doggyData.puppies[4]));

        // Connected Parent to elders
        let parents_syn = createHeart(maman_syn, papa_syn, heartSize_small);
        parents_syn.addChildren(syn, extractColor(doggyData.parents[0]));

        let parents_taia = createHeart(maman_taia, papa_taia, heartSize_small);
        parents_taia.addChildren(taia, extractColor(doggyData.parents[1]));

        heartList.push(couple_taia_syn);
        heartList.push(parents_syn);
        heartList.push(parents_taia);
        updateLineGroup() ;
    })
        .catch(err => console.error(err.message)) ;

}

function extractColor(inputData) {
    return colorUtils.generateColorPaletteFromString(inputData.color) ;
}

function extractReferenceElement(elementID) {
    let reference = document.getElementById(findContainerName(elementID));
    if(!reference) {
        throw new Error("Element " + elementID + " not found");
    }

    return reference ;
}

function findContainerName(elementID) {
    return "carousel-container-" + elementID ;
}


function drawConnections() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lineList.forEach(line => {
        line.draw(line);
    });

    heartList.forEach(heart => {
        heart.draw();
    });

    animationFrameId = requestAnimationFrame(drawConnections);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    heartList.forEach(heart => {
        heart.update() ;
    })

    lineList.forEach(line => {
        line.update() ;
    });

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    drawConnections();
}

const decal = 15 ;

function getElementConnection(element, connectionPoint = ConnectionPoint.TOP) {
    const rect = element.getBoundingClientRect();

    switch (connectionPoint) {
        case ConnectionPoint.TOP:
            return { x: rect.left + rect.width / 2, y: rect.top + decal };
        case ConnectionPoint.BOTTOM:
            return { x: rect.left + rect.width / 2, y: rect.bottom - decal };
        case ConnectionPoint.LEFT:
            return { x: rect.left + decal, y: rect.top + rect.height / 2 };
        case ConnectionPoint.RIGHT:
            return { x: rect.right - decal, y: rect.top + rect.height / 2 };
        default:
            console.warn("Invalid connection point:", connectionPoint);
            return { x: rect.left + rect.width / 2, y: rect.top }; // Default to top
    }
}


/ * SECTION COEUR * /
const maxSize = 60;

function drawHeart(x, y, size = 60, color) {
    ctx.strokeStyle = "#000000";
    ctx.shadowOffsetX = 2.0;
    ctx.shadowOffsetY = 2.0;
    ctx.lineWidth = 4.0;
    ctx.fillStyle = color;

    const k = x - size / 2;
    const d = size;

    let decalY = y - size / 2;

    // 🔥 Subtle deformation factors
    let expandX = size * 0.12; // Widens horizontally
    let expandY = size * 0.12; // Expands height smoothly
    let bottomStretch = size * 0.0001; // Soft bottom tip stretch

    ctx.beginPath();

    // 🔥 Adjusted to be perfectly symmetrical
    ctx.moveTo(k - expandX, decalY + d / 4);
    ctx.quadraticCurveTo(k - expandX, decalY - expandY, k + d / 4, decalY - expandY);
    ctx.quadraticCurveTo(k + d / 2, decalY - expandY * 1.2, k + d / 2, decalY + d / 4);

    ctx.quadraticCurveTo(k + d / 2, decalY - expandY * 1.2, k + d * 3 / 4, decalY - expandY);
    ctx.quadraticCurveTo(k + d + expandX, decalY - expandY, k + d + expandX, decalY + d / 4);
    ctx.quadraticCurveTo(k + d + expandX, decalY + d / 2, k + d * 3 / 4, decalY + d * 3 / 4);

    // 🔥 Balanced bottom tip stretch
    ctx.lineTo(k + d / 2, decalY + d + bottomStretch);
    ctx.lineTo(k + d / 4, decalY + d * 3 / 4);

    ctx.quadraticCurveTo(k - expandX, decalY + d / 2, k - expandX, decalY + d / 4);

    ctx.fill();
    ctx.globalAlpha = 1;
}


// sizeJump is the size difference between the layers of the heart
// Total size is calculated as sizeJump * 6
function createHeart(mom, dad, sizeJump = 10) {

    if(!mom || !dad) {
        throw new Error("Missing parent(s) for heart creation : Is " + (!mom ? "mom" : "dad") + " is missing " );
    }

    return new Heart(sizeJump, heartBaseColor, mom, dad) ;
}

function createHeartLayers(colors , sizeJump) {
    let heartLayers = [];
    for (let i = colors.length - 1; i >= 0; i--) {
        heartLayers.push(new HeartLayer(i * sizeJump, colors[colors.length - 1 - i]));
    }

    return heartLayers;
}


function HeartLayer(size, color) {
    this.size = size;
    this.color = color;
    this.opacity = 1;
}

function Heart(heartSize, colors, mom, dad) {
    this.layers = createHeartLayers(colors, heartSize / colors.length);
    this.positionX = 0 ;
    this.positionY = 0 ;
    this.parents = [mom, dad] ;
    this.maxHeartSize = heartSize ;
    this.parentsLines = [] ;
    this.childrens = [] ;
    this.childrensLines = [] ;
    this.timeDecal = Math.floor(Math.random() * 30);

    for(let i = 0 ; i < this.layers.length ; i++) {
        for(let j = 0 ; j < this.timeDecal ; j++) {
            tickHeartLayer(this.layers[i], this.maxHeartSize);
        }
    }

    this.update() ;

    this.parents.forEach(parent => {
        let line = new Line(this, parent, ConnectionPoint.TOP, lineColorParent, pink)
        this.parentsLines.push(line);
    });

    addNewLineGroup(this.parentsLines, false);
    addNewLineGroup(this.childrensLines, false);
}

Heart.prototype.update = function() {
    const momPos = getElementConnection(this.parents[0],ConnectionPoint.TOP);
    const dadPos = getElementConnection(this.parents[1],ConnectionPoint.TOP);
    this.positionX = (momPos.x + dadPos.x) / 2;
    this.positionY = (momPos.y + dadPos.y) / 2 - (this.maxHeartSize * 0.7);
}

Heart.prototype.addChildren = function(children, connectionColor = lineColorChild) {
    this.childrens.push(children) ;

    let line = new Line(this, children, ConnectionPoint.BOTTOM, connectionColor, connectionColor[0]);
    this.childrensLines.push(line) ;
}

function tickHeartLayer(layer, maxHeartSize) {
    layer.size += heartGrowthSpeed;
    layer.opacity -= 0.0001;
    if (layer.size > maxHeartSize * heartBrakeUpPoint) {
        layer.opacity -= heartOpacityReductionSpeed;
        if (layer.opacity < 0) {
            layer.opacity = 0;
        }
    }
}

Heart.prototype.draw = function() {

    this.layers.forEach(layer => {
        tickHeartLayer(layer, this.maxHeartSize);
        ctx.globalAlpha = layer.opacity;
        drawHeart(this.positionX, this.positionY, layer.size, layer.color);
    });

    ctx.globalAlpha = 1;
    if (this.layers[0].size > this.maxHeartSize) {
        this.layers[0].size = 0;
        this.layers[0].opacity = 1;
        this.layers.push(this.layers.shift());
    }
}


// SECTION LINES
function Line(from, too, connectionPoint = ConnectionPoint.TOP, colorSource, colorBorder = "#000000") {
    this.oscillate = false;
    this.offset = 0;
    this.isBeingPulled = false;
    this.targetPullPoint = { x: 0, y: 0 };
    this.pullPoint = { x: 0, y: 0 };

    this.from = from;
    this.too = too ;
    this.connectionPoint = connectionPoint ;
    this.colorSource = colorSource ;
    this.colorBorder = colorBorder ;

    this.x1 = 0 ;
    this.x2 = 0 ;
    this.y1 = 0 ;
    this.y2 = 0 ;

    this.update();

    this.fuseX = this.x1 - this.x2 ;
    this.fuseY = this.y1 - this.y2 ;

    this.gradientStops = colorSource.map((color, index) => ({
        offset: index / (colorSource.length - 1),
        color
    }));
}

Line.prototype.update = function() {
    this.x1 = this.from.positionX  ;
    this.y1 = this.from.positionY ;

    let tooPos = getElementConnection(this.too, this.connectionPoint);

    this.x2  = tooPos.x ;
    this.y2 = tooPos.y ;

    if(this.fuseY > 0) {
        this.fuseY = this.fuseY-1 ;
    }

}

Line.prototype.updateGradientStops = function(speed = 0.005) {
    this.gradientStops.forEach(stop => {
        stop.offset += speed;
        if (stop.offset > 1) stop.offset -= 1; // Loop colors back around
    });

    // Ensure order is maintained
    this.gradientStops.sort((a, b) => a.offset - b.offset);
};

Line.prototype.getGradient = function() {
    let gradient = ctx.createLinearGradient(this.x1, this.y1, this.x2, this.y2);
    this.gradientStops.forEach(stop => {
        gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
};

Line.prototype.draw = function(){
    this.updateGradientStops(0.0005);
    this.update() ;

    if (this.isBeingPulled) {
        let springStrength = 0.05;  // How stretchy the string is
        let dampingFactor = 0.85;   // Prevents infinite bouncing

        let dx = this.targetPullPoint.x - this.pullPoint.x;
        let dy = this.targetPullPoint.y - this.pullPoint.y;

        if (!this.hasBeenPulledBefore) {
            this.velocityX = 0;
            this.velocityY = 0;
            this.hasBeenPulledBefore = true;
        }

        this.pullPoint.x = lerp(this.pullPoint.x, this.targetPullPoint.x, 0.2);
        this.pullPoint.y = lerp(this.pullPoint.y, this.targetPullPoint.y, 0.2);

        this.velocityX += dx * springStrength;
        this.velocityY += dy * springStrength;

        this.velocityX *= dampingFactor;
        this.velocityY *= dampingFactor;

        this.pullPoint.x += this.velocityX;
        this.pullPoint.y += this.velocityY;
    } else {
        this.hasBeenPulledBefore = false;
    }

    let cx = this.isBeingPulled ? this.pullPoint.x : (this.x1 + this.x2) / 2 + this.offset;
    let cy = this.isBeingPulled ? this.pullPoint.y : (this.y1 + this.y2) / 2 + this.offset;

    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.strokeStyle = this.colorBorder;
    ctx.lineWidth = 6;
    ctx.quadraticCurveTo(cx, cy, this.x2, this.y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.strokeStyle = this.getGradient();
    ctx.lineWidth = 4;
    ctx.quadraticCurveTo(cx, cy, this.x2, this.y2);

    ctx.stroke();
}


function generateColor(line, numberStages) {
    let color = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
    for (let i = 0; i < numberStages.length; i++) {
        color.addColorStop(i / numberStages.length, numberStages[i]);
    }

    return color;
}

function generateAnimatedGradient(line, colors, speed = 0.01) {
    let gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
    let colorStops = colors.map((color, index) => ({
        offset: index / (colors.length - 1),
        color
    }));

    function updateGradient() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Shift offsets to create movement
        colorStops.forEach(stop => stop.offset = (stop.offset + speed) % 1);

        // Ensure stops remain in order
        colorStops.sort((a, b) => a.offset - b.offset);

        let newGradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
        colorStops.forEach(stop => newGradient.addColorStop(stop.offset, stop.color));

        ctx.strokeStyle = newGradient;

        // Redraw the line
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        requestAnimationFrame(updateGradient);
    }

    updateGradient();
    return gradient ;
}



function isMouseNearLine(mx, my, x1, y1, x2, y2, toGrab = false) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let px = mx - x1;
    let py = my - y1;

    let dot = px * dx + py * dy;
    let lenSquared = dx * dx + dy * dy;

    let param = lenSquared !== 0 ? dot / lenSquared : -1;
    param = Math.max(0, Math.min(1, param)); // Clamp between 0 (start) and 1 (end)

    let nearestX = x1 + param * dx;
    let nearestY = y1 + param * dy;
    if(toGrab){
        return Math.hypot(mx - nearestX, my - nearestY) < lineDistanceBuffer_GrabbingMode;
    } else {
        return Math.hypot(mx - nearestX, my - nearestY) < lineDistanceBuffer_HoldingMode;
    }
}

function getNearestPointOnLine(mx, my, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let px = mx - x1;
    let py = my - y1;

    let dot = px * dx + py * dy;
    let lenSq = dx * dx + dy * dy; // Length squared of the line segment

    let param = lenSq !== 0 ? dot / lenSq : -1;

    // Reduce extreme clamping to avoid teleportation near endpoints
    // Clamp between 0.1 (start) and 0.9 (end)
    param = Math.max(0.1, Math.min(0.9, param));

    let nearestX = x1 + param * dx;
    let nearestY = y1 + param * dy;

    return { nearestX, nearestY };
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}


function startOscillation(line) {
    if (!line) return;

    line.oscillate = true;
    line.time = 0;
    line.damping = 1; // Start with full strength (= 1)

    function step() {
        if (!line.oscillate) return;

        line.offset = Math.sin(line.time) * 10 * line.damping; // 10px max swing
        line.damping *= 0.98; // Reduce amplitude over time (damping effect)

        if (line.damping < 0.01) {
            line.oscillate = false; // Stop when the vibration is too small
            line.offset = 0;
        } else {
            line.time += vibrationSpeed;
            requestAnimationFrame(step);
        }
    }
    step();
}


function manageLinesInteractions(event, isTouch = false) {
    const rect = canvas.getBoundingClientRect();
    let mx, my;

    if (isTouch) {
        const touch = event.touches[0]; // Get the first touch point
        mx = touch.clientX - rect.left;
        my = touch.clientY - rect.top;
    } else {
        mx = event.clientX - rect.left;
        my = event.clientY - rect.top;
    }

    let inPullRangeLines = [];

    for (let line of lineList) {
        let mouseNear = isMouseNearLine(mx, my, line.x1, line.y1, line.x2, line.y2, line.isBeingPulled);

        if (mouseNear) {
            inPullRangeLines.push(line);

            if (!line.isBeingPulled) {
                let { nearestX, nearestY } = getNearestPointOnLine(mx, my, line.x1, line.y1, line.x2, line.y2);
                line.pullPoint = { x: nearestX, y: nearestY };
                line.grabDirection = (mx < nearestX) ? "left" : "right";
                line.startGrab = { x: mx, y: my };
            }

            let hasPassedSide = (line.grabDirection === "left" && mx >= line.startGrab.x) ||
                (line.grabDirection === "right" && mx <= line.startGrab.x);

            if (hasPassedSide || line.isBeingPulled) {
                line.isBeingPulled = true;
                line.targetPullPoint = { x: mx, y: my };

                if (!line.pullPoint) {
                    line.pullPoint = { x: line.targetPullPoint.x, y: line.targetPullPoint.y };
                }
            }
        }
    }

    pulledLines.forEach(pulledLine => {
        if (!inPullRangeLines.includes(pulledLine)) {
            pulledLine.isBeingPulled = false;
            startOscillation(pulledLine);
        }
    });

    pulledLines = inPullRangeLines;
}

function handleTouchEnd(event) {
    if (event.touches.length > 0) return;

    pulledLines.forEach(line => {
        line.isBeingPulled = false;
        startOscillation(line);
    });

    pulledLines = [];
}


function addNewLineGroup(newGroup, update = true) {
    linesListContainers.push(newGroup);
    if(update) {
        updateLineGroup();
    }
}

function removeLineGroup(groupToRemove, update = true) {
    linesListContainers = linesListContainers.filter(group => group !== groupToRemove);
    if(update) {
        updateLineGroup();
    }
}

function updateLineGroup() {
    lineList = linesListContainers.flat();
}

/ * SECTION SLIDER * /
