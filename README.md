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

The `Update cask from StrictLLM releases` workflow checks the latest published
release in `StrictLLM-LLC/download` every hour. When the version changes, it
requires both macOS DMGs and their GitHub SHA-256 digests, updates the Apple
Silicon and Intel cask entries, validates the result with Homebrew, and commits
the bump to `main`.

The workflow can also be started manually or immediately through a
`repository_dispatch` event with type `strictllm-release`.
