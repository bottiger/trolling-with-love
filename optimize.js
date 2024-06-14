// get all images on the page
var images = document.getElementsByTagName('img');
var largeImages = [];
var totalImages = images.length;
var minImageSize = 100;
var isDebug = false;

const Categories = {
	Cage: "cage"
}

var category = Categories.Cage;
var replacementProbability = 0.5; // between 0 and 1
var increase = null; // a Date
var name = "A friend";


function addedProbability(startDate) {
    if (startDate == null)
        return 0;

    daysSinceIncrease = Math.floor((new Date() - increase) / (1000 * 60 * 60 * 24));
    return daysSinceIncrease * 0.01;
}

// find all large visible images (not icons etc) on the page and replace them with another image of the same size
function hashCode(str) {
    return str.split('').reduce((prevHash, currVal) =>
      (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}

function replaceImage(image_url, replacement_urls) {
    // randomly decide whether to replace the image by calculating a hash of the image src and converting this into a random number between 0 and 1
    
    var imgHashVal = Math.abs(hashCode(image_url)) / 2147483648;

    console.log(imgHashVal + ': ' + image_url);

    // from the imgHashVal select on of the images from cageImages. imgHashVal IS NOT between 0 and 1 but needs to be scaled to the length of cageImages
    scaled_hash = (imgHashVal % 1) * (replacement_urls.length - 1);
    image_idx = Math.round(scaled_hash);

    // Handle edge cases (scaled_hash might be slightly out of bounds)
    if (image_idx < 0) {
        image_idx = 0;
    } else if (image_idx >= replacement_urls.length) {
        image_idx = replacement_urls.length - 1;
    }

    var adjustedProbability = Math.min(replacementProbability + addedProbability(increase), 1);
    var doReplace = imgHashVal < adjustedProbability;
    if (doReplace) {
        image_url = replacement_urls[image_idx];
    }

    return image_url;
}

// create an array with all the images of ./images/cage/*.jpg
var replacementImages = [];
for (var i = 1; i <= 9; i++) {
    var imgURL = chrome.extension.getURL('images/cage/nc' + i + '.jpg');
    replacementImages.push(imgURL);
}

function onError(error) {
    console.log(`Error: ${error}`);
  }
  
function onGot(result) {
    // access the values from the result object
    var category = result.category;
    var replacementProbability = result.percentage / 100;
    var increase = result.increase;
    var name = result.name;

    // perform the desired operations using the retrieved values
    console.log("Category: " + category);
    console.log("Percentage: " + replacementProbability);
    console.log("Increase: " + increase);
    console.log("Name: " + name);
}
  
  const getting = browser.storage.sync.get(["category", "percentage", "increase", "name"]);
  getting.then(onGot, onError);

// loop through all images and check if they are large images
for (var i = 0; i < totalImages; i++) {
    if (images[i].offsetWidth > minImageSize && images[i].offsetHeight > minImageSize) {
        largeImages.push(images[i]);
    }
}

// replace all large images with another image
largeImages.forEach(image => {
    image.src = replaceImage(image.src, replacementImages);
});

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
}, 100); // Adjust debounce time as needed

// Create a new MutationObserver instance
const observer = new MutationObserver(handleMutations);

// Start observing changes in the document
observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

// Optionally, set up an Intersection Observer to handle lazy-loaded images

// add a border to the body to indicate that the script has run
if (isDebug) {
    document.body.style.border = "5px solid red";
}