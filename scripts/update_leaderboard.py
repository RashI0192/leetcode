
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"

PLAYERS = {
    "rashi": "Rashi",
    "noah": "Noah",
}

EXTENSIONS = {
    ".py", ".cpp", ".cc", ".c", ".java",
    ".js", ".ts", ".go", ".rs", ".cs", ".kt"
}

START = "<!-- LEADERBOARD_START -->"
END = "<!-- LEADERBOARD_END -->"


def count_solutions(folder):
    path = ROOT / folder
    if not path.is_dir():
        return 0

    return sum(
        1 for file in path.rglob("*")
        if file.is_file()
        and file.suffix.lower() in EXTENSIONS
    )


def generate_leaderboard():
    scores = [
        (name, count_solutions(folder))
        for folder, name in PLAYERS.items()
    ]

    scores.sort(key=lambda x: (-x[1], x[0]))

    lines = [
        "## 🏆 LeetCode Leaderboard",
        "",
        "| Rank | Player | Questions Solved |",
        "|:---:|:---|---:|",
    ]

    medals = ["🥇", "🥈"]

    for index, (name, count) in enumerate(scores):
        medal = medals[index] if index < 2 else f"#{index + 1}"
        lines.append(f"| {medal} | {name} | {count} |")

    lines.extend([
        "",
        f"**Total solutions:** {sum(score for _, score in scores)}",
        "",
        "_Automatically updated by GitHub Actions._",
    ])

    return "\n".join(lines)


def main():
    content = README.read_text(encoding="utf-8")
    leaderboard = generate_leaderboard()

    replacement = f"{START}\n{leaderboard}\n{END}"

    if START in content and END in content:
        pattern = re.escape(START) + r".*?" + re.escape(END)
        content = re.sub(
            pattern,
            lambda match: replacement,
            content,
            flags=re.DOTALL,
        )
    else:
        content = content.rstrip() + "\n\n" + replacement + "\n"

    README.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
