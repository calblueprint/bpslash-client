// Taken in large part from Claude 3.7 lmao
// Taken in large part from short-d/short-ext :)
const prefix = "bp/";
const searchProviders = [
  {
    name: "google.com/search",
    query: "q",
  },
  {
    name: "bing.com/search",
    query: "q",
  },
  {
    name: "duckduckgo.com/",
    query: "q",
  },
  {
    name: "ecosia.org/search",
    query: "q",
  },
  {
    name: "search.brave.com/search",
    query: "q",
  },
  {
    name: "search.yahoo.com/search",
    query: "p",
  },
  {
    name: "qwant.com/",
    query: "q",
  },
  {
    name: "sogou.com/web",
    query: "query",
  },
  {
    name: "baidu.com/s",
    query: "wd",
  },
  {
    name: "ask.com/web",
    query: "q",
  },
];

function parseUrlAndRedirect(tabId, tabUrl) {
  const provider = searchProviders.find((p) => tabUrl.includes(p.name));

  try {
    // Check if URL is from a search engine
    if (provider) {
      const url = new URL(tabUrl);
      const searchQuery = url.searchParams.get(provider.query);

      if (searchQuery && searchQuery.startsWith(prefix)) {
        // Extract the path after the prefix
        const path = searchQuery
          .substring(searchQuery.lastIndexOf(prefix) + prefix.length)
          .trim();
        const redirectUrl = `https://go.calblueprint.org/?q=${encodeURIComponent(
          path
        )}`;

        // Redirect the tab
        chrome.tabs.update(tabId, { url: redirectUrl });
      }
    }
    // Check for direct "bp/" input in the address bar
    // This handles cases where the user types bp/something directly
    else if (tabUrl.startsWith(prefix) || tabUrl.includes(`://${prefix}`)) {
      const path = tabUrl
        .substring(tabUrl.indexOf(prefix) + prefix.length)
        .trim();
      const redirectUrl = `https://go.calblueprint.org/?q=${encodeURIComponent(
        path
      )}`;
      chrome.tabs.update(tabId, { url: redirectUrl });
    }
  } catch (error) {
    console.error("Error processing URL:", error);
  }
}

// Set up event listener for tab updates to handle search engine queries
// and direct address bar inputs
chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, url }) => {
  parseUrlAndRedirect(tabId, url);
});
