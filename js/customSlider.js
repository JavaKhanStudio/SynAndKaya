const slider = document.getElementById("slider");
const handle = document.getElementById("handle");
let dragging = false;
let offsetY = 0;
let autoScrollActive = true;

const scrolling_stepSize = 6;
const autoScrolling_stepSize = -1;
const autoScrolling_stepDelay = 1;

let scrollMomentum = 0;
const scrollDamping = 0.92;

function updateHandlePosition() {
    if (dragging || scrollMomentum !== 0) return; // Prevent interference
    let scrollRatio = document.documentElement.scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
    let handleMaxY = slider.clientHeight - handle.clientHeight;
    let newTop = scrollRatio * handleMaxY;

    requestAnimationFrame(() => {
        handle.style.top = `${newTop}px`;
    });
}

function autoScrollToTop() {
    if (!autoScrollActive) return;

    let speed = autoScrolling_stepDelay;
    let acceleration = 1.01;
    let animationId;

    function scrollStep() {
        if (document.documentElement.scrollTop <= 0) {
            cancelAnimationFrame(animationId);
            return;
        }

        speed *= acceleration;
        document.documentElement.scrollBy(0, -speed);
        updateHandlePosition();
        animationId = requestAnimationFrame(scrollStep);
    }

    animationId = requestAnimationFrame(scrollStep);
}

window.onload = () => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    updateHandlePosition();
    setTimeout(autoScrollToTop, 1000);
};

// ** DRAG HANDLING **
function startDrag(e) {
    dragging = true;
    autoScrollActive = false;
    offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - handle.getBoundingClientRect().top;
    document.body.style.userSelect = "none";
    handle.style.transition = "none";
}

function onDragMove(e) {
    if (!dragging) return;

    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let handleMaxY = slider.clientHeight - handle.clientHeight;
    let newY = clientY - slider.getBoundingClientRect().top - offsetY;
    newY = Math.max(0, Math.min(newY, handleMaxY));

    handle.style.top = `${newY}px`;
    document.documentElement.scrollTop = (newY / handleMaxY) * (document.documentElement.scrollHeight - window.innerHeight);
}

function stopDrag() {
    dragging = false;
    document.body.style.userSelect = "auto";
    handle.style.transition = "top 0.1s ease-out";
}

// ** SCROLLING HANDLING **

document.addEventListener("wheel", (e) => {
    autoScrollActive = false;
    e.preventDefault();
    scrollMomentum += e.deltaY * 0.5; // Sensitivity
    applyScrollMomentum();
}, { passive: false });

function applyScrollMomentum() {
    if (dragging || Math.abs(scrollMomentum) < 0.1) {
        scrollMomentum = 0;
        return;
    }

    let handleMaxY = slider.clientHeight - handle.clientHeight;
    let currentTop = parseFloat(handle.style.top) || 0;
    let newY = Math.max(0, Math.min(currentTop + scrollMomentum, handleMaxY));

    scrollMomentum *= scrollDamping;
    handle.style.top = `${newY}px`;
    document.documentElement.scrollTop = (newY / handleMaxY) * (document.documentElement.scrollHeight - window.innerHeight);

    if (scrollMomentum !== 0) {
        requestAnimationFrame(applyScrollMomentum);
    }
}

document.addEventListener("touchmove", () => {
    autoScrollActive = false;
}, { passive: false });

// ** SMOOTH SCROLL TRACKING (Only when not dragging/momentum) **
function smoothScrollTracking() {
    if (!dragging && scrollMomentum === 0) {
        updateHandlePosition();
    }
    requestAnimationFrame(smoothScrollTracking);
}

smoothScrollTracking();

// ** EVENT LISTENERS **
handle.addEventListener("mousedown", startDrag);
handle.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("mousemove", onDragMove);
document.addEventListener("touchmove", onDragMove, { passive: false });
document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);