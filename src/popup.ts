// DOM Elements
const domainToggle = document.getElementById("domain-toggle") as HTMLInputElement;
const todayToggle = document.getElementById("today-toggle") as HTMLInputElement;
const domainText = document.getElementById("domain-text") as HTMLElement;
const todayText = document.getElementById("today-text") as HTMLElement;
const openSettingsBtn = document.getElementById("open-settings") as HTMLElement;
const versionElement = document.getElementById("version") as HTMLElement;
const reloadNotification = document.getElementById("reload-notification") as HTMLElement;
const reloadButton = document.getElementById("reload-button") as HTMLElement;

// Track if settings have changed
let settingsChanged = false;

// Get extension version from manifest
chrome.management.getSelf((info) => {
	versionElement.textContent = `Version ${info.version}`;
});

// Get current tab
async function getCurrentTab() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
}

// Check current status
async function checkStatus() {
	const tab = await getCurrentTab();
	if (!tab.url) return;

	try {
		const url = new URL(tab.url);
		const currentDomain = url.hostname;

		// Get disabled domains and time
		chrome.storage.sync.get(["disabledDomains", "disabledUntil"], (data) => {
			let isDomainDisabled = false;
			let isTimeDisabled = false;

			// Check if disabled for domain
			if (data.disabledDomains && Array.isArray(data.disabledDomains)) {
				isDomainDisabled = data.disabledDomains.includes(currentDomain);
				domainToggle.checked = isDomainDisabled;
				domainText.textContent = `Disable for ${currentDomain}`;
			}

			// Check if disabled until a certain time
			if (data.disabledUntil) {
				const now = Date.now();
				isTimeDisabled = now < data.disabledUntil;
				todayToggle.checked = isTimeDisabled;
				todayText.textContent = "Disable for today";
			}
		});
	} catch (error) {
		console.error("Invalid URL:", error);
	}
}

// Show reload notification
function showReloadNotification() {
	if (!settingsChanged) {
		settingsChanged = true;
		reloadNotification.style.display = "block";
	}
}

// Toggle domain disable/enable
domainToggle.addEventListener("change", async () => {
	const tab = await getCurrentTab();
	if (!tab.url) return;

	try {
		const url = new URL(tab.url);
		const domain = url.hostname;

		// Get existing disabled domains
		chrome.storage.sync.get("disabledDomains", (data) => {
			const disabledDomains = [...(data.disabledDomains || [])];

			// Check if domain is already disabled
			const index = disabledDomains.indexOf(domain);

			if (domainToggle.checked && index === -1) {
				// Add domain to disabled list
				disabledDomains.push(domain);
			} else if (!domainToggle.checked && index !== -1) {
				// Remove domain from disabled list
				disabledDomains.splice(index, 1);
			}

			// Save updated list
			chrome.storage.sync.set({ disabledDomains }, () => {
				showReloadNotification();
			});
		});
	} catch (error) {
		console.error("Invalid URL:", error);
	}
});

// Toggle time-based disable/enable
todayToggle.addEventListener("change", () => {
	// Check current status
	chrome.storage.sync.get("disabledUntil", () => {
		const now = Date.now();

		if (todayToggle.checked) {
			// Disable until end of day
			const endOfDay = new Date(now);
			endOfDay.setHours(23, 59, 59, 999);

			chrome.storage.sync.set({ disabledUntil: endOfDay.getTime() }, () => {
				showReloadNotification();
			});
		} else {
			// Enable by clearing the timestamp
			chrome.storage.sync.remove("disabledUntil", () => {
				showReloadNotification();
			});
		}
	});
});

// Reload button click
reloadButton.addEventListener("click", () => {
	chrome.tabs.reload();
	window.close();
});

// Open extension settings
openSettingsBtn.addEventListener("click", () => {
	chrome.runtime.openOptionsPage();
	window.close();
});

// Initialize the popup
document.addEventListener("DOMContentLoaded", checkStatus);
