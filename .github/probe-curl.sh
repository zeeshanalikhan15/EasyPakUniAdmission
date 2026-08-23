#!/usr/bin/env bash
set -uo pipefail

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

echo "=== runner IP ==="
curl -s --max-time 10 https://api.ipify.org/ && echo
echo

probe() {
  local label="$1" url="$2"
  shift 2
  local status final title challenge
  status=$(curl -sk --max-time 25 -o /tmp/b.html -w "%{http_code}" "$@" "$url" 2>/dev/null)
  final=$(curl -sk --max-time 25 -o /dev/null -w "%{url_effective}" "$@" "$url" 2>/dev/null)
  title=$(grep -oiE '<title>[^<]*</title>' /tmp/b.html 2>/dev/null | head -1)
  challenge=""
  grep -qiE 'just a moment|cf-browser|checking your browser|attention required' /tmp/b.html && challenge="  [CHALLENGE]"
  printf "  %-32s -> %s  %s%s\n" "$label" "$status" "$title" "$challenge"
  if [[ -n "$final" && "$final" != "$url" ]]; then
    printf "      redirect -> %s\n" "$final"
  fi
}

for url in \
  "https://www.nu.edu.pk/" \
  "https://lums.edu.pk/" \
  "https://nust.edu.pk/" \
  "https://www.uet.edu.pk/" \
  "https://giki.edu.pk/" \
  "https://pucit.edu.pk/" \
  "https://www.pieas.edu.pk/"; do
  echo "### $url"
  probe "default UA" "$url"
  probe "chrome UA" "$url" -A "$UA"
  probe "chrome UA + sec-ch headers" "$url" -A "$UA" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Accept-Language: en-US,en;q=0.9" \
    -H 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "Windows"'
  echo
done
