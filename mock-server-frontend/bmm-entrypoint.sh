#!/bin/sh
# vim:sw=4:ts=4:et

set -e

echo "STARTED"

envsubst < /usr/share/nginx/html/assets/env.template.js

envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

echo "FINISHED"

exec "$@"