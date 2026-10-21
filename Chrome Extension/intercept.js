// Runs in the page's MAIN world so it can observe LeetCode's own network calls.
// After a submit, LeetCode polls /submissions/detail/<id>/check/ until judging
// finishes; when that response says "Accepted" we notify content.js.
(() => {
  const CHECK_RE = /\/submissions\/detail\/(\d+)\/check\/?/;
  const reported = new Set();

  function inspect(url, data) {
    const match = CHECK_RE.exec(url);
    if (!match || !data) return;
    if (data.state !== "SUCCESS" || data.status_msg !== "Accepted") return;

    const submissionId = match[1];
    if (reported.has(submissionId)) return;
    reported.add(submissionId);
    window.postMessage({ source: "lc-gh", submissionId }, location.origin);
  }

  // Never let our hooks break the page: every inspection failure is swallowed.
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);
      if (CHECK_RE.test(url)) {
        response
          .clone()
          .json()
          .then((data) => inspect(url, data))
          .catch(() => {});
      }
    } catch {}
    return response;
  };

  const xhrUrls = new WeakMap();
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    xhrUrls.set(this, String(url));
    return originalOpen.call(this, method, url, ...rest);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    const url = xhrUrls.get(this) || "";
    if (CHECK_RE.test(url)) {
      this.addEventListener("load", () => {
        try {
          const data = this.responseType === "json" ? this.response : JSON.parse(this.responseText);
          inspect(url, data);
        } catch {}
      });
    }
    return originalSend.apply(this, args);
  };
})();
