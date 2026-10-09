#!/usr/bin/env node
// playcover-skills — installer
//
// Copies the bundled `playcover-cli/` skill into the current project's
// `.agents/skills/` folder so a Trae / Anthropic-style agent session
// auto-discovers it on the next session reload.
//
// Usage:
//   npx playcover-skills                 # install into ./.agents/skills/
//   npx github:maclub-net/PlayCover-Skills   # same, runs straight from GitHub
//   npx playcover-skills --path DIR      # install into DIR/.agents/skills/
//   npx playcover-skills --force         # overwrite an existing install
//   npx playcover-skills --uninstall      # remove the skill from this project

import { cpSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "playcover-cli");

function usage() {
  console.log(`playcover-skills — install the PlayCover CLI agent skill

Usage:
  npx playcover-skills                    install into ./.agents/skills/playcover-cli
  npx github:maclub-net/PlayCover-Skills  run straight from GitHub (no npm publish needed)
  npx playcover-skills --path DIR         install into DIR/.agents/skills/playcover-cli
  npx playcover-skills --force            overwrite an existing install
  npx playcover-skills --uninstall        remove the skill from the current project
`);
}

const args = process.argv.slice(2);
let customPath = null;
let force = false;
let uninstall = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-h" || a === "--help") {
    usage();
    process.exit(0);
  } else if (a === "--force" || a === "-f") {
    force = true;
  } else if (a === "--uninstall") {
    uninstall = true;
  } else if (a === "--path") {
    customPath = args[++i];
  } else {
    console.error(`Unknown argument: ${a}`);
    usage();
    process.exit(2);
  }
}

const projectRoot = customPath ? resolve(customPath) : process.cwd();
const dest = join(projectRoot, ".agents", "skills", "playcover-cli");

if (uninstall) {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
    console.log(`Removed ${dest}`);
  } else {
    console.log(`Nothing to remove at ${dest}`);
  }
  process.exit(0);
}

if (!existsSync(src)) {
  console.error(`Error: bundled skill not found at ${src}`);
  console.error(`This should not happen when running via npx. If you cloned the repo, run from the repo root.`);
  process.exit(1);
}

if (existsSync(dest) && !force) {
  console.error(`Destination already exists: ${dest}`);
  console.error(`Use --force to overwrite, or --uninstall to remove first.`);
  process.exit(2);
}

mkdirSync(dirname(dest), { recursive: true });
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

console.log(`Installed playcover-cli skill -> ${dest}`);
console.log(`Restart your editor / agent session in ${projectRoot} to load it.`);
