const slider = document.getElementById("slider");
const handle = document.getElementById("handle");
let autoScrollActive = false;

const scrolling_stepSize = 6;
const autoScrolling_stepSize = -1;
const autoScrolling_stepDelay = 1;

let scrollMomentum = 0;
const scrollDamping = 0.92;
let dragDirection = 1;

let dragging = false;
let offsetY = 0;

export function initSlider(fromDownToUp = true) {

    smoothScrollTracking();

    if(fromDownToUp) {
        window.onload = () => {
            setTimeout(autoScrollToTop, 1000);
        };
    }

    // ** EVENT LISTENERS **
    handle.addEventListener("mousedown", startDrag);
    document.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", stopDrag);

    document.addEventListener("touchstart", startDrag, { passive: false }); // allow preventDefault if needed
    document.addEventListener("touchmove", onDragMove, { passive: false }); // same
    document.addEventListener("touchend", stopDrag);




    document.addEventListener("wheel", (e) => {
        if (!autoScrollActive) {
            console.log("scrolling")
            scrollMomentum += e.deltaY * 0.5 ;
            applyScrollMomentum();
        }
    }, { passive: true });

}

function updateHandlePosition() {
    if (dragging || scrollMomentum !== 0) return; // Prevent interference

    let scrollRatio = document.documentElement.scrollTop / (document.documentElement.scrollHeight - window.innerHeight) ;
    let handleMaxY = slider.clientHeight - handle.clientHeight;
    let newTop = scrollRatio * handleMaxY;

    requestAnimationFrame(() => {
        handle.style.top = `${newTop}px`;
    });
}

function autoScrollToTop() {
    if (!autoScrollActive) return;
    window.scrollTo(0, document.documentElement.scrollHeight);
    updateHandlePosition();
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

// ** DRAG HANDLING **
function startDrag(e) {
    const target = e.target;
    const isTouch = e.type.startsWith("touch");
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Only start dragging if the handle is touched
    if (handle.contains(target)) {
        // / Drag while touching the handle
        dragDirection = 1 ;

    } else if(!slider.contains(target) && e.touches) {
        // Drag while NOT touching the handle on phone
        dragDirection = -1 ;
        lastTouchY = e.touches[0].clientY;
    } else {
        dragDirection = 0 ;
        return;
    }

    offsetY = clientY - handle.getBoundingClientRect().top;
    dragging = true;
    autoScrollActive = false;


    document.body.style.userSelect = "none";
    handle.style.transition = "none";

}

let lastTouchY = null;

function onDragMove(e) {
    if (!dragging) return;

    const isTouch = e.type.startsWith("touch");
    let clientY = isTouch ? e.touches[0].clientY : e.clientY;
    let newY = 0;

    if (isTouch) {
        if (dragDirection === 1) {
            newY = clientY - slider.getBoundingClientRect().top - offsetY;
        } else {
            const deltaY = clientY - lastTouchY;
            newY = parseInt(handle.style.top, 10) - deltaY;
            lastTouchY = clientY;
        }
    } else {
        newY = clientY - slider.getBoundingClientRect().top - offsetY;
    }

    const handleMaxY = slider.clientHeight - handle.clientHeight;
    newY = Math.max(0, Math.min(newY, handleMaxY));

    handle.style.top = `${newY}px`;
    document.documentElement.scrollTop = (newY / handleMaxY) * (document.documentElement.scrollHeight - window.innerHeight);
}


function stopDrag() {
    dragging = false;
    lastTouchY = 0 ;
}

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

// ** SMOOTH SCROLL TRACKING (Only when not dragging/momentum) **
function smoothScrollTracking() {
    if (!dragging && scrollMomentum === 0) {
        updateHandlePosition();
    }
    requestAnimationFrame(smoothScrollTracking);
}
