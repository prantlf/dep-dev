#!/bin/sh

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
VERBOSE=--verbose
export NODE_OPTIONS="--enable-source-maps $NODE_OPTIONS"

check_dir() {
  dir=$1
  if [ ! -d "node_modules/$dir" ]; then
    echo "$dir not found"
    exit 1
  fi
}

check_ver() {
  pkg=$1
  expected=$2
  actual=`../test/get-version.js $pkg`
  if [ "$actual" != "$expected" ]; then
    echo "version of $pkg is $actual instead of $expected"
    exit 1
  fi
}

echo ">>> entering example"
cd "$SCRIPTPATH/../example"
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> restoring configuration"
rm -rf node_modules package-extras.json package-links.json
cp backup/* .
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> installing dependencies"
npm ci --no-audit --no-update-notifier $VERBOSE
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_dir "build-number-generator"
check_dir "common-path-start"
check_ver "@unixcompat/cat.js" "1.0.2"
check_ver "@unixcompat/mkdir.js" "1.1.3"
check_ver "build-number-generator" "2.0.4"
check_ver "common-path-start" "0.0.3"

echo ">>> done"
