import React, {useEffect, useState} from "react";
import { UserItem } from "../models/UserItem";
import { parseItemText } from "../utility/parser";



// Function to populate the search boxes on the websited
const sendMessageToContentScript = (item: UserItem) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId !== undefined) {
        chrome.tabs.sendMessage(tabId, { action: "populateSearchBoxes", item }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError.message);
          } else if (response) {
            console.log("Message sent successfully:", response.status);
          }
        });
      } else {
        console.error("No active tab found.");
      }
    });
  };

// Creates a multi line text input field
const UploadWindow = () => {
  const [text, setText] = useState("");

  const handleButtonClick = () => {
    console.log("Button clicked");
    const textarea = document.querySelector(".input-area") as HTMLTextAreaElement;
    if (textarea) {
      const textareaValue = textarea.value;
      setText(textareaValue);

      parseItemText(textareaValue).then((item) => {
        console.log("Parsed item:", item);
        if (item.itemClass) {
          sendMessageToContentScript(item);
        }
      });
    }
  };

  return (
    <div>
      <h2>In POE, hover over your item and ctrl+c</h2>
      <div className="input-area-container">
        <textarea className="input-area" placeholder="Paste your item here" />
        <button className="upload-button" onClick={handleButtonClick}>Upload</button>
      </div>
    </div>
  );
};

export default UploadWindow;