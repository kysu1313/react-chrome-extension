console.log("Content script loaded");

const statFilterSelector =
  "#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.brown > div.filter-group.expanded > div.filter-group-body > div > span > div > div.multiselect__tags > input";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  console.log("Content message received");

  if (request.action === "populateSearchBoxes") {
    const item = request.item;
    console.log("Received item in content script:", item);

    const selectors = {
      itemClass: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(1) > div.filter-group-body > div:nth-child(1) > span > div.multiselect.filter-select > div.multiselect__tags > input',
      rarity: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(1) > div.filter-group-body > div:nth-child(2) > span > div.multiselect.filter-select > div.multiselect__tags > input',
      // baseType: '#trade > div.top > div > div:nth-child(1) > div.search-left > div > div.multiselect__tags > input',
      quality: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(1) > div.filter-group-body > div.filter.filter-property.spaced > span > input:nth-child(3)',
      evasionRating: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(2) > div.filter-group-body > div:nth-child(8) > span > input:nth-child(3)',
      energyShield: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(2) > div.filter-group-body > div:nth-child(9) > span > input:nth-child(3)',
      armour: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(2) > div.filter-group-body > div:nth-child(10) > span > input:nth-child(3)',
      'requirements.level': '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(3) > div.filter-group-body > div:nth-child(1) > span > input:nth-child(3)',
      'requirements.dex': '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(3) > div.filter-group-body > div:nth-child(3) > span > input:nth-child(3)',
      'requirements.int': '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(3) > div.filter-group-body > div:nth-child(4) > span > input:nth-child(3)',
      // sockets: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(2) > div.filter-group-body > div:nth-child(12) > span > input:nth-child(3)',
      itemLevel: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(1) > div.filter-group-body > div:nth-child(3) > span > input:nth-child(3)',
      waystoneTier: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(4) > div.filter-group-body > div:nth-child(1) > span > input:nth-child(3)',
      waystoneDropChance: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(4) > div.filter-group-body > div.filter.filter-property.spaced > span > input:nth-child(3)',
      // enchant: '',
      // implicitMods: '',
      // explicitMods: '',
      // flavorText: '',
      corrupted: '#trade > div.top > div > div.search-bar.search-advanced > div > div.search-advanced-pane.blue > div:nth-child(5) > div.filter-group-body > div:nth-child(6) > span > div.multiselect.filter-select > div.multiselect__content-wrapper > ul > li:nth-child(1) > span',
    };

    const populateField = (selector, value) => {
      const input = document.querySelector(selector);
      if (input) {
        if (selector.includes('multiselect')) {
          console.log(`Selecting value ${value} for multiselect input: ${selector}`);
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          const parentElement = input.closest('.multiselect.filter-select');
          if (parentElement) {
            const dropdownOptions = parentElement.querySelectorAll('.multiselect__option');
            let optionFound = false;
            dropdownOptions.forEach(option => {
              if (option.textContent.trim() === value) {
                option.click();
                optionFound = true;
              }
            });
            if (!optionFound) {
              console.error(`Dropdown option not found for value: ${value}`);
            }
          } else {
            console.error(`Parent element not found for selector: ${selector}`);
          }
        } else {
          console.log(`Populating ${selector} with value:`, value);
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        console.error(`Input not found for selector: ${selector}`);
      }
    };

    for (const [key, selector] of Object.entries(selectors)) {
      const value = key.split('.').reduce((o, i) => o[i], item);
      if (value) {
        populateField(selector, value);
      }
    }

    // Send response back to the sender (popup/background)
    sendResponse({ status: "success" });
  }
});