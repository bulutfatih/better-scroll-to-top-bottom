// Default settings
const defaultSettings = {
  position: "middle-right",
  offset: 20,
  verticalSpacing: 10,
  opacity: 0.5,
  hoverOpacity: 1,
  scrollBehavior: "smooth",
  buttonSize: 40,
  hideDelay: 500,
};

// DOM elements
const positionInput = document.getElementById("position");
const positionOptions = document.querySelectorAll(".position-option");
const offsetInput = document.getElementById("offset");
const offsetValue = document.getElementById("offsetValue");
const verticalSpacingInput = document.getElementById("verticalSpacing");
const verticalSpacingValue = document.getElementById("verticalSpacingValue");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const hoverOpacityInput = document.getElementById("hoverOpacity");
const hoverOpacityValue = document.getElementById("hoverOpacityValue");
const scrollBehaviorRadios = document.querySelectorAll(
  'input[name="scrollBehavior"]'
);
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
    positionInput.value = settings.position || defaultSettings.position;
    updateSelectedPositionOption(settings.position || defaultSettings.position);

    offsetInput.value = settings.offset || defaultSettings.offset;
    offsetValue.textContent = settings.offset || defaultSettings.offset;
    verticalSpacingInput.value =
      settings.verticalSpacing || defaultSettings.verticalSpacing;
    verticalSpacingValue.textContent =
      settings.verticalSpacing || defaultSettings.verticalSpacing;
    opacityInput.value = settings.opacity;
    opacityValue.textContent = settings.opacity;
    hoverOpacityInput.value = settings.hoverOpacity;
    hoverOpacityValue.textContent = settings.hoverOpacity;

    // Set scroll behavior radio
    const scrollBehaviorValue =
      settings.scrollBehavior || defaultSettings.scrollBehavior;
    document.getElementById(
      `scrollBehavior${capitalizeFirstLetter(scrollBehaviorValue)}`
    ).checked = true;

    buttonSizeInput.value = settings.buttonSize;
    buttonSizeValue.textContent = settings.buttonSize;
    hideDelayInput.value = settings.hideDelay;
    hideDelayValue.textContent = settings.hideDelay;

    // Update preview
    updatePreview();
  });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Update selected position option
function updateSelectedPositionOption(position) {
  // Remove selected class from all options
  positionOptions.forEach((option) => {
    option.classList.remove("selected");
  });

  // Add selected class to the matching option
  const selectedOption = document.querySelector(
    `.position-option[data-position="${position}"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }
}

// Get selected scroll behavior
function getSelectedScrollBehavior() {
  for (const radio of scrollBehaviorRadios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return defaultSettings.scrollBehavior;
}

// Save settings
function saveSettings() {
  const settings = {
    position: positionInput.value,
    offset: parseInt(offsetInput.value),
    verticalSpacing: parseInt(verticalSpacingInput.value),
    opacity: parseFloat(opacityInput.value),
    hoverOpacity: parseFloat(hoverOpacityInput.value),
    scrollBehavior: getSelectedScrollBehavior(),
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
  positionInput.value = defaultSettings.position;
  updateSelectedPositionOption(defaultSettings.position);

  offsetInput.value = defaultSettings.offset;
  offsetValue.textContent = defaultSettings.offset;
  verticalSpacingInput.value = defaultSettings.verticalSpacing;
  verticalSpacingValue.textContent = defaultSettings.verticalSpacing;
  opacityInput.value = defaultSettings.opacity;
  opacityValue.textContent = defaultSettings.opacity;
  hoverOpacityInput.value = defaultSettings.hoverOpacity;
  hoverOpacityValue.textContent = defaultSettings.hoverOpacity;

  // Reset scroll behavior radio
  document.getElementById(
    `scrollBehavior${capitalizeFirstLetter(defaultSettings.scrollBehavior)}`
  ).checked = true;

  buttonSizeInput.value = defaultSettings.buttonSize;
  buttonSizeValue.textContent = defaultSettings.buttonSize;
  hideDelayInput.value = defaultSettings.hideDelay;
  hideDelayValue.textContent = defaultSettings.hideDelay;

  // Update preview
  updatePreview();
}

// Update preview
function updatePreview() {
  const position = positionInput.value;
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
  previewTopBtn.style.transform = "none";
  previewBottomBtn.style.top = "auto";
  previewBottomBtn.style.bottom = "auto";
  previewBottomBtn.style.left = "auto";
  previewBottomBtn.style.right = "auto";
  previewBottomBtn.style.transform = "none";

  // Position buttons horizontally
  if (horizontal === "left") {
    previewTopBtn.style.left = `${parseInt(offset)}px`;
    previewBottomBtn.style.left = `${parseInt(offset)}px`;
  } else {
    // right
    previewTopBtn.style.right = `${parseInt(offset)}px`;
    previewBottomBtn.style.right = `${parseInt(offset)}px`;
  }

  // Position buttons vertically
  const previewHeight = preview.clientHeight;

  if (vertical === "top") {
    previewTopBtn.style.top = `${parseInt(offset)}px`;
    previewBottomBtn.style.top = `${
      parseInt(offset) + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
  } else if (vertical === "middle") {
    const middlePosition =
      previewHeight / 2 - parseInt(buttonSize) - parseInt(verticalSpacing) / 2;
    previewTopBtn.style.top = `${middlePosition}px`;
    previewBottomBtn.style.top = `${
      middlePosition + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
  } else {
    // bottom
    previewBottomBtn.style.bottom = `${parseInt(offset)}px`;
    previewTopBtn.style.bottom = `${
      parseInt(offset) + parseInt(buttonSize) + parseInt(verticalSpacing)
    }px`;
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
offsetInput.addEventListener("input", () => {
  offsetValue.textContent = offsetInput.value;
  updatePreview();
});

verticalSpacingInput.addEventListener("input", () => {
  verticalSpacingValue.textContent = verticalSpacingInput.value;
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

// Position option click handler
positionOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const position = option.getAttribute("data-position");
    positionInput.value = position;
    updateSelectedPositionOption(position);
    updatePreview();
  });
});

// Scroll behavior radio change handler
scrollBehaviorRadios.forEach((radio) => {
  radio.addEventListener("change", updatePreview);
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
