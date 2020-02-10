// Taken in large part from short-d/short-ext :)
const searchProviders = [
  "google.com/search?q=",
  "bing.com/search?q=",
  "duckduckgo.com/?q=",
  "ecosia.org/search?q="
];
const filter = {
  urls: ["*://bp/*", ...searchProviders.map(url => `*://*.${url}bp%2F*`)],
  types: ["main_frame"]
};

function isFromAddressBar(url) {
  return searchProviders.some(pattern => url.indexOf(pattern) !== -1);
}

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    let { url } = details;

    if (isFromAddressBar(url)) {
      url = new URL(url).searchParams.get("q");
    }
    if (url.includes("bp/")) {
      url = url.substring(3);
    }

    if (url) {
      return {
        redirectUrl: `https://go.calblueprint.org/?q=${url}`
      };
    }
  },
  filter,
  ["blocking"]
);
