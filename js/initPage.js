let doggyBubble = null;
let doggyData = null;
let carouselBuilder = null;
const bubbleMap = new Map() ;
const timeBetweenPicture= 9000
export async function loadDoggy() {

    console.log("loadDoggy Ultimate Version!");

    if (!doggyData) {
        doggyData = await loadJson("./js/doggyData.json");
    }

    await addBubbles(doggyData.puppies, "puppies") ;
    await addBubbles(doggyData.parents, "parents") ;
    await addBubbles(doggyData.elders, "elders") ;

    const linesModule = await import('./drawings.js');
    await linesModule.initCanvas(doggyData)
}

async function addBubbles(dogInfos, dogType) {
    if(!carouselBuilder) {
        carouselBuilder = await import('./carouselBuilder.js');
    }

    await carouselBuilder.createCarouselFromJSON(dogInfos, document.querySelector(`#generation-${dogType}`), true);


    dogInfos.forEach(info => {
        let elementID = info.id
        let carouselPart= document.getElementById(`carousel-container-${elementID}`) ;

        let bubble = new Bubble(elementID, carouselPart) ;
        bubbleMap.set(elementID, bubble) ;

        carouselPart.addEventListener('mouseenter', () => {
            bubble.isHovered = true;
        });

        carouselPart.addEventListener('mouseleave', () => {
            bubble.isHovered = false;
        });

    }) ;


}

async function loadJson(path) {
    try {
        const response = await fetch(path);
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}


function Bubble(id, carouselPart) {
    this.id = id;
    this.carousel = carouselPart;
    this.isHovered = false;
    this.internalTimer = null;
    this.animationFrame = null;

    this.startAnimation();
    this.updateFrame(); // Start per-frame update

    carouselPart.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.stopAnimation();
    });

    carouselPart.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.startAnimation();
    });
}

// Function to start the 7-second animation timer
Bubble.prototype.startAnimation = function () {
    if (this.internalTimer) return;

    this.internalTimer = setInterval(() => {
        if (!this.isHovered) {
            this.moveToNextPicture();
        }
    }, timeBetweenPicture);
};

Bubble.prototype.stopAnimation = function () {
    if (this.internalTimer) {
        clearInterval(this.internalTimer);
        this.internalTimer = null;
    }
};

Bubble.prototype.updateFrame = function () {
    this.animationFrame = requestAnimationFrame(() => this.updateFrame());

    if (!this.isHovered) {
        this.update();
    }
};

Bubble.prototype.stopFrameUpdates = function () {
    if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }
};


Bubble.prototype.update = function () {

};

Bubble.prototype.moveToNextPicture = function () {

    let items = this.carousel.querySelectorAll('.carousel-item');
    let currentIndex = 0;
    items.forEach((item, index) => {
        if (item.classList.contains('active')) {
            currentIndex = index;
        }
    });

    if(currentIndex === items.length - 1) {
        carouselBuilder.navigateCarouselToIndex(this.id, 0)
    } else {
        carouselBuilder.navigateCarousel(this.id, 'next');
    }

};
