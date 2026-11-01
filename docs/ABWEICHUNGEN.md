# Abweichungen vom Leitfaden (v5)

Format: Nr. · Was weicht ab · Grund · Vorschlag für den Leitfaden

1. **Kopier-Build statt „kein Build-Schritt“** · Quellen liegen in `src/` und `public/`, `npm run build` (tools/build.js, ohne Abhängigkeiten) stellt daraus `dist/` zusammen. Die Skripte bleiben klassische Skripte mit Namensraum. · Der Service Worker muss im Wurzelverzeichnis der Website liegen, die Arbeitsliste verlangt aber getrennte Ordner `src/` und `public/`. Außerdem setzt der Build die Cache-Version automatisch aus einem Hash über alle Dateien, damit kein Update mehr an einer vergessenen `VERSION` hängen bleibt. Per Doppelklick startet jetzt `dist/index.html`. · Leitfaden 2: „Prototyp: klassische Skripte, ein Kopier-Build nach `dist/`, kein Bundler.“
2. **Schriften lokal statt von Google Fonts** · Pixelify Sans und VT323 (OFL) liegen in `public/fonts/`. · Prinzip 8 (keine Anfragen an Dritte), und die App ist schon beim ersten Start vollständig offline. · Leitfaden 5.6 / Marketing 4: „Keine externen Anfragen, auch nicht für Schriften.“
