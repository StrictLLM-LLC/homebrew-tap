# StrictLLM Homebrew tap

This tap distributes the signed macOS builds published in the
[StrictLLM download repository](https://github.com/StrictLLM-LLC/download/releases).
It supports both Apple Silicon and Intel Macs.

## Install

```sh
brew tap StrictLLM-LLC/tap
brew install --cask strictllm
```

Upgrade with `brew upgrade --cask strictllm` and uninstall with
`brew uninstall --cask strictllm`. To also delete StrictLLM Chat's local app
data, use `brew uninstall --zap --cask strictllm`.

## Release updates

After a tagged StrictLLM deployment publishes all platform assets, its release
workflow sends this tap a `repository_dispatch` event with type
`strictllm-release` and the exact release tag. The tap requires both macOS DMGs
and their GitHub SHA-256 digests, updates the Apple Silicon and Intel cask
entries, validates the result with Homebrew, and commits the bump to `main`.

There is no polling schedule. The workflow can still be started manually as a
recovery mechanism; manual runs use the latest published release.
