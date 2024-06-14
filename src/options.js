function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      category:     document.querySelector("#category").value,
      percentage:   document.querySelector("#percentage").value,
      increase:     document.querySelector("#increase").value,
      name:         document.querySelector("#name").value,
    });
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.querySelector("#category").value = result.category || Categories.Cage
      document.querySelector("#percentage").value = result.percentage || 1;
      document.querySelector("#increase").value = result.increase.checked ? new Date() : null;
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
  