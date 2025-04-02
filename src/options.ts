// Define types
type OptionsPosition = "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";

type OptionsScrollBehavior = "smooth" | "auto";

interface OptionsScrollToSettings {
	position: OptionsPosition;
	offset: number;
	verticalSpacing: number;
	opacity: number;
	hoverOpacity: number;
	scrollBehavior: OptionsScrollBehavior;
	buttonSize: number;
}

// Default settings
const optionsDefaultSettings: OptionsScrollToSettings = {
	position: "middle-right",
	offset: 20,
	verticalSpacing: 10,
	opacity: 0.5,
	hoverOpacity: 1,
	scrollBehavior: "smooth",
	buttonSize: 40,
};

// DOM Elements
const positionSelect = document.getElementById("position") as HTMLInputElement;
const positionOptions = document.querySelectorAll<HTMLElement>(".position-option");
const offsetInput = document.getElementById("offset") as HTMLInputElement;
const offsetValue = document.getElementById("offsetValue") as HTMLSpanElement;
const verticalSpacingInput = document.getElementById("verticalSpacing") as HTMLInputElement;
const verticalSpacingValue = document.getElementById("verticalSpacingValue") as HTMLSpanElement;
const opacityInput = document.getElementById("opacity") as HTMLInputElement;
const opacityValue = document.getElementById("opacityValue") as HTMLSpanElement;
const hoverOpacityInput = document.getElementById("hoverOpacity") as HTMLInputElement;
const hoverOpacityValue = document.getElementById("hoverOpacityValue") as HTMLSpanElement;
const scrollBehaviorRadios = document.querySelectorAll('input[name="scrollBehavior"]') as NodeListOf<HTMLInputElement>;
const buttonSizeInput = document.getElementById("buttonSize") as HTMLInputElement;
const buttonSizeValue = document.getElementById("buttonSizeValue") as HTMLSpanElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const feedbackMessage = document.getElementById("feedback") as HTMLDivElement;

const domainList = document.getElementById("domainList") as HTMLDivElement;
const newDomainInput = document.getElementById("newDomain") as HTMLInputElement;
const addDomainBtn = document.getElementById("addDomain") as HTMLButtonElement;

// Update selected position option
function updateSelectedPositionOption(position: string): void {
	// Remove selected class from all options
	for (const option of Array.from(positionOptions)) {
		option.classList.remove("selected");
	}

	// Add selected class to the matching option
	const selectedOption = document.querySelector<HTMLElement>(`.position-option[data-position="${position}"]`);
	if (selectedOption) {
		selectedOption.classList.add("selected");
	}
}

// Show feedback message
function showFeedback(message: string, isSuccess: boolean): void {
	feedbackMessage.textContent = message;
	feedbackMessage.className = isSuccess ? "feedback-message success" : "feedback-message error";
	feedbackMessage.style.display = "block";

	// Hide message after 3 seconds
	setTimeout(() => {
		feedbackMessage.style.display = "none";
	}, 3000);
}

// Load settings from storage
function loadSettings(): void {
	chrome.storage.sync.get("scrollToSettings", (data) => {
		const settings = data.scrollToSettings as OptionsScrollToSettings | undefined;

		if (settings) {
			positionSelect.value = settings.position;
			updateSelectedPositionOption(settings.position);
			offsetInput.value = settings.offset.toString();
			offsetValue.textContent = settings.offset.toString();
			verticalSpacingInput.value = settings.verticalSpacing.toString();
			verticalSpacingValue.textContent = settings.verticalSpacing.toString();
			opacityInput.value = settings.opacity.toString();
			opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
			hoverOpacityInput.value = settings.hoverOpacity.toString();
			hoverOpacityValue.textContent = `${Math.round(settings.hoverOpacity * 100)}%`;

			// Set the correct radio button for scroll behavior
			for (const radio of Array.from(scrollBehaviorRadios)) {
				radio.checked = radio.value === settings.scrollBehavior;
			}

			buttonSizeInput.value = settings.buttonSize.toString();
			buttonSizeValue.textContent = settings.buttonSize.toString();
		} else {
			applyDefaultSettings();
		}

		// Load disabled domains
		loadDisabledDomains();

		// Update preview
		updatePreview();
	});
}

function applyDefaultSettings(): void {
	positionSelect.value = optionsDefaultSettings.position;
	updateSelectedPositionOption(optionsDefaultSettings.position);
	offsetInput.value = optionsDefaultSettings.offset.toString();
	offsetValue.textContent = optionsDefaultSettings.offset.toString();
	verticalSpacingInput.value = optionsDefaultSettings.verticalSpacing.toString();
	verticalSpacingValue.textContent = optionsDefaultSettings.verticalSpacing.toString();
	opacityInput.value = optionsDefaultSettings.opacity.toString();
	opacityValue.textContent = `${Math.round(optionsDefaultSettings.opacity * 100)}%`;
	hoverOpacityInput.value = optionsDefaultSettings.hoverOpacity.toString();
	hoverOpacityValue.textContent = `${Math.round(optionsDefaultSettings.hoverOpacity * 100)}%`;

	// Set the correct radio button for scroll behavior
	for (const radio of Array.from(scrollBehaviorRadios)) {
		radio.checked = radio.value === optionsDefaultSettings.scrollBehavior;
	}

	buttonSizeInput.value = optionsDefaultSettings.buttonSize.toString();
	buttonSizeValue.textContent = optionsDefaultSettings.buttonSize.toString();
}

// Load disabled domains list
function loadDisabledDomains(): void {
	chrome.storage.sync.get("disabledDomains", (data) => {
		const disabledDomains = data.disabledDomains || [];
		updateDomainList(disabledDomains);
	});
}

// Update the domain list in the UI
function updateDomainList(domains: string[]): void {
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
function removeDomain(domain: string): void {
	chrome.storage.sync.get("disabledDomains", (data) => {
		let disabledDomains = data.disabledDomains || [];
		disabledDomains = disabledDomains.filter((d: string) => d !== domain);

		chrome.storage.sync.set({ disabledDomains }, () => {
			updateDomainList(disabledDomains);
			showFeedback(`Removed ${domain} from disabled domains`, true);
		});
	});
}

// Add a domain to the blacklist
function addDomain(): void {
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
function saveSettings(): void {
	// Get selected scroll behavior
	let selectedScrollBehavior: OptionsScrollBehavior = "smooth";
	for (const radio of Array.from(scrollBehaviorRadios)) {
		if (radio.checked) {
			selectedScrollBehavior = radio.value as OptionsScrollBehavior;
			break;
		}
	}

	const settings: OptionsScrollToSettings = {
		position: positionSelect.value as OptionsPosition,
		offset: Number.parseInt(offsetInput.value, 10),
		verticalSpacing: Number.parseInt(verticalSpacingInput.value, 10),
		opacity: Number.parseFloat(opacityInput.value),
		hoverOpacity: Number.parseFloat(hoverOpacityInput.value),
		scrollBehavior: selectedScrollBehavior,
		buttonSize: Number.parseInt(buttonSizeInput.value, 10),
	};

	chrome.storage.sync.set({ scrollToSettings: settings }, () => {
		showFeedback("Settings saved successfully!", true);
	});
}

// Reset settings to defaults
function resetSettings(): void {
	if (confirm("Are you sure you want to reset all settings to default values?")) {
		applyDefaultSettings();
		saveSettings();
		showFeedback("Settings reset to defaults!", true);
	}
}

// Update display values when sliders change
function updateDisplayValues(): void {
	offsetValue.textContent = offsetInput.value;
	verticalSpacingValue.textContent = verticalSpacingInput.value;
	opacityValue.textContent = `${Math.round(Number(opacityInput.value) * 100)}%`;
	hoverOpacityValue.textContent = `${Math.round(Number(hoverOpacityInput.value) * 100)}%`;
	buttonSizeValue.textContent = buttonSizeInput.value;

	// Update preview
	updatePreview();
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
	// Load settings
	loadSettings();

	// Load and display extension version
	loadExtensionVersion();

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

// Update preview
function updatePreview(): void {
	const position = positionSelect.value;
	const offset = Number.parseInt(offsetInput.value, 10);
	const verticalSpacing = Number.parseInt(verticalSpacingInput.value, 10);
	const buttonSize = Number.parseInt(buttonSizeInput.value, 10);
	const opacity = opacityInput.value;
	const hoverOpacity = hoverOpacityInput.value;

	// Get the container element
	const scrollContainer = document.getElementById("scrollButtons") as HTMLElement;

	// Reset all position properties of the container
	scrollContainer.style.top = "auto";
	scrollContainer.style.bottom = "auto";
	scrollContainer.style.left = "auto";
	scrollContainer.style.right = "auto";
	scrollContainer.style.transform = "none";

	// Set opacity values using CSS variables
	document.documentElement.style.setProperty("--current-opacity", opacity);
	document.documentElement.style.setProperty("--current-hover-opacity", hoverOpacity);

	// Parse position
	const [vertical, horizontal] = position.split("-");

	// Position horizontally
	if (horizontal === "left") {
		scrollContainer.style.left = `${offset}px`;
	} else {
		// right
		scrollContainer.style.right = `${offset}px`;
	}

	// Position vertically
	if (vertical === "top") {
		scrollContainer.style.top = `${offset}px`;
		scrollContainer.style.flexDirection = "column";
	} else if (vertical === "middle") {
		scrollContainer.style.top = "50%";
		scrollContainer.style.transform = "translateY(-50%)";
		scrollContainer.style.flexDirection = "column";
	} else {
		// bottom
		scrollContainer.style.bottom = `${offset}px`;
		scrollContainer.style.flexDirection = "column";
	}

	// Apply button size
	const buttons = document.querySelectorAll(".scrollToExt-button");
	for (const button of Array.from(buttons)) {
		(button as HTMLElement).style.width = `${buttonSize}px`;
		(button as HTMLElement).style.height = `${buttonSize}px`;
		(button as HTMLElement).style.fontSize = `${Math.floor(buttonSize * 0.45)}px`;
	}

	// Apply vertical spacing
	scrollContainer.style.gap = `${verticalSpacing}px`;
}

// Load and display extension version
function loadExtensionVersion(): void {
	const versionElement = document.getElementById("versionNumber");
	if (versionElement) {
		// Get the manifest data to display the current version
		const manifest = chrome.runtime.getManifest();
		versionElement.textContent = manifest.version;
	}
}
