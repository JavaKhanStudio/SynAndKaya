let pattePath = "img/elements/patte.svg";

const zoomModal = document.getElementById('zoomModal');
const zoomImage = document.getElementById('zoomImage');
const zoomCaption = document.getElementById('zoomCaption');
const zoomClose = document.querySelector('.zoom-close');
const zoomPrevBtn = document.getElementById('zoomPrev');
const zoomNextBtn = document.getElementById('zoomNext');

const shadow_offsetY = 5 ;
const shadow_blurRadius = 5 ;

let currentZoomedCarouselId = null;
let currentZoomedIndex = 0;
let carouselsData = [];

let carouselsContainer ;

export function createCarouselFromJSON(carouselJSON, container, complexDisplay = true) {

    carouselsData = carouselsData.concat(carouselJSON);
    carouselsContainer = container ;
    generateCarousels(carouselJSON, complexDisplay);

}

function generateCarousels(carouselsData, complexDisplay) {
    carouselsContainer.innerHTML = '';

    let parser = new DOMParser();

    carouselsData.forEach(carouselData => {
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';
        carouselContainer.id = `carousel-container-${carouselData.id}`;

        if (complexDisplay) {

            const titleContainer = document.createElement('div');
            titleContainer.className = 'carousel-title-container';


            fetch("img/elements/bones/boneV6.svg")
                .then(response => response.text())
                .then(svgData => {
                    let tempDiv = document.createElement("div");
                    tempDiv.innerHTML = svgData.trim();
                    let svgElement = tempDiv.querySelector("svg");

                    if (!svgElement) {
                        console.error("Error: No <svg> found in response");
                        return;
                    }

                    let textElement = svgElement.querySelector("#dogNameText");
                    if (textElement) {
                        textElement.textContent = carouselData.name; // Set dynamic name
                    }

                    titleContainer.appendChild(svgElement);
                })
                .catch(error => console.error("Error loading SVG:", error));

            carouselContainer.appendChild(titleContainer);
        }


        const carousel = document.createElement('div');
        carousel.className = 'carousel';
        carousel.dataset.id = carouselData.id;

        let shadowColor = carouselData.color ? `(${carouselData.color}, 0.3)` : "(0,0,0,0.3)";
        console.log(shadowColor + " " + carouselData.color)
        carousel.style.boxShadow = `0 ${shadow_offsetY}px ${shadow_blurRadius}px rgba${shadowColor}`;

        console.log(carousel) ;

        carousel.onclick = () => {
            const activeItem = carousel.querySelector('.carousel-item.active');
            const activeIndex = activeItem ? parseInt(activeItem.dataset.index) : 0;
            openZoomModal(carouselData.id, activeIndex);
        };

        carouselData.img.forEach((img, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = index === 0 ? 'carousel-item active' : 'carousel-item';
            carouselItem.dataset.index = index;

            const imgContainer = document.createElement('div');
            imgContainer.className = 'carousel-img-container';

            const image = document.createElement('img');
            image.className = 'carousel-img';
            image.src = img.src;
            image.alt = img.name;

            imgContainer.appendChild(image);
            carouselItem.appendChild(imgContainer);

            carousel.appendChild(carouselItem);
        });

        const navContainer = document.createElement('div');
        navContainer.className = 'carousel-nav';

        if(complexDisplay) {
            const prevArrow = document.createElement('div');
            prevArrow.className = carouselData.img.length <= 1 ? 'carousel-arrow disabled' : 'carousel-arrow';
            prevArrow.onclick = (e) => {
                e.stopPropagation();
                navigateCarousel(carouselData.id, 'prev');
            };
            const prevArrowImg = document.createElement('img');
            prevArrowImg.src = pattePath;
            prevArrowImg.alt = "Previous";
            prevArrowImg.style.transform = "rotate(270deg)";
            prevArrow.appendChild(prevArrowImg);

            const nextArrow = document.createElement('div');
            nextArrow.className = carouselData.img.length <= 1 ? 'carousel-arrow disabled' : 'carousel-arrow';
            nextArrow.onclick = (e) => {
                e.stopPropagation();
                navigateCarousel(carouselData.id, 'next');
            };
            const nextArrowImg = document.createElement('img');
            nextArrowImg.src = pattePath;
            nextArrowImg.style.transform = "rotate(90deg)";
            nextArrowImg.alt = "Next";
            nextArrow.appendChild(nextArrowImg);

            navContainer.appendChild(prevArrow);
            navContainer.appendChild(nextArrow);
            carousel.appendChild(navContainer);
        }

        carouselContainer.appendChild(carousel);

        if(complexDisplay) {
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'carousel-pagination';

            carouselData.img.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = index === 0 ? 'carousel-dot active' : 'carousel-dot';
                dot.dataset.index = index;
                dot.onclick = (e) => {
                    e.stopPropagation();
                    navigateCarouselToIndex(carouselData.id, index);
                };
                paginationContainer.appendChild(dot);
            });

            carouselContainer.appendChild(paginationContainer);
        }

        carouselsContainer.appendChild(carouselContainer);
    });
}

// Navigate carousel to specific index
function navigateCarouselToIndex(carouselId, targetIndex) {
    const carousel = document.querySelector(`.carousel[data-id="${carouselId}"]`);
    const items = carousel.querySelectorAll('.carousel-item');
    const dots = carousel.parentElement.querySelectorAll('.carousel-dot');
    const prevArrow = carousel.querySelector('.carousel-nav .carousel-arrow:first-child');
    const nextArrow = carousel.querySelector('.carousel-nav .carousel-arrow:last-child');

    // Update active class on items
    items.forEach((item, index) => {
        if (index === targetIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update pagination dots
    dots.forEach((dot, index) => {
        dot.className = index === targetIndex ? 'carousel-dot active' : 'carousel-dot';
    });

    // Update navigation arrows
    prevArrow.className = targetIndex === 0 ? 'carousel-arrow disabled' : 'carousel-arrow';
    nextArrow.className = targetIndex === items.length - 1 ? 'carousel-arrow disabled' : 'carousel-arrow';
}

// Navigate carousel forward or backward
function navigateCarousel(carouselId, direction) {
    const carousel = document.querySelector(`.carousel[data-id="${carouselId}"]`);
    const items = carousel.querySelectorAll('.carousel-item');

    // Find current index
    let currentIndex = 0;
    items.forEach((item, index) => {
        if (item.classList.contains('active')) {
            currentIndex = index;
        }
    });

    // Calculate target index
    let targetIndex = currentIndex;
    if (direction === 'next' && currentIndex < items.length - 1) {
        targetIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
    }

    navigateCarouselToIndex(carouselId, targetIndex);
}

// Open zoom modal
function openZoomModal(carouselId, imageIndex) {
    // Find the carousel data
    const carouselData = carouselsData.find(data => data.id === carouselId);
    if (!carouselData || !carouselData.img || carouselData.img.length === 0) return;

    // Set the current zoomed carousel and index
    currentZoomedCarouselId = carouselId;
    currentZoomedIndex = imageIndex;

    // Update the zoom modal content
    updateZoomContent();

    // Show the zoom modal
    zoomModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
}

// Update zoom modal content based on current carousel and index
function updateZoomContent() {
    const carouselData = carouselsData.find(data => data.id === currentZoomedCarouselId);
    if (!carouselData) return;

    const image = carouselData.img[currentZoomedIndex];
    zoomImage.src = image.src;
    zoomCaption.textContent = `${carouselData.name} - ${image.name}`;

    // Update zoom nav buttons
    zoomPrevBtn.className = currentZoomedIndex === 0 ? 'zoom-arrow disabled' : 'zoom-arrow';
    zoomNextBtn.className = currentZoomedIndex === carouselData.img.length - 1 ? 'zoom-arrow disabled' : 'zoom-arrow';
}

// Close zoom modal
function closeZoomModal() {
    zoomModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Zoom navigation
function zoomNavigate(direction) {
    const carouselData = carouselsData.find(data => data.id === currentZoomedCarouselId);
    if (!carouselData) return;

    if (direction === 'next' && currentZoomedIndex < carouselData.img.length - 1) {
        currentZoomedIndex++;
    } else if (direction === 'prev' && currentZoomedIndex > 0) {
        currentZoomedIndex--;
    }

    updateZoomContent();
}

// Event listeners for zoom modal
zoomClose.addEventListener('click', closeZoomModal);
zoomModal.addEventListener('click', function(e) {
    if (e.target === zoomModal) {
        closeZoomModal();
    }
});
zoomPrevBtn.addEventListener('click', function() {
    zoomNavigate('prev');
});
zoomNextBtn.addEventListener('click', function() {
    zoomNavigate('next');
});

// Keyboard navigation for zoom modal
document.addEventListener('keydown', function(e) {
    if (!zoomModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeZoomModal();
    } else if (e.key === 'ArrowLeft') {
        zoomNavigate('prev');
    } else if (e.key === 'ArrowRight') {
        zoomNavigate('next');
    }
});
