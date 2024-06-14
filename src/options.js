//import * as Settings from './settings.js';

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
      //categorySelect.value = result.category || Settings.CategoryEnum.Cage;

      //document.querySelector("#category").value = result.category || Categories.Cage
      document.querySelector("#percentage").value = result.percentage || 1;
      document.querySelector("#increase").checked = result.increase ? true : false;
      document.querySelector("#name").value = result.name || "A Friend";
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get(["category", "percentage", "increase", "name"]);
    getting.then(setCurrentChoice, onError);
  }
  

  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
  