let doggyBubble = null;
let doggyData = null;
let carouselBuilder = null;
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

    // carouselBuilder.createCarouselFromJSON(dogInfos, document.querySelector(`#generation-${dogType}`), dogType !== "elders");
    carouselBuilder.createCarouselFromJSON(dogInfos, document.querySelector(`#generation-${dogType}`), true);

}

function addBubble(dogInfo, dogType) {

    const clone = doggyBubble.cloneNode(true);
    clone.id = dogInfo.id;
    let name = clone.querySelector(".doggy-name");
    name.textContent = dogInfo.name;

    if (dogType === "puppies") {
        document.querySelector("#generation-puppies").appendChild(clone);
    } else if (dogType === "parents") {
        document.querySelector("#generation-parents").appendChild(clone);
    } else if (dogType === "elders") {
        document.querySelector("#generation-elders").appendChild(clone);
    }
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

async function loadHTML(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }

        let htmlString = await response.text();
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstElementChild;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
