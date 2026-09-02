# Helpers for the Rocketflare screenshot pass. Source this file: `. /tmp/rf-screens/_rf.sh`
CLI=~/.npm/_npx/7bdebd52403a7aa1/node_modules/.bin/chrome-devtools
X='Update available\|npm install -g\|^$\|^Emulating viewport'
cd() { command cd "$@" >/dev/null 2>&1; }  # cwd irrelevant for the daemon
cdt() { "$CLI" "$@" 2>&1 | grep -v "$X"; }
nav() { cdt navigate_page --url "$1" | head -2; }
# waitfor <text> [timeoutSec]: poll innerText until it contains <text>
waitfor() {
  local t="$1" n="${2:-30}" i=0
  while [ $i -lt "$n" ]; do
    r=$("$CLI" evaluate_script "() => document.body.innerText.includes($(printf '%s' "$t" | node -e 'process.stdout.write(JSON.stringify(require("fs").readFileSync(0,"utf8")))'))" 2>/dev/null | grep -c true)
    [ "$r" -gt 0 ] && { echo "waitfor ok: $t (${i}s)"; return 0; }
    sleep 1; i=$((i+1))
  done
  echo "waitfor TIMEOUT: $t"; return 1
}
# HIDE_JS: hide dev-only chrome before a capture
HIDE_JS='() => { const hide = el => { if (el) el.style.display = "none" };
  document.querySelectorAll("div[role=\"status\"].alert-warning, .tsqd-parent-container, .tsqd-open-btn-container, #react-query-devtools, vite-error-overlay, .toast, [title^=\"Dev environment\"], [title^=\"Staging environment\"]").forEach(hide);
  document.querySelectorAll("button").forEach(b => { if (/tanstack/i.test(b.getAttribute("aria-label") || "")) hide(b) });
  return "hidden" }'
hide() { cdt evaluate_script "$HIDE_JS" | grep -c hidden >/dev/null; }
# theme <light|dark>: click the app's own toggle (keeps its icon in sync); localStorage.theme persists it
theme() { cdt evaluate_script "() => { const want='rocketflare-$1'; if (document.documentElement.dataset.theme !== want) { const b=document.querySelector('button[aria-label^=\"Switch to\"]'); if (b) b.click(); else { localStorage.setItem('theme', want); document.documentElement.dataset.theme = want } } return document.documentElement.dataset.theme }" | tail -1; sleep 0.4; }
# shot <stem> <light|dark>
shot() { hide; cdt take_screenshot --filePath "/tmp/rf-screens/$1.$2.png" | grep -i "saved\|error"; }
# both <stem>: light then dark then back to light
both() { theme light >/dev/null; shot "$1" light; theme dark >/dev/null; hide; shot "$1" dark; theme light >/dev/null; }
errs() { cdt list_console_messages --types error | grep -v "^## \|Showing" | head -${1:-8}; }
