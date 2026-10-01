#!/bin/bash
set -e

# Build the production bundle
npm run build

# Stash any uncommitted changes on main so the branch switch stays clean
if [[ $(git diff --exit-code) ]]; then
  git stash
fi

# Switch to the prod branch — from its previous build output (origin/prod) so
# we can detect "no change", falling back to main for the very first deploy.
git fetch origin prod 2>/dev/null || true
if git rev-parse --verify -q origin/prod >/dev/null 2>&1; then
  git checkout -B prod origin/prod
else
  git checkout -B prod
fi

# Remove everything except dist, .gitignore, node_modules and this script
shopt -s extglob
rm -rf !(.gitignore|dist|node_modules|deploy.sh)

# Move the build output to the repo root
cp -r dist/* .

# Commit and force-push to the prod branch (skip cleanly if nothing changed)
git add .
if git diff --cached --quiet; then
  echo "No change — nothing to deploy."
  git checkout main
  git branch -D prod
  if [[ $(git stash list) ]]; then
    git stash pop
  fi
  exit 0
fi

git commit -m "Deploy to GitHub Pages"
git push --force origin prod

# Clean up: back to main, drop the local prod branch, restore any stash
git checkout main
git branch -D prod

if [[ $(git stash list) ]]; then
  git stash pop
fi
