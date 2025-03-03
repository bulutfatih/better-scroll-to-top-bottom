// Default settings
const defaultSettings = {
  horizontalPosition: "right",
  verticalPosition: "bottom",
  customVerticalPosition: 50,
  horizontalOffset: 20,
  verticalSpacing: 10,
  opacity: 0.5,
  hoverOpacity: 1,
  scrollBehavior: "smooth",
  buttonSize: 40,
  hideDelay: 1500,
};

// DOM elements
const horizontalPositionSelect = document.getElementById("horizontalPosition");
const verticalPositionSelect = document.getElementById("verticalPosition");
const customVerticalPositionContainer = document.getElementById(
  "customVerticalPositionContainer"
);
const customVerticalPositionInput = document.getElementById(
  "customVerticalPosition"
);
const customVerticalPositionValue = document.getElementById(
  "customVerticalPositionValue"
);
const horizontalOffsetInput = document.getElementById("horizontalOffset");
const horizontalOffsetValue = document.getElementById("horizontalOffsetValue");
const verticalSpacingInput = document.getElementById("verticalSpacing");
const verticalSpacingValue = document.getElementById("verticalSpacingValue");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const hoverOpacityInput = document.getElementById("hoverOpacity");
const hoverOpacityValue = document.getElementById("hoverOpacityValue");
const scrollBehaviorSelect = document.getElementById("scrollBehavior");
const buttonSizeInput = document.getElementById("buttonSize");
const buttonSizeValue = document.getElementById("buttonSizeValue");
const hideDelayInput = document.getElementById("hideDelay");
const hideDelayValue = document.getElementById("hideDelayValue");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const savedMessage = document.getElementById("savedMessage");

// Preview elements
const preview = document.getElementById("preview");
const previewTopBtn = document.getElementById("previewTopBtn");
const previewBottomBtn = document.getElementById("previewBottomBtn");

// Load settings
function loadSettings() {
  chrome.storage.sync.get("scrollToSettings", (data) => {
    const settings = data.scrollToSettings || defaultSettings;

    // Apply settings to form
    horizontalPositionSelect.value =
      settings.horizontalPosition || defaultSettings.horizontalPosition;
    verticalPositionSelect.value =
      settings.verticalPosition || defaultSettings.verticalPosition;
    customVerticalPositionInput.value =
      settings.customVerticalPosition || defaultSettings.customVerticalPosition;
    customVerticalPositionValue.textContent =
      settings.customVerticalPosition || defaultSettings.customVerticalPosition;
    horizontalOffsetInput.value =
      settings.horizontalOffset || defaultSettings.horizontalOffset;
    horizontalOffsetValue.textContent =
      settings.horizontalOffset || defaultSettings.horizontalOffset;
    verticalSpacingInput.value =
      settings.verticalSpacing || defaultSettings.verticalSpacing;
    verticalSpacingValue.textContent =
      settings.verticalSpacing || defaultSettings.verticalSpacing;
    opacityInput.value = settings.opacity;
    opacityValue.textContent = settings.opacity;
    hoverOpacityInput.value = settings.hoverOpacity;
    hoverOpacityValue.textContent = settings.hoverOpacity;
    scrollBehaviorSelect.value = settings.scrollBehavior;
    buttonSizeInput.value = settings.buttonSize;
    buttonSizeValue.textContent = settings.buttonSize;
    hideDelayInput.value = settings.hideDelay;
    hideDelayValue.textContent = settings.hideDelay;

    // Show/hide custom vertical position input
    if (settings.verticalPosition === "custom") {
      customVerticalPositionContainer.style.display = "block";
    } else {
      customVerticalPositionContainer.style.display = "none";
    }

    // Update preview
    updatePreview();
  });
}

// Save settings
function saveSettings() {
  const settings = {
    horizontalPosition: horizontalPositionSelect.value,
    verticalPosition: verticalPositionSelect.value,
    customVerticalPosition: parseInt(customVerticalPositionInput.value),
    horizontalOffset: parseInt(horizontalOffsetInput.value),
    verticalSpacing: parseInt(verticalSpacingInput.value),
    opacity: parseFloat(opacityInput.value),
    hoverOpacity: parseFloat(hoverOpacityInput.value),
    scrollBehavior: scrollBehaviorSelect.value,
    buttonSize: parseInt(buttonSizeInput.value),
    hideDelay: parseInt(hideDelayInput.value),
  };

  chrome.storage.sync.set({ scrollToSettings: settings }, () => {
    // Show saved message
    savedMessage.style.display = "block";
    setTimeout(() => {
      savedMessage.style.display = "none";
    }, 3000);
  });
}

// Reset settings
function resetSettings() {
  // Apply default settings to form
  horizontalPositionSelect.value = defaultSettings.horizontalPosition;
  verticalPositionSelect.value = defaultSettings.verticalPosition;
  customVerticalPositionInput.value = defaultSettings.customVerticalPosition;
  customVerticalPositionValue.textContent =
    defaultSettings.customVerticalPosition;
  horizontalOffsetInput.value = defaultSettings.horizontalOffset;
  horizontalOffsetValue.textContent = defaultSettings.horizontalOffset;
  verticalSpacingInput.value = defaultSettings.verticalSpacing;
  verticalSpacingValue.textContent = defaultSettings.verticalSpacing;
  opacityInput.value = defaultSettings.opacity;
  opacityValue.textContent = defaultSettings.opacity;
  hoverOpacityInput.value = defaultSettings.hoverOpacity;
  hoverOpacityValue.textContent = defaultSettings.hoverOpacity;
  scrollBehaviorSelect.value = defaultSettings.scrollBehavior;
  buttonSizeInput.value = defaultSettings.buttonSize;
  buttonSizeValue.textContent = defaultSettings.buttonSize;
  hideDelayInput.value = defaultSettings.hideDelay;
  hideDelayValue.textContent = defaultSettings.hideDelay;

  // Hide custom vertical position input
  customVerticalPositionContainer.style.display = "none";

  // Update preview
  updatePreview();
}

// Update preview
function updatePreview() {
  const horizontalPosition = horizontalPositionSelect.value;
  const verticalPosition = verticalPositionSelect.value;
  const customVerticalPosition = customVerticalPositionInput.value;
  const horizontalOffset = horizontalOffsetInput.value;
  const verticalSpacing = verticalSpacingInput.value;
  const buttonSize = buttonSizeInput.value;
  const opacity = opacityInput.value;

  // Position buttons horizontally
  if (horizontalPosition === "right") {
    previewTopBtn.style.right = `${parseInt(horizontalOffset) + 8}px`;
    previewTopBtn.style.left = "auto";
    previewBottomBtn.style.right = `${parseInt(horizontalOffset) + 8}px`;
    previewBottomBtn.style.left = "auto";
  } else {
    previewTopBtn.style.left = `${parseInt(horizontalOffset) + 8}px`;
    previewTopBtn.style.right = "auto";
    previewBottomBtn.style.left = `${parseInt(horizontalOffset) + 8}px`;
    previewBottomBtn.style.right = "auto";
  }

  // Position buttons vertically
  const previewHeight = preview.clientHeight;

  if (verticalPosition === "top") {
    previewTopBtn.style.top = "20px";
    previewBottomBtn.style.top = `${
      20 + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
    previewTopBtn.style.bottom = "auto";
    previewBottomBtn.style.bottom = "auto";
  } else if (verticalPosition === "middle") {
    const middlePosition =
      previewHeight / 2 - parseInt(buttonSize) - parseInt(verticalSpacing) / 2;
    previewTopBtn.style.top = `${middlePosition}px`;
    previewBottomBtn.style.top = `${
      middlePosition + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
    previewTopBtn.style.bottom = "auto";
    previewBottomBtn.style.bottom = "auto";
  } else if (verticalPosition === "custom") {
    const customPosition =
      (parseInt(customVerticalPosition) / 100) * previewHeight;
    previewTopBtn.style.top = `${
      customPosition - parseInt(buttonSize) - parseInt(verticalSpacing) / 2
    }px`;
    previewBottomBtn.style.top = `${
      customPosition + parseInt(verticalSpacing) / 2
    }px`;
    previewTopBtn.style.bottom = "auto";
    previewBottomBtn.style.bottom = "auto";
  } else {
    // bottom
    previewTopBtn.style.bottom = `${
      20 + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
    previewBottomBtn.style.bottom = "20px";
    previewTopBtn.style.top = "auto";
    previewBottomBtn.style.top = "auto";
  }

  // Set button size
  previewTopBtn.style.width = `${buttonSize}px`;
  previewTopBtn.style.height = `${buttonSize}px`;
  previewBottomBtn.style.width = `${buttonSize}px`;
  previewBottomBtn.style.height = `${buttonSize}px`;

  // Set opacity
  previewTopBtn.style.opacity = opacity;
  previewBottomBtn.style.opacity = opacity;
}

// Event listeners
horizontalOffsetInput.addEventListener("input", () => {
  horizontalOffsetValue.textContent = horizontalOffsetInput.value;
  updatePreview();
});

verticalSpacingInput.addEventListener("input", () => {
  verticalSpacingValue.textContent = verticalSpacingInput.value;
  updatePreview();
});

customVerticalPositionInput.addEventListener("input", () => {
  customVerticalPositionValue.textContent = customVerticalPositionInput.value;
  updatePreview();
});

opacityInput.addEventListener("input", () => {
  opacityValue.textContent = opacityInput.value;
  updatePreview();
});

hoverOpacityInput.addEventListener("input", () => {
  hoverOpacityValue.textContent = hoverOpacityInput.value;
});

buttonSizeInput.addEventListener("input", () => {
  buttonSizeValue.textContent = buttonSizeInput.value;
  updatePreview();
});

hideDelayInput.addEventListener("input", () => {
  hideDelayValue.textContent = hideDelayInput.value;
});

horizontalPositionSelect.addEventListener("change", updatePreview);

verticalPositionSelect.addEventListener("change", () => {
  if (verticalPositionSelect.value === "custom") {
    customVerticalPositionContainer.style.display = "block";
  } else {
    customVerticalPositionContainer.style.display = "none";
  }
  updatePreview();
});

saveButton.addEventListener("click", saveSettings);
resetButton.addEventListener("click", resetSettings);

// Preview hover effect
previewTopBtn.addEventListener("mouseenter", () => {
  previewTopBtn.style.opacity = hoverOpacityInput.value;
});

previewTopBtn.addEventListener("mouseleave", () => {
  previewTopBtn.style.opacity = opacityInput.value;
});

previewBottomBtn.addEventListener("mouseenter", () => {
  previewBottomBtn.style.opacity = hoverOpacityInput.value;
});

previewBottomBtn.addEventListener("mouseleave", () => {
  previewBottomBtn.style.opacity = opacityInput.value;
});

// Initialize
document.addEventListener("DOMContentLoaded", loadSettings);
