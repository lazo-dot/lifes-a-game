# Von den Hooks eingebunden: Git-Programme (z. B. die Desktop-App) starten Hooks oft ohne den PATH der Shell.
# Findet Node auch unter ~/.local/node-*/bin, /opt/homebrew/bin und /usr/local/bin.
if ! command -v node >/dev/null 2>&1; then
  for d in $(ls -d "$HOME"/.local/node-*/bin 2>/dev/null | sort -r) /opt/homebrew/bin /usr/local/bin; do
    if [ -x "$d/node" ]; then PATH="$d:$PATH"; export PATH; break; fi
  done
fi
command -v node >/dev/null 2>&1 || { echo "Hook: Node nicht gefunden – bitte installieren oder PATH setzen."; exit 1; }
