import { githubRequest, repoPath } from "./github.js";

const FIELDS = ["token", "owner", "repo", "branch"];
const form = document.getElementById("settings");
const status = document.getElementById("status");

function show(message, kind = "") {
  status.textContent = message;
  status.className = kind;
}

function readForm() {
  const values = Object.fromEntries(FIELDS.map((f) => [f, form.elements[f].value.trim()]));
  values.branch ||= "main";
  return values;
}

async function load() {
  const saved = await chrome.storage.local.get(FIELDS);
  for (const field of FIELDS) form.elements[field].value = saved[field] ?? "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await chrome.storage.local.set(readForm());
  show("Saved.", "ok");
});

document.getElementById("test").addEventListener("click", async () => {
  const { token, owner, repo, branch } = readForm();
  if (!token || !owner || !repo) return show("Fill in token, owner and repository first.", "error");

  show("Testing…");
  try {
    const repoRes = await githubRequest(token, repoPath(owner, repo));
    if (!repoRes.ok) {
      const { message } = await repoRes.json().catch(() => ({}));
      return show(`Can't access ${owner}/${repo}: ${repoRes.status} ${message ?? ""}`, "error");
    }

    const branchRes = await githubRequest(token, `${repoPath(owner, repo)}/branches/${encodeURIComponent(branch)}`);
    if (!branchRes.ok) {
      return show(
        `Found ${owner}/${repo}, but branch "${branch}" doesn't exist. ` +
          "If the repo is empty, add a README on GitHub first.",
        "error",
      );
    }

    show(`Connected to ${owner}/${repo} on branch "${branch}". Remember to save.`, "ok");
  } catch (err) {
    show(`Request failed: ${err.message}`, "error");
  }
});

load();
