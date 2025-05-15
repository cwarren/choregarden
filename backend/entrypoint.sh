#!/bin/sh
export CHOREGARDEN_SECRETS="$(cat /app/.env.json)"
exec node dist/index.js
