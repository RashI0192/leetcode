// Service worker: receives accepted submissions from content.js and commits
// them to GitHub via the Contents API.
import { githubRequest, repoPath } from "./github.js";
import { extensionFor } from "./languages.js";

const MAX_REMEMBERED_IDS = 1000;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "upload") return;

  upload(message).then(
    (result) => {
      if (result.status !== "skipped") flashBadge("✓", "#2da44e");
      sendResponse(result);
    },
    (err) => {
      console.error("[lc-gh] upload failed:", err);
      flashBadge("✗", "#cf222e");
      sendResponse({ status: "error", error: err.message });
    },
  );
  return true; // keep the message channel open for the async response
});

async function upload({ submissionId, code, lang, questionFrontendId, titleSlug, title, path: requestedPath }) {
  const { token, owner, repo, branch = "main", uploadedIds = [] } = await chrome.storage.local.get([
    "token",
    "owner",
    "repo",
    "branch",
    "uploadedIds",
  ]);
  if (!token || !owner || !repo) {
    throw new Error("Not configured: set token, owner and repo on the extension's options page.");
  }
  if (uploadedIds.includes(submissionId) && !requestedPath) return { status: "skipped", reason: "already uploaded" };

  const number = String(questionFrontendId).padStart(4, "0");
  const path = requestedPath || `rashi/${number}-${titleSlug}/solution.${extensionFor(lang)}`;
  if (!isValidRepoPath(path)) throw new Error("Invalid path: use a relative folder/file path without '..'.");
  const contentsPath = `${repoPath(owner, repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;

  let sha;
  const existing = await githubRequest(token, `${contentsPath}?ref=${encodeURIComponent(branch)}`);
  if (existing.ok) {
    const file = await existing.json();
    sha = file.sha;
    if (decodeBase64Utf8(file.content) === code) {
      await rememberUpload(uploadedIds, submissionId);
      return { status: "skipped", reason: "unchanged", path };
    }
  } else if (existing.status !== 404) {
    throw new Error(`GitHub GET ${path} failed: ${existing.status} ${await existing.text()}`);
  }

  const verb = sha ? "Update" : "Add";
  const put = await githubRequest(token, contentsPath, {
    method: "PUT",
    body: JSON.stringify({
      message: `${verb} ${number} ${title} (${lang})`,
      content: base64Utf8(code),
      branch,
      ...(sha && { sha }),
    }),
  });
  if (!put.ok) throw new Error(`GitHub PUT ${path} failed: ${put.status} ${await put.text()}`);

  await rememberUpload(uploadedIds, submissionId);
  return { status: sha ? "updated" : "added", path };
}

function isValidRepoPath(path) {
  return typeof path === "string" && path.length <= 500 && path.length > 0 &&
    !path.startsWith("/") && !path.endsWith("/") && !path.includes("\\") &&
    !path.split("/").some((part) => !part || part === "." || part === "..");
}

async function rememberUpload(uploadedIds, submissionId) {
  const updated = [...uploadedIds, submissionId].slice(-MAX_REMEMBERED_IDS);
  await chrome.storage.local.set({ uploadedIds: updated });
}

// btoa/atob only handle Latin-1, so round-trip through UTF-8 bytes.
function base64Utf8(text) {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64Utf8(base64) {
  const binary = atob(base64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

function flashBadge(text, color) {
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 5000);
}
