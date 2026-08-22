#!/bin/bash
set -e

# Build the production bundle
npm run build

# Stash any uncommitted changes on main so the branch switch stays clean
if [[ $(git diff --exit-code) ]]; then
  git stash
fi

# Create or switch to the 'prod' branch
git checkout -B prod

# Remove everything except dist, .gitignore, node_modules and this script
shopt -s extglob
rm -rf !(.gitignore|dist|node_modules|deploy.sh)

# Move the build output to the repo root
cp -r dist/* .

# Commit and force-push to the prod branch
git add .
git commit -m "Deploy to GitHub Pages"
git push --force origin prod

# Clean up: back to main, drop the local prod branch, restore any stash
git checkout main
git branch -D prod

if [[ $(git stash list) ]]; then
  git stash pop
fi
