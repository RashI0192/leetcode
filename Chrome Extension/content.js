// Isolated-world content script: turns an "Accepted" signal from intercept.js
// into full submission details and hands them to the service worker.

const SUBMISSION_QUERY = `
  query submissionDetails($id: Int!) {
    submissionDetails(submissionId: $id) {
      code
      timestamp
      statusCode
      lang { name }
      question { questionFrontendId titleSlug title }
    }
  }`;

const ACCEPTED = 10;

const RECENT_ACCEPTED_QUERY = `
  query recentAcSubmissionList($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id titleSlug
    }
  }`;

const USER_STATUS_QUERY = `query userStatus { userStatus { username } }`;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

async function fetchSubmission(submissionId) {
  const res = await fetch(`${location.origin}/graphql/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrftoken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      operationName: "submissionDetails",
      query: SUBMISSION_QUERY,
      variables: { id: Number(submissionId) },
    }),
  });
  if (!res.ok) throw new Error(`LeetCode GraphQL returned ${res.status}`);

  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
  return data?.submissionDetails;
}

async function findLatestAcceptedSubmission() {
  const userRes = await fetch(`${location.origin}/graphql/`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrftoken": getCookie("csrftoken") },
    body: JSON.stringify({ operationName: "userStatus", query: USER_STATUS_QUERY, variables: {} }),
  });
  if (!userRes.ok) throw new Error(`LeetCode user lookup returned ${userRes.status}`);
  const userJson = await userRes.json();
  const username = userJson.data?.userStatus?.username;
  if (!username) throw new Error("You must be signed in to LeetCode.");

  const res = await fetch(`${location.origin}/graphql/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrftoken": getCookie("csrftoken") },
    body: JSON.stringify({
      operationName: "recentAcSubmissionList",
      query: RECENT_ACCEPTED_QUERY,
      variables: { username, limit: 20 },
    }),
  });
  if (!res.ok) throw new Error(`LeetCode returned ${res.status}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
  const slug = location.pathname.match(/\/problems\/([^/]+)/)?.[1];
  return data?.recentAcSubmissionList?.find((s) => s.titleSlug === slug);
}

function defaultSolutionPath(details) {
  const number = String(details.question.questionFrontendId).padStart(4, "0");
  const extension = ({
    c: "c", "c++": "cpp", "c#": "cs", java: "java", javascript: "js",
    typescript: "ts", python: "py", python3: "py", go: "go", rust: "rs",
    kotlin: "kt", swift: "swift", ruby: "rb", php: "php", dart: "dart",
  }[details.lang.name.toLowerCase()] || details.lang.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return `rashi/${number}-${details.question.titleSlug}/solution.${extension}`;
}

function askForSolutionPath(defaultPath) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    const dialog = document.createElement("form");
    overlay.setAttribute("role", "presentation");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = `
      <h2>Choose a GitHub path</h2>
      <p>Change the folder or file name for this solution before pushing.</p>
      <label>Repository path
        <input name="path" type="text" value="${defaultPath.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" required />
      </label>
      <div class="lc-gh-dialog-buttons">
        <button type="button" data-cancel>Cancel</button>
        <button type="submit">Push to GitHub</button>
      </div>`;
    Object.assign(overlay.style, {
      position: "fixed", inset: "0", zIndex: "1000000", display: "grid", placeItems: "center",
      background: "#0008", fontFamily: "system-ui, sans-serif",
    });
    Object.assign(dialog.style, {
      width: "min(460px, calc(100vw - 32px))", boxSizing: "border-box", padding: "22px",
      borderRadius: "12px", background: "Canvas", color: "CanvasText", boxShadow: "0 8px 32px #0008",
    });
    const style = document.createElement("style");
    style.textContent = `
      #lc-gh-path-dialog h2 { margin: 0 0 8px; font-size: 20px; }
      #lc-gh-path-dialog p { margin: 0 0 16px; color: GrayText; }
      #lc-gh-path-dialog label { display: block; font-weight: 600; }
      #lc-gh-path-dialog input { display: block; width: 100%; box-sizing: border-box; margin-top: 6px; padding: 9px; font: inherit; }
      #lc-gh-path-dialog .lc-gh-dialog-buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
      #lc-gh-path-dialog button { padding: 8px 12px; font: inherit; cursor: pointer; }
    `;
    dialog.id = "lc-gh-path-dialog";
    document.head.appendChild(style);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    const close = (value) => { style.remove(); overlay.remove(); resolve(value); };
    dialog.elements.path.focus();
    dialog.elements.path.select();
    dialog.addEventListener("submit", (event) => { event.preventDefault(); close(dialog.elements.path.value.trim()); });
    dialog.querySelector("[data-cancel]").addEventListener("click", () => close(null));
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(null); });
  });
}

async function pushLatestSolution(button) {
  button.disabled = true;
  button.textContent = "Pushing…";
  try {
    const submission = await findLatestAcceptedSubmission();
    if (!submission) throw new Error("No accepted submission found for this problem yet.");
    const details = await fetchSubmission(submission.id);
    button.textContent = "Waiting for path…";
    const path = await askForSolutionPath(defaultSolutionPath(details));
    if (!path) {
      button.textContent = "Push solution";
      button.disabled = false;
      return;
    }
    const result = await chrome.runtime.sendMessage({
      type: "upload",
      submissionId: String(submission.id),
      code: details.code,
      lang: details.lang.name,
      questionFrontendId: details.question.questionFrontendId,
      titleSlug: details.question.titleSlug,
      title: details.question.title,
      path,
    });
    if (result.status === "error") {
      const message = result.error || "Unknown upload error";
      button.textContent = `Failed: ${message}`;
      button.title = message;
      console.error("[lc-gh]", message);
    } else {
      button.textContent = "Pushed ✓";
      button.title = result.path || "Solution pushed to GitHub";
    }
  } catch (err) {
    const message = err?.message || String(err);
    button.textContent = `Failed: ${message}`;
    button.title = message;
    console.error("[lc-gh] manual push failed", err);
  }
  button.disabled = false;
}

function addPushButton() {
  if (document.getElementById("lc-gh-push-button") || !location.pathname.includes("/problems/")) return;
  const button = document.createElement("button");
  button.id = "lc-gh-push-button";
  button.textContent = "Push solution";
  Object.assign(button.style, {
    position: "fixed", right: "24px", bottom: "24px", zIndex: "999999",
    padding: "10px 16px", border: "0", borderRadius: "8px", cursor: "pointer",
    background: "#2da44e", color: "white", fontWeight: "600", boxShadow: "0 2px 8px #0004",
  });
  button.addEventListener("click", () => pushLatestSolution(button));
  document.body.appendChild(button);
}

addPushButton();
setInterval(addPushButton, 2000);

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.data?.source !== "lc-gh") return;
  const { submissionId } = event.data;

  try {
    const details = await fetchSubmission(submissionId);
    if (!details || details.statusCode !== ACCEPTED) return;

    const result = await chrome.runtime.sendMessage({
      type: "upload",
      submissionId: String(submissionId),
      code: details.code,
      lang: details.lang.name,
      questionFrontendId: details.question.questionFrontendId,
      titleSlug: details.question.titleSlug,
      title: details.question.title,
    });
    console.log("[lc-gh]", result);
  } catch (err) {
    console.error("[lc-gh] could not upload submission", submissionId, err);
  }
});
