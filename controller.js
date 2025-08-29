/* ===============================
         Catalog definition
      =============================== */

const catalog = {
    base: "img/base.png",
    bras: {
        title: "Bras",
        icon: "img/icons/bras.png",
        items: [
            {
                thumb: "img/icons/bras/bra_1_icon.png",
                image: "img/bras/bra_1.png",
            },
            {
                thumb: "img/icons/bras/bra_2_icon.png",
                image: "img/bras/bra_2.png",

            }
        ]
    },
    panties: {
        title: "Panties",
        icon: "img/icons/panties.png",
        items: [
            {
                thumb: "img/icons/panties/panties_1_icon.png",
                image: "img/panties/panties_1.png",

            },
            {
                thumb: "img/icons/panties/panties_2_icon.png",
                image: "img/panties/panties_2.png",

            }
        ]
    },
    tops: {
        title: "Tops",
        icon: "img/icons/tops.png",
        items: [
            {
                thumb: "img/icons/tops/top_1_icon.png",
                image: "img/tops/top_1.png",

            },
            {
                thumb: "img/icons/tops/top_2_icon.png",
                image: "img/tops/top_2.png",

            }
        ]
    },
    bottoms: {
        icon: "img/icons/tops.png",
        items: [
            {
                image: "img/tops/top_1.png"
                , thumb: ""
            },
            { image: "img/tops/top_2.png" }
        ]
    },
    outfits: {
        icon: "img/icons/tops.png",
        items: [
            { image: "img/tops/top_1.png" },
            { image: "img/tops/top_2.png" }
        ]
    },
    accessories: {
        icon: "img/icons/tops.png",
        items: [
            { image: "img/tops/top_1.png" },
            { image: "img/tops/top_2.png" }
        ]
    }
};


const itemCache = {}
const order = []



function init() {
    buildTabs();
    buildMenuItems(activeTab);
    initStage()
}

/* ===============================
   UI building
=============================== */

const tabs = $("#tabs");
const itemsContainer = $("#itemsContainer");
var activeTab = null;

function buildTabs() {
    for (const key in catalog) {

        if (key == "base") continue;

        const btn = $("<button>").attr("data-cat", key);
        //alert(btn)
        btn.append($("<img>").attr("src", catalog[key].icon).attr("alt", key));
        tabs.append(btn);
    }

    tabs.find("button").first().addClass("active");
    activeTab = tabs.find("button").first().data("cat");

    tabs.on("click", "button", function () {
        const $btn = $(this);
        if ($btn.hasClass("active")) return;
        tabs.find("button").removeClass("active");
        $btn.addClass("active");
        activeTab = $btn.data("cat");

        buildMenuItems(activeTab);
    });
}

function buildMenuItems(category) {
    itemsContainer.empty();

    catalog[category].items.forEach((itemInfo, idx) => {
        const id = `${category}-${idx}`;
        const img = $("<img class='item-thumb'>")
            .attr("src", itemInfo.image)
            .attr("data-id", id)
            .attr("alt", `${category} ${idx}`);
        itemsContainer.append(img);

        img.on("click", (event) => {
            if (img.hasClass("used")) {
                removeItem(itemInfo)

                img.removeClass("used")
            }
            else {
                placeItem(itemInfo)
                img.addClass("used")
            }
        })
    });
}

/* ===============================
   Canvas operations
=============================== */

const canvas = $("#stage").get(0);
const container = document.querySelector('#stageContainer');
const context = canvas.getContext('2d')

const base = new Image()


function initStage() {

    //set up base image
    base.onload = () => {
        console.log('Base image loaded!');

        canvas.width = base.naturalWidth;
        canvas.height = base.naturalHeight;


        itemCache[base.src] = base;


        drawOrder();
    };

    base.onerror = () => {
        console.error("Failed to load the base image.");
    };

    base.src = catalog.base;

    //canvas setting
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas()

}

function resizeCanvas() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageAspectRatio = base.naturalWidth / base.naturalHeight;

    let newWidth, newHeight;

    if (containerWidth / containerHeight > imageAspectRatio) {

        newHeight = containerHeight;
        newWidth = newHeight * imageAspectRatio;
    } else {

        newWidth = containerWidth;
        newHeight = newWidth / imageAspectRatio;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    drawOrder();
}

//example data = {thumb: "/img/path/test.png", image: "/img/path/actualImage.png"  }
function placeItem(data) {
    const imageUrl = data.image;

    // Add the image URL to the end of our drawing order
    order.push(imageUrl);

    // If the image isn't already loaded, load it now
    if (!itemCache[imageUrl]) {
        let img = new Image();
        img.onload = () => {
            console.log(`Loaded and cached: ${imageUrl}`);
            // Store the loaded image object in our cache
            itemCache[imageUrl] = img;

            drawOrder();
        };
        img.src = imageUrl;
    } else {

        drawOrder();
    }
}

function removeItem(data) {
    let i = order.indexOf(data.image);
    if (i < 0) {
        console.error("Element to be removed not in stack order:\n" + JSON.stringify(data));
        return;
    }

    order.splice(i, 1);

    drawOrder();
}

function drawOrder() {

    // 1. Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the base image (it's guaranteed to be in the cache by now)
    context.drawImage(base, 0, 0);

    // 3. Loop through the order and draw each item
    //    Use for...of to get the actual image URL (the value)
    for (const imageUrl of order) {

        // Get the pre-loaded image from our cache
        const img = itemCache[imageUrl];

        // If the image exists in the cache (it should!), draw it.
        // This check prevents errors if an image hasn't finished loading yet.
        if (img) {
            // This is now a synchronous operation, guaranteeing correct order
            context.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw it to fit the canvas
        }
    }
    console.log("Canvas redrawn. Current order:", order);

}

