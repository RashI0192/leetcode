
name: Update LeetCode Leaderboard

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-leaderboard:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Generate leaderboard
        run: python scripts/update_leaderboard.py

      - name: Commit README changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add README.md

          if git diff --cached --quiet; then
            echo "No leaderboard changes"
            exit 0
          fi

          git commit -m "docs: update LeetCode leaderboard"
          git push
