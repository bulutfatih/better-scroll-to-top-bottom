// Define types
type Position = "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";

type ContentScrollBehavior = "smooth" | "auto";

interface ScrollToSettings {
	position: Position;
	offset: number;
	verticalSpacing: number;
	opacity: number;
	hoverOpacity: number;
	scrollBehavior: ContentScrollBehavior;
	buttonSize: number;
}

// Elements
let scrollTopBtn: HTMLDivElement;
let scrollBottomBtn: HTMLDivElement;
let container: HTMLDivElement;

// Default settings
const defaultSettings: ScrollToSettings = {
	position: "middle-right",
	offset: 20,
	verticalSpacing: 10,
	opacity: 0.5,
	hoverOpacity: 1,
	scrollBehavior: "smooth",
	buttonSize: 40,
};

// Check if the extension should be enabled
function shouldEnableExtension(callback: (enabled: boolean) => void): void {
	// Check if disabled for specific domains
	chrome.storage.sync.get(["disabledDomains", "disabledUntil"], (data) => {
		// Check if disabled until a certain time
		if (data.disabledUntil) {
			const now = Date.now();
			if (now < data.disabledUntil) {
				callback(false);
				return;
			}
		}

		// Check if disabled for current domain
		if (data.disabledDomains && Array.isArray(data.disabledDomains)) {
			const currentDomain = window.location.hostname;
			if (data.disabledDomains.includes(currentDomain)) {
				callback(false);
				return;
			}
		}

		// If not disabled, enable extension
		callback(true);
	});
}

// Load settings from storage
shouldEnableExtension((enabled) => {
	if (!enabled) {
		return; // Don't initialize if disabled
	}

	chrome.storage.sync.get("scrollToSettings", (data) => {
		const storedSettings = data.scrollToSettings as ScrollToSettings | undefined;
		const settings: ScrollToSettings = storedSettings ? { ...defaultSettings, ...storedSettings } : defaultSettings;

		initScrollButtons(settings);
	});
});

function initScrollButtons(settings: ScrollToSettings): void {
	// Create container for buttons
	container = document.createElement("div");
	container.className = "scrollToExt-container";

	// Create scroll to top button
	scrollTopBtn = document.createElement("div");
	scrollTopBtn.className = "scrollToExt-button scrollToExt-top";
	scrollTopBtn.innerHTML = "&#8593;"; // Up arrow HTML entity
	scrollTopBtn.title = "Scroll to top";
	scrollTopBtn.addEventListener("click", () => scrollToTop(settings));

	// Create scroll to bottom button
	scrollBottomBtn = document.createElement("div");
	scrollBottomBtn.className = "scrollToExt-button scrollToExt-bottom";
	scrollBottomBtn.innerHTML = "&#8595;"; // Down arrow HTML entity
	scrollBottomBtn.title = "Scroll to bottom";
	scrollBottomBtn.addEventListener("click", () => scrollToBottom(settings));

	// Add buttons to container
	container.appendChild(scrollTopBtn);
	container.appendChild(scrollBottomBtn);

	// Hide buttons initially to prevent flash
	scrollTopBtn.classList.add("scrollToExt-hidden");
	scrollBottomBtn.classList.add("scrollToExt-hidden");

	// Add container to document
	document.documentElement.appendChild(container);

	// Apply settings
	applySettings(settings);

	// Add event listeners
	window.addEventListener("scroll", () => handleScroll());
	window.addEventListener("resize", () => {
		applySettings(settings);
		updateButtonVisibility();
	});

	// Initial button visibility
	updateButtonVisibility();

	// Watch for DOM changes that might affect page height
	const observer = new MutationObserver(() => {
		updateButtonVisibility();
	});

	// Start observing the document for changes
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["style", "class"],
	});

	// Also observe the document element for size changes
	const resizeObserver = new ResizeObserver(() => {
		updateButtonVisibility();
	});

	resizeObserver.observe(document.documentElement);
}

function applySettings(settings: ScrollToSettings): void {
	// Parse position
	const [vertical, horizontal] = settings.position.split("-");

	// Reset all position properties
	container.style.top = "auto";
	container.style.bottom = "auto";
	container.style.left = "auto";
	container.style.right = "auto";
	container.style.transform = "none";

	// Position horizontally
	if (horizontal === "left") {
		container.style.left = `${settings.offset}px`;
	} else {
		// right
		container.style.right = `${settings.offset}px`;
	}

	// Position vertically
	if (vertical === "top") {
		container.style.top = `${settings.offset}px`;
	} else if (vertical === "middle") {
		container.style.top = "50%";
		container.style.transform = "translateY(-50%)";
	} else {
		// bottom
		container.style.bottom = `${settings.offset}px`;
	}

	// Spacing between buttons
	container.style.gap = `${settings.verticalSpacing}px`;

	// Set opacity values using CSS variables
	document.documentElement.style.setProperty("--current-opacity", settings.opacity.toString());
	document.documentElement.style.setProperty("--current-hover-opacity", settings.hoverOpacity.toString());

	// Button size
	const buttons = document.querySelectorAll<HTMLElement>(".scrollToExt-button");
	for (const btn of Array.from(buttons)) {
		btn.style.width = `${settings.buttonSize}px`;
		btn.style.height = `${settings.buttonSize}px`;
		btn.style.fontSize = `${settings.buttonSize / 2}px`;
	}
}

function scrollToTop(settings: ScrollToSettings): void {
	window.scrollTo({
		top: 0,
		behavior: settings.scrollBehavior,
	});
}

function scrollToBottom(settings: ScrollToSettings): void {
	window.scrollTo({
		top: document.documentElement.scrollHeight,
		behavior: settings.scrollBehavior,
	});
}

function handleScroll(): void {
	updateButtonVisibility();
}

function updateButtonVisibility(): void {
	const scrollTop = window.scrollY || document.documentElement.scrollTop;
	const scrollHeight = document.documentElement.scrollHeight;
	const clientHeight = document.documentElement.clientHeight;

	const isScrollable = scrollHeight > clientHeight;
	if (!isScrollable) {
		scrollTopBtn.classList.add("scrollToExt-hidden");
		scrollBottomBtn.classList.add("scrollToExt-hidden");
		return;
	}

	// Hide top button when at the top
	scrollTopBtn.classList.toggle("scrollToExt-hidden", scrollTop <= 10);

	// Hide bottom button when at the bottom
	const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
	scrollBottomBtn.classList.toggle("scrollToExt-hidden", isAtBottom);
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
	if (changes.scrollToSettings) {
		const newSettings = changes.scrollToSettings.newValue as ScrollToSettings;
		applySettings(newSettings);
		updateButtonVisibility();
	}
});
