"use strict";
// Default settings
const optionsDefaultSettings = {
    position: "middle-right",
    offset: 20,
    verticalSpacing: 10,
    opacity: 0.5,
    hoverOpacity: 1,
    scrollBehavior: "smooth",
    buttonSize: 40,
    hideDelay: 1500,
};
// DOM Elements
const positionSelect = document.getElementById("position");
const positionOptions = document.querySelectorAll(".position-option");
const offsetInput = document.getElementById("offset");
const offsetValue = document.getElementById("offsetValue");
const verticalSpacingInput = document.getElementById("verticalSpacing");
const verticalSpacingValue = document.getElementById("verticalSpacingValue");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const hoverOpacityInput = document.getElementById("hoverOpacity");
const hoverOpacityValue = document.getElementById("hoverOpacityValue");
const scrollBehaviorRadios = document.querySelectorAll('input[name="scrollBehavior"]');
const buttonSizeInput = document.getElementById("buttonSize");
const buttonSizeValue = document.getElementById("buttonSizeValue");
const hideDelayInput = document.getElementById("hideDelay");
const hideDelayValue = document.getElementById("hideDelayValue");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const feedbackMessage = document.getElementById("feedbackMessage");
// Preview elements
const preview = document.getElementById("preview");
const previewTopBtn = document.getElementById("previewTopBtn");
const previewBottomBtn = document.getElementById("previewBottomBtn");
const domainList = document.getElementById("domainList");
const newDomainInput = document.getElementById("newDomain");
const addDomainBtn = document.getElementById("addDomain");
// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Update selected position option
function updateSelectedPositionOption(position) {
    // Remove selected class from all options
    for (const option of Array.from(positionOptions)) {
        option.classList.remove("selected");
    }
    // Add selected class to the matching option
    const selectedOption = document.querySelector(`.position-option[data-position="${position}"]`);
    if (selectedOption) {
        selectedOption.classList.add("selected");
    }
}
// Show feedback message
function showFeedback(message, isSuccess) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = isSuccess
        ? "feedback-message success"
        : "feedback-message error";
    feedbackMessage.style.display = "block";
    // Hide message after 3 seconds
    setTimeout(() => {
        feedbackMessage.style.display = "none";
    }, 3000);
}
// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get("scrollToSettings", (data) => {
        const settings = data.scrollToSettings;
        if (settings) {
            positionSelect.value = settings.position;
            updateSelectedPositionOption(settings.position);
            offsetInput.value = settings.offset.toString();
            offsetValue.textContent = settings.offset.toString();
            verticalSpacingInput.value = settings.verticalSpacing.toString();
            verticalSpacingValue.textContent = settings.verticalSpacing.toString();
            opacityInput.value = settings.opacity.toString();
            opacityValue.textContent = settings.opacity.toString();
            hoverOpacityInput.value = settings.hoverOpacity.toString();
            hoverOpacityValue.textContent = settings.hoverOpacity.toString();
            // Set the correct radio button for scroll behavior
            for (const radio of Array.from(scrollBehaviorRadios)) {
                radio.checked = radio.value === settings.scrollBehavior;
            }
            buttonSizeInput.value = settings.buttonSize.toString();
            buttonSizeValue.textContent = settings.buttonSize.toString();
            hideDelayInput.value = settings.hideDelay.toString();
            hideDelayValue.textContent = settings.hideDelay.toString();
        }
        else {
            resetSettings();
        }
        // Load disabled domains
        loadDisabledDomains();
        // Update preview
        updatePreview();
    });
}
// Load disabled domains list
function loadDisabledDomains() {
    chrome.storage.sync.get("disabledDomains", (data) => {
        const disabledDomains = data.disabledDomains || [];
        updateDomainList(disabledDomains);
    });
}
// Update the domain list in the UI
function updateDomainList(domains) {
    // Clear current list
    domainList.innerHTML = "";
    if (domains.length === 0) {
        // Show empty message
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No domains are currently disabled";
        domainList.appendChild(emptyMessage);
        return;
    }
    // Add each domain to the list
    for (const domain of domains) {
        const domainItem = document.createElement("div");
        domainItem.className = "domain-item";
        const domainName = document.createElement("div");
        domainName.className = "domain-name";
        domainName.textContent = domain;
        const removeButton = document.createElement("button");
        removeButton.className = "remove-domain";
        removeButton.textContent = "×";
        removeButton.title = "Remove domain";
        removeButton.addEventListener("click", () => removeDomain(domain));
        domainItem.appendChild(domainName);
        domainItem.appendChild(removeButton);
        domainList.appendChild(domainItem);
    }
}
// Remove a domain from the blacklist
function removeDomain(domain) {
    chrome.storage.sync.get("disabledDomains", (data) => {
        let disabledDomains = data.disabledDomains || [];
        disabledDomains = disabledDomains.filter((d) => d !== domain);
        chrome.storage.sync.set({ disabledDomains }, () => {
            updateDomainList(disabledDomains);
            showFeedback(`Removed ${domain} from disabled domains`, true);
        });
    });
}
// Add a domain to the blacklist
function addDomain() {
    const domain = newDomainInput.value.trim().toLowerCase();
    if (!domain) {
        showFeedback("Please enter a valid domain", false);
        return;
    }
    // Simple domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domain)) {
        showFeedback("Please enter a valid domain (e.g., example.com)", false);
        return;
    }
    chrome.storage.sync.get("disabledDomains", (data) => {
        const disabledDomains = data.disabledDomains || [];
        // Check if domain is already in the list
        if (disabledDomains.includes(domain)) {
            showFeedback(`${domain} is already in the list`, false);
            return;
        }
        // Add domain to the list
        disabledDomains.push(domain);
        chrome.storage.sync.set({ disabledDomains }, () => {
            updateDomainList(disabledDomains);
            newDomainInput.value = "";
            showFeedback(`Added ${domain} to disabled domains`, true);
        });
    });
}
// Save settings to storage
function saveSettings() {
    // Get selected scroll behavior
    let selectedScrollBehavior = "smooth";
    for (const radio of Array.from(scrollBehaviorRadios)) {
        if (radio.checked) {
            selectedScrollBehavior = radio.value;
            break;
        }
    }
    const settings = {
        position: positionSelect.value,
        offset: Number.parseInt(offsetInput.value, 10),
        verticalSpacing: Number.parseInt(verticalSpacingInput.value, 10),
        opacity: Number.parseFloat(opacityInput.value),
        hoverOpacity: Number.parseFloat(hoverOpacityInput.value),
        scrollBehavior: selectedScrollBehavior,
        buttonSize: Number.parseInt(buttonSizeInput.value, 10),
        hideDelay: Number.parseInt(hideDelayInput.value, 10),
    };
    chrome.storage.sync.set({ scrollToSettings: settings }, () => {
        showFeedback("Settings saved successfully!", true);
    });
}
// Reset settings to defaults
function resetSettings() {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
        positionSelect.value = optionsDefaultSettings.position;
        updateSelectedPositionOption(optionsDefaultSettings.position);
        offsetInput.value = optionsDefaultSettings.offset.toString();
        offsetValue.textContent = optionsDefaultSettings.offset.toString();
        verticalSpacingInput.value =
            optionsDefaultSettings.verticalSpacing.toString();
        verticalSpacingValue.textContent =
            optionsDefaultSettings.verticalSpacing.toString();
        opacityInput.value = optionsDefaultSettings.opacity.toString();
        opacityValue.textContent = optionsDefaultSettings.opacity.toString();
        hoverOpacityInput.value = optionsDefaultSettings.hoverOpacity.toString();
        hoverOpacityValue.textContent =
            optionsDefaultSettings.hoverOpacity.toString();
        // Set the correct radio button for scroll behavior
        for (const radio of Array.from(scrollBehaviorRadios)) {
            radio.checked = radio.value === optionsDefaultSettings.scrollBehavior;
        }
        buttonSizeInput.value = optionsDefaultSettings.buttonSize.toString();
        buttonSizeValue.textContent = optionsDefaultSettings.buttonSize.toString();
        hideDelayInput.value = optionsDefaultSettings.hideDelay.toString();
        hideDelayValue.textContent = optionsDefaultSettings.hideDelay.toString();
        saveSettings();
        showFeedback("Settings reset to defaults!", true);
    }
}
// Update display values when sliders change
function updateDisplayValues() {
    offsetValue.textContent = offsetInput.value;
    verticalSpacingValue.textContent = verticalSpacingInput.value;
    opacityValue.textContent = opacityInput.value;
    hoverOpacityValue.textContent = hoverOpacityInput.value;
    buttonSizeValue.textContent = buttonSizeInput.value;
    hideDelayValue.textContent = hideDelayInput.value;
    // Update preview
    updatePreview();
}
// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Load settings
    loadSettings();
    // Add event listeners for position options
    for (const option of Array.from(positionOptions)) {
        option.addEventListener("click", () => {
            const position = option.getAttribute("data-position");
            if (position) {
                positionSelect.value = position;
                updateSelectedPositionOption(position);
                updatePreview();
            }
        });
    }
    // Add domain event listeners
    addDomainBtn.addEventListener("click", addDomain);
    newDomainInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            addDomain();
        }
    });
});
saveButton.addEventListener("click", saveSettings);
resetButton.addEventListener("click", resetSettings);
// Add event listeners for range inputs
offsetInput.addEventListener("input", updateDisplayValues);
verticalSpacingInput.addEventListener("input", updateDisplayValues);
opacityInput.addEventListener("input", updateDisplayValues);
hoverOpacityInput.addEventListener("input", updateDisplayValues);
buttonSizeInput.addEventListener("input", updateDisplayValues);
hideDelayInput.addEventListener("input", updateDisplayValues);
// Update preview
function updatePreview() {
    const position = positionSelect.value;
    const offset = offsetInput.value;
    const verticalSpacing = verticalSpacingInput.value;
    const buttonSize = buttonSizeInput.value;
    const opacity = opacityInput.value;
    // Parse position
    const [vertical, horizontal] = position.split("-");
    // Reset all position properties
    previewTopBtn.style.top = "auto";
    previewTopBtn.style.bottom = "auto";
    previewTopBtn.style.left = "auto";
    previewTopBtn.style.right = "auto";
    previewBottomBtn.style.top = "auto";
    previewBottomBtn.style.bottom = "auto";
    previewBottomBtn.style.left = "auto";
    previewBottomBtn.style.right = "auto";
    previewTopBtn.style.transform = "none";
    previewBottomBtn.style.transform = "none";
    // Position horizontally
    if (horizontal === "left") {
        previewTopBtn.style.left = `${offset}px`;
        previewBottomBtn.style.left = `${offset}px`;
    }
    else {
        // right
        previewTopBtn.style.right = `${offset}px`;
        previewBottomBtn.style.right = `${offset}px`;
    }
    // Position vertically
    if (vertical === "top") {
        previewTopBtn.style.top = `${offset}px`;
        previewBottomBtn.style.top = `calc(${offset}px + ${buttonSize}px + ${verticalSpacing}px)`;
    }
    else if (vertical === "middle") {
        previewTopBtn.style.top = `calc(50% - ${buttonSize}px - ${verticalSpacing}px / 2)`;
        previewBottomBtn.style.top = `calc(50% + ${verticalSpacing}px / 2)`;
    }
    else {
        // bottom
        previewBottomBtn.style.bottom = `${offset}px`;
        previewTopBtn.style.bottom = `calc(${offset}px + ${buttonSize}px + ${verticalSpacing}px)`;
    }
    // Apply button size
    previewTopBtn.style.width = `${buttonSize}px`;
    previewTopBtn.style.height = `${buttonSize}px`;
    previewTopBtn.style.lineHeight = `${buttonSize}px`;
    previewBottomBtn.style.width = `${buttonSize}px`;
    previewBottomBtn.style.height = `${buttonSize}px`;
    previewBottomBtn.style.lineHeight = `${buttonSize}px`;
    // Apply opacity
    previewTopBtn.style.opacity = opacity;
    previewBottomBtn.style.opacity = opacity;
}
//# sourceMappingURL=options.js.map