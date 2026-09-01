import assert from "node:assert/strict";
import test from "node:test";

import { metadataFromRelease, updateCask } from "./update-cask.mjs";

const armDigest = `3${"a".repeat(63)}`;
const intelDigest = `2${"b".repeat(63)}`;
const release = {
  tag_name: "v2.2.0",
  draft: false,
  prerelease: false,
  assets: [
    {
      name: "StrictLLM-2.2.0-macos-arm64-StrictLLM.Chat-2.2.0-arm64.dmg",
      digest: `sha256:${armDigest}`,
    },
    {
      name: "StrictLLM-2.2.0-macos-x64-StrictLLM.Chat-2.2.0.dmg",
      digest: `sha256:${intelDigest}`,
    },
  ],
};

const cask = `cask "strictllm" do
  version "2.1.6"

  on_arm do
    sha256 "${"1".repeat(64)}"
  end
  on_intel do
    sha256 "${"2".repeat(64)}"
  end
end
`;

test("extracts stable release metadata and updates both architectures", () => {
  const metadata = metadataFromRelease(release);
  assert.deepEqual(metadata, {
    version: "2.2.0",
    armSha256: armDigest,
    intelSha256: intelDigest,
  });

  const updated = updateCask(cask, metadata);
  assert.match(updated, /version "2\.2\.0"/);
  assert.match(updated, new RegExp(`on_arm do[\\s\\S]*sha256 "${armDigest}"`));
  assert.match(updated, new RegExp(`on_intel do[\\s\\S]*sha256 "${intelDigest}"`));
});

test("rejects prereleases", () => {
  assert.throws(
    () => metadataFromRelease({ ...release, prerelease: true }),
    /not a published stable release/,
  );
});

test("rejects a release missing a required architecture", () => {
  assert.throws(
    () => metadataFromRelease({ ...release, assets: release.assets.slice(0, 1) }),
    /missing required asset.*macos-x64/,
  );
});

test("rejects an asset without a GitHub SHA-256 digest", () => {
  const assets = release.assets.map((asset, index) =>
    index === 0 ? { ...asset, digest: null } : asset,
  );
  assert.throws(
    () => metadataFromRelease({ ...release, assets }),
    /does not have a valid SHA-256 digest/,
  );
});
