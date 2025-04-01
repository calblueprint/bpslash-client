// Taken in large part from Claude 3.7 lmao
// Taken in large part from short-d/short-ext :)
const prefix = "bp/";
const searchProviders = [
  "google.com/search",
  "bing.com/search",
  "duckduckgo.com/",
  "ecosia.org/search",
];

// Set up event listener for tab updates to handle search engine queries
// and direct address bar inputs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    try {
      // Check if URL is from a search engine
      if (searchProviders.some(provider => tab.url.includes(provider))) {
        const url = new URL(tab.url);
        const searchQuery = url.searchParams.get("q") || url.searchParams.get("p") || url.searchParams.get("query");

        if (searchQuery && searchQuery.includes(prefix)) {
          // Extract the path after the prefix
          const path = searchQuery.substring(searchQuery.lastIndexOf(prefix) + prefix.length).trim();
          const redirectUrl = `https://go.calblueprint.org/?q=${encodeURIComponent(path)}`;

          // Redirect the tab
          chrome.tabs.update(tabId, { url: redirectUrl });
        }
      }
      // Check for direct "bp/" input in the address bar
      // This handles cases where the user types bp/something directly
      else if (tab.url.startsWith(prefix) || tab.url.includes(`://${prefix}`)) {
        const path = tab.url.substring(tab.url.indexOf(prefix) + prefix.length).trim();
        const redirectUrl = `https://go.calblueprint.org/?q=${encodeURIComponent(path)}`;
        chrome.tabs.update(tabId, { url: redirectUrl });
      }
    } catch (error) {
      console.error("Error processing URL:", error);
    }
  }
});

// Set up declarativeNetRequest rules for handling URLs with bp/ format
async function setupRules() {
  // Clear existing rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRules.map(rule => rule.id)
  });

  // Add rules to capture various formats of bp/ URLs
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      // Rule for when user types "bp/query" directly in the address bar
      // Chrome might interpret this as a search if it's not a valid URL
      {
        id: 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: "https://go.calblueprint.org/?q="
          }
        },
        condition: {
          urlFilter: "bp/*",
          resourceTypes: ["main_frame"]
        }
      },
      // Rule for when Chrome prepends "http://" to the bp/ input
      {
        id: 2,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: "https://go.calblueprint.org/?q=\\1"
          }
        },
        condition: {
          regexFilter: "^http://bp/(.*)$",
          resourceTypes: ["main_frame"]
        }
      },
      // Rule for when Chrome prepends "https://" to the bp/ input
      {
        id: 3,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: "https://go.calblueprint.org/?q=\\1"
          }
        },
        condition: {
          regexFilter: "^https://bp/(.*)$",
          resourceTypes: ["main_frame"]
        }
      }
    ]
  });
}

// Initialize the extension
setupRules().catch(err => console.error("Error setting up rules:", err));
