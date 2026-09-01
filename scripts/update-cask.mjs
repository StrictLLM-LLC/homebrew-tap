#!/usr/bin/env node

import fs from "node:fs";

const CASK_PATH = "Casks/strictllm.rb";
const RELEASE_REPOSITORY = "StrictLLM-LLC/download";

function debug(message, details = {}) {
  if (process.env.DEBUG) {
    console.debug(`[update-cask] ${message}`, details);
  }
}

function assetName(version, architecture) {
  if (architecture === "arm64") {
    return `StrictLLM-${version}-macos-arm64-StrictLLM.Chat-${version}-arm64.dmg`;
  }
  if (architecture === "x64") {
    return `StrictLLM-${version}-macos-x64-StrictLLM.Chat-${version}.dmg`;
  }
  throw new Error(`Unsupported architecture: ${architecture}`);
}

function sha256ForAsset(release, name) {
  const asset = release.assets?.find((candidate) => candidate.name === name);
  if (!asset) {
    throw new Error(`Release ${release.tag_name} is missing required asset ${name}`);
  }

  const match = /^sha256:([0-9a-f]{64})$/i.exec(asset.digest ?? "");
  if (!match) {
    throw new Error(`Release asset ${name} does not have a valid SHA-256 digest`);
  }
  return match[1].toLowerCase();
}

export function metadataFromRelease(release) {
  if (release.draft || release.prerelease) {
    throw new Error(`Release ${release.tag_name ?? "<unknown>"} is not a published stable release`);
  }

  const tagMatch = /^v(\d+\.\d+\.\d+)$/.exec(release.tag_name ?? "");
  if (!tagMatch) {
    throw new Error(`Release tag ${release.tag_name ?? "<missing>"} is not vMAJOR.MINOR.PATCH`);
  }

  const version = tagMatch[1];
  const armAsset = assetName(version, "arm64");
  const intelAsset = assetName(version, "x64");
  const metadata = {
    version,
    armSha256: sha256ForAsset(release, armAsset),
    intelSha256: sha256ForAsset(release, intelAsset),
  };
  debug("Resolved release metadata", metadata);
  return metadata;
}

function replaceOnce(source, pattern, replacement, description) {
  const globalFlags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const matches = source.match(new RegExp(pattern.source, globalFlags));
  if (matches?.length !== 1) {
    throw new Error(`Expected exactly one ${description}, found ${matches?.length ?? 0}`);
  }
  return source.replace(pattern, replacement);
}

export function updateCask(source, metadata) {
  let updated = replaceOnce(
    source,
    /^  version "[^"]+"$/m,
    `  version "${metadata.version}"`,
    "version stanza",
  );
  updated = replaceOnce(
    updated,
    /(^  on_arm do[\s\S]*?^    sha256 ")[0-9a-f]{64}("$)/m,
    (_match, prefix, suffix) => `${prefix}${metadata.armSha256}${suffix}`,
    "Apple Silicon sha256 stanza",
  );
  updated = replaceOnce(
    updated,
    /(^  on_intel do[\s\S]*?^    sha256 ")[0-9a-f]{64}("$)/m,
    (_match, prefix, suffix) => `${prefix}${metadata.intelSha256}${suffix}`,
    "Intel sha256 stanza",
  );
  return updated;
}

export function updateCaskFromRelease(release, caskPath = CASK_PATH) {
  const metadata = metadataFromRelease(release);
  const original = fs.readFileSync(caskPath, "utf8");
  const updated = updateCask(original, metadata);
  if (updated === original) {
    console.log(`StrictLLM cask is already current at ${metadata.version}.`);
    return false;
  }

  fs.writeFileSync(caskPath, updated);
  console.log(`Updated StrictLLM cask to ${metadata.version}.`);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const releasePath = process.argv[2];
  const caskPath = process.argv[3] ?? CASK_PATH;
  if (!releasePath) {
    console.error(`Usage: node scripts/update-cask.mjs <release.json> [${CASK_PATH}]`);
    process.exit(2);
  }

  try {
    const release = JSON.parse(fs.readFileSync(releasePath, "utf8"));
    debug("Updating from GitHub release", {
      repository: RELEASE_REPOSITORY,
      tag: release.tag_name,
      caskPath,
    });
    updateCaskFromRelease(release, caskPath);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
