// Taken in large part from short-d/short-ext :)
const prefix = "bp/";
const searchProviders = [
  "google.com/search?",
  "bing.com/search?",
  "duckduckgo.com/?",
  "ecosia.org/search?"
];
const filter = {
  urls: [`*://${prefix}*`, ...searchProviders.map(url => `*://*.${url}*`)],
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
    if (url.includes(prefix)) {
      url = url.substring(url.lastIndexOf(prefix) + prefix.length).trim();
      return {
        redirectUrl: `https://go.calblueprint.org/?q=${url}`
      };
    }
  },
  filter,
  ["blocking"]
);
