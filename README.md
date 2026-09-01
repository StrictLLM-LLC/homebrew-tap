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
