cask "strictllm" do
  version "2.2.10"

  on_arm do
    sha256 "0d17c1e213f146d590b9208ea7cf93e94620d916126266556a387d76b1f18e93"

    url "https://github.com/StrictLLM-LLC/download/releases/download/v#{version}/StrictLLM-#{version}-macos-arm64-StrictLLM.Chat-#{version}-arm64.dmg"
  end
  on_intel do
    sha256 "e0e68a80f6cb7061fadfd77c65d74f3592322d086a535b2806862198b50e4502"

    url "https://github.com/StrictLLM-LLC/download/releases/download/v#{version}/StrictLLM-#{version}-macos-x64-StrictLLM.Chat-#{version}.dmg"
  end

  name "StrictLLM Chat"
  desc "Secure local chat interface for large language models"
  homepage "https://strictllm.com/"

  livecheck do
    url "https://github.com/StrictLLM-LLC/download"
    strategy :github_latest
  end

  depends_on macos: :ventura

  app "StrictLLM Chat.app"

  uninstall quit: "com.strictllm.chat"

  zap trash: [
    "~/Library/Application Support/StrictLLM Chat",
    "~/Library/Caches/com.strictllm.chat",
    "~/Library/Caches/com.strictllm.chat.ShipIt",
    "~/Library/HTTPStorages/com.strictllm.chat",
    "~/Library/HTTPStorages/com.strictllm.chat.binarycookies",
    "~/Library/Logs/StrictLLM Chat",
    "~/Library/Preferences/com.strictllm.chat.plist",
    "~/Library/Saved Application State/com.strictllm.chat.savedState",
  ]
end
