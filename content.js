// Default settings
let settings = {
  horizontalPosition: "right", // 'right' or 'left'
  verticalPosition: "bottom", // 'top', 'middle', 'bottom', or 'custom'
  customVerticalPosition: 50, // percentage from top (0-100)
  horizontalOffset: 20, // distance from the edge in pixels
  verticalSpacing: 10, // spacing between buttons in pixels
  opacity: 0.5, // opacity when not hovering
  hoverOpacity: 1, // opacity when hovering
  scrollBehavior: "smooth", // 'smooth' or 'auto'
  buttonSize: 40, // size in pixels
  hideDelay: 1500, // time in ms before hiding buttons after scroll stops
};

// Elements
let scrollTopBtn;
let scrollBottomBtn;
let container;
let hideTimeout;

// Load settings from storage
chrome.storage.sync.get("scrollToSettings", (data) => {
  if (data.scrollToSettings) {
    settings = { ...settings, ...data.scrollToSettings };
  }
  initScrollButtons();
});

function initScrollButtons() {
  // Create container for buttons
  container = document.createElement("div");
  container.className = "scrollToExt-container";

  // Create scroll to top button
  scrollTopBtn = document.createElement("div");
  scrollTopBtn.className = "scrollToExt-button scrollToExt-top";
  scrollTopBtn.innerHTML = "↑";
  scrollTopBtn.title = "Scroll to top";
  scrollTopBtn.addEventListener("click", scrollToTop);

  // Create scroll to bottom button
  scrollBottomBtn = document.createElement("div");
  scrollBottomBtn.className = "scrollToExt-button scrollToExt-bottom";
  scrollBottomBtn.innerHTML = "↓";
  scrollBottomBtn.title = "Scroll to bottom";
  scrollBottomBtn.addEventListener("click", scrollToBottom);

  // Add buttons to container
  container.appendChild(scrollTopBtn);
  container.appendChild(scrollBottomBtn);

  // Add container to document
  document.body.appendChild(container);

  // Apply settings
  applySettings();

  // Add event listeners
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", applySettings);
  container.addEventListener("mouseenter", () => {
    container.style.opacity = settings.hoverOpacity;
  });
  container.addEventListener("mouseleave", () => {
    container.style.opacity = settings.opacity;
  });

  // Initial button visibility
  updateButtonVisibility();
}

function applySettings() {
  // Horizontal position
  container.style.right =
    settings.horizontalPosition === "right"
      ? `${settings.horizontalOffset}px`
      : "auto";
  container.style.left =
    settings.horizontalPosition === "left"
      ? `${settings.horizontalOffset}px`
      : "auto";

  // Vertical position
  const windowHeight = window.innerHeight;

  // Reset all position properties
  container.style.top = "auto";
  container.style.bottom = "auto";
  container.style.transform = "none";

  if (settings.verticalPosition === "top") {
    container.style.top = "20px";
  } else if (settings.verticalPosition === "middle") {
    container.style.top = "50%";
    container.style.transform = "translateY(-50%)";
  } else if (settings.verticalPosition === "custom") {
    const customPosition = `${settings.customVerticalPosition}%`;
    container.style.top = customPosition;
    container.style.transform = "translateY(-50%)";
  } else {
    // bottom
    container.style.bottom = "50px";
  }

  // Spacing between buttons
  container.style.gap = `${settings.verticalSpacing}px`;

  // Opacity
  container.style.opacity = settings.opacity;

  // Button size
  const buttons = document.querySelectorAll(".scrollToExt-button");
  buttons.forEach((btn) => {
    btn.style.width = `${settings.buttonSize}px`;
    btn.style.height = `${settings.buttonSize}px`;
    btn.style.fontSize = `${settings.buttonSize / 2}px`;
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: settings.scrollBehavior,
  });
}

function scrollToBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: settings.scrollBehavior,
  });
}

function handleScroll() {
  updateButtonVisibility();

  // Show buttons when scrolling
  container.style.opacity = settings.hoverOpacity;

  // Clear previous timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  // Set timeout to reduce opacity after scrolling stops
  hideTimeout = setTimeout(() => {
    if (!container.matches(":hover")) {
      container.style.opacity = settings.opacity;
    }
  }, settings.hideDelay);
}

function updateButtonVisibility() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  // Hide top button when at the top
  if (scrollTop <= 10) {
    scrollTopBtn.classList.add("scrollToExt-hidden");
  } else {
    scrollTopBtn.classList.remove("scrollToExt-hidden");
  }

  // Hide bottom button when at the bottom
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    scrollBottomBtn.classList.add("scrollToExt-hidden");
  } else {
    scrollBottomBtn.classList.remove("scrollToExt-hidden");
  }
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.scrollToSettings) {
    settings = { ...settings, ...changes.scrollToSettings.newValue };
    applySettings();
    updateButtonVisibility();
  }
});
