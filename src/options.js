import { calculateCurrentProbability } from './shared.js';

var categoriesNames = [
  { value: "cage", text: 'Nicolas Cage' },
  { value: "ponies", text: 'Ponies' }
];

function saveOptions(e) {
    e.preventDefault();
    console.log(`Storing values`);
    browser.storage.sync.set({
      category:     document.querySelector("#category").value,
      percentage:   document.querySelector("#percentage").value,
      increase:     document.querySelector("#increase").checked ? new Date() : null,
      name:         document.querySelector("#name").value,
    });
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      
      console.log(`Restoring values`);
      // Populate category options
      const categorySelect = document.querySelector("#category");

      categorySelect.innerHTML = ""; // Clear existing options
      categoriesNames.forEach(category => {
        const option = document.createElement("option");
        option.value = category.value;
        option.text = category.text;
        categorySelect.appendChild(option);
      });
    
      // Set values from storage
      categorySelect.value = result.category || categoriesNames[0].value;

      document.querySelector("#percentage").value = result.percentage || 1;
      document.querySelector("#increase").checked = result.increase ? true : false;
      document.querySelector("#name").value = result.name || "A Friend";

      const increaseDescElement = document.getElementById('increase_desc');
          
      // Check if result.increase is a valid date and not null
      if (result.increase && !isNaN(Date.parse(result.increase))) {
        const increaseDate = new Date(result.increase);
        const currentDate = new Date();
      
        // Calculate the number of days (n) between the increase date and the current date
        const timeDiff = Math.abs(currentDate - increaseDate);
        const n = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days

        // Placeholder values for x and p, these should be calculated based on your logic
        const x = 1; // Function to calculate the daily increase percentage
        const p = result.percentage * n; // Function to calculate the current probability

        // Update the <i> element with the description
        increaseDescElement.innerHTML = `The probability has been increasing by ${x}% every day for ${n} days and is now ${p}%`;
      } else {
        increaseDescElement.innerHTML = '';
      }
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get(["category", "percentage", "increase", "name"]);
    getting.then(setCurrentChoice, onError);
  }
  

  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
  