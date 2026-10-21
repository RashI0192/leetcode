// Thin wrapper over the GitHub REST API, shared by the service worker and options page.

const API = "https://api.github.com";

export function githubRequest(token, path, init = {}) {
  return fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
}

export function repoPath(owner, repo) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}
