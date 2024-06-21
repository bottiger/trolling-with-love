//import * as Settings from './settings.js';

const CategoryEnum = Object.freeze({
    Cage: 'cage',
    Pony: 'ponies'
});

var minImageSize = 100;

var category = CategoryEnum.Cage;
var replacementProbability = 0.01; // between 0 and 1
var increase = null; // a Date

var isDebug = false;

var cachedTotalProbability = null;

// add a border to the body to indicate that the script has run
if (isDebug) {
    document.body.style.border = "5px solid red";
}

// get all images on the page
var images = document.getElementsByTagName('img');
var largeImages = [];
var totalImages = images.length;

var replacementImages = [];

function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
    }
    return hash >>> 0;
}

function murmurhash3_32_gc(key, seed) {
    let remainder, bytes, h1, h1b, c1, c2, k1, i;
    
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;
    
    while (i < bytes) {
        k1 = 
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(++i) & 0xff) << 8) |
          ((key.charCodeAt(++i) & 0xff) << 16) |
          ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        
        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = (((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);
        
        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = (((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
}

// DJB2 hash function
function djb2Hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    }
    return hash >>> 0; // Ensure non-negative integer
}

// Function to scale the hash to a number between 0 and 1
function scaleHashToNumber(hash) {
    return hash / 0xFFFFFFFF;
}

// Function to pick a random element from the array using imgHashVal
function pickRandomElement(replacement_urls, imgIndex) {
    return replacement_urls[imgIndex];
}


function addedProbability(startDate) {
    if (startDate == null)
        return 0;

    daysSinceIncrease = Math.floor((new Date() - new Date(increase)) / (1000 * 60 * 60 * 24));
    return daysSinceIncrease * 0.01;
}

function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

function replaceImage(image_url, replacement_urls) {

    var imgHashVal = scaleHashToNumber(murmurhash3_32_gc(image_url, 0x12399678));

    if (isDebug)
        console.log(imgHashVal + ': ' + image_url);

    if (!isNumber(cachedTotalProbability)) {
        cachedTotalProbability = Math.min(replacementProbability + addedProbability(increase), 1);
    }

    var doReplace = imgHashVal < cachedTotalProbability;

    if (!doReplace) {
        return image_url;
    }

    var newImageIdx = cachedTotalProbability > 0 ? (imgHashVal / cachedTotalProbability) * replacement_urls.length : 0;
    newImageIdx = Math.floor(newImageIdx);
    
    console.log("imgHashVal" + imgHashVal + " scaled: " + (imgHashVal / cachedTotalProbability) +  " New image idx: " + newImageIdx + " cachedTotalProbability: " + cachedTotalProbability);
    
    return pickRandomElement(replacement_urls, newImageIdx);
}

function onError(error) {
    console.log(`Error: ${error}`);
  }
  
function onGot(result) {
    console.log(`onGot: ${result}`);

    // access the values from the result object
    category = result.category;
    replacementProbability = result.percentage / 100;
    increase = result.increase;
    var name = result.name;

    // perform the desired operations using the retrieved values
    console.log("Category: " + category);
    console.log("Percentage: " + replacementProbability);
    console.log("Increase: " + increase);
    console.log("Name: " + name);

    // create an array with all the images of ./images/cage/*.jpg
    for (var i = 1; i <= 9; i++) {
        var imgURL = "";
        if (category == CategoryEnum.Cage)  {
            imgURL = chrome.runtime.getURL('images/cage/nc' + i + '.jpg');
        } else {
            imgURL = chrome.runtime.getURL('images/ponies/pony' + i + '.jpg');
        }
        replacementImages.push(imgURL);
    }

    // replace all large images with another image
    largeImages.forEach(image => {
        image.src = replaceImage(image.src, replacementImages);
    });
}
  
  const getting = browser.storage.sync.get(["category", "percentage", "increase", "name"]);
  getting.then(onGot, onError);

// loop through all images and check if they are large images
for (var i = 0; i < totalImages; i++) {
    if (images[i].offsetWidth > minImageSize && images[i].offsetHeight > minImageSize) {
        largeImages.push(images[i]);
    }
}

// Debounce function to limit the rate of operation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// Function to handle mutations
const handleMutations = debounce((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the node itself is an img
                    if (node.tagName.toLowerCase() === 'img') {
                        node.src = replaceImage(node.src, replacementImages);
                    } else {
                        // Check if it contains img elements
                        const imgs = node.getElementsByTagName('img');
                        for (const img of imgs) {
                            img.src = replaceImage(img.src, replacementImages);
                        }
                    }
                }
            }
        } else if (mutation.type === 'attributes' && mutation.target.tagName.toLowerCase() === 'img') {
            mutation.target.src = replaceImage(mutation.target.src, replacementImages);
        }
    }
}, 250); // Adjust debounce time as needed

// Create a new MutationObserver instance
const observer = new MutationObserver(handleMutations);

// Start observing changes in the document
observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

// Optionally, set up an Intersection Observer to handle lazy-loaded images
