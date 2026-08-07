#!/usr/bin/env bash

set -uo pipefail

NAME="pulse-cli-$$"

cleanup() {
    sudo docker rm -f "$NAME" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

sudo docker rm -f "$NAME" >/dev/null 2>&1 || true

sudo docker run \
    --name "$NAME" \
    --rm \
    --init \
    -it \
    --hostname "$(hostname)" \
    -v /var/lib/pulse:/var/lib/pulse \
    -v /opt/pulse:/opt/pulse \
    -v /var/run/docker.sock:/var/run/docker.sock \
    pulse:latest \
    "$@"

STATUS=$?

exit $STATUS