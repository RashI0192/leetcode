// LeetCode `lang.name` -> file extension for the committed solution.

const EXTENSIONS = {
  python3: "py",
  python: "py",
  pythondata: "py",
  cpp: "cpp",
  java: "java",
  javascript: "js",
  typescript: "ts",
  c: "c",
  csharp: "cs",
  golang: "go",
  rust: "rs",
  kotlin: "kt",
  swift: "swift",
  ruby: "rb",
  scala: "scala",
  php: "php",
  dart: "dart",
  elixir: "ex",
  erlang: "erl",
  racket: "rkt",
  mysql: "sql",
  mssql: "sql",
  oraclesql: "sql",
  postgresql: "sql",
  bash: "sh",
};

export function extensionFor(lang) {
  return EXTENSIONS[lang] ?? "txt";
}
