#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
output=${1:-bjj-journey-nas-amd64.tar.gz}
bundle=$(mktemp -d)
trap 'rm -rf -- "$bundle"' EXIT

for image in bjj-journey/app:2.0-nas bjj-journey/init:2.0-nas postgres:17; do
  platform=$(docker image inspect --format '{{.Os}}/{{.Architecture}}' "$image")
  if [[ $platform != linux/amd64 ]]; then
    printf '%s requires linux/amd64, got %s\n' "$image" "$platform" >&2
    exit 1
  fi
done

awk '
  /^  (init|app):$/ { service = substr($1, 1, length($1) - 1) }
  /^    build:$/ { next }
  /^      context: \.$/ { next }
  /^      target: (init|app)$/ {
    print "    image: bjj-journey/" service ":2.0-nas"
    print "    pull_policy: never"
    next
  }
  { print }
  /^    image: postgres:17$/ { print "    pull_policy: never" }
' compose.yaml > "$bundle/compose.yaml"
cp .env.docker.example "$bundle/"
cp docs/nas-bundle.md "$bundle/README.md"
docker save -o "$bundle/bjj-journey-images.tar" bjj-journey/app:2.0-nas bjj-journey/init:2.0-nas postgres:17
tar -C "$bundle" -czf "$output" README.md .env.docker.example compose.yaml bjj-journey-images.tar
