#!/bin/sh

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
VERBOSE=--verbose
export NODE_OPTIONS="--enable-source-maps $NODE_OPTIONS"

check() {
  dir=$1
  if [ ! -d "node_modules/$dir" ]; then
    echo "$dir not found"
    exit 1
  fi
}

echo ">>> entering example"
cd "$SCRIPTPATH/../example"
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> installing dependencies"
npm ci --no-audit --no-update-notifier $VERBOSE
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check "build-number-generator"
check "common-path-start"
check "@pkgdep/extra"

echo ">>> done"
