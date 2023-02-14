#!/bin/sh

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

check_dir() {
  dir=$1
  if [ ! -d "node_modules/$dir" ]; then
    echo "$dir not found"
    exit 1
  fi
}

check_link() {
  link=$1
  if [ ! -L "node_modules/$link" ]; then
    echo "$link is not a link"
    exit 1
  fi
  if [ ! -e "node_modules/$link" ]; then
    echo "$link is a broken link"
    exit 1
  fi
}

check_file() {
  file=$1
  if [ ! -f "node_modules/$file" ]; then
    echo "$file not found"
    exit 1
  fi
}

echo ">>> entering example/original"
cd "$SCRIPTPATH/../example/original"
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> installing dependencies"
npm ci --no-audit --no-update-notifier
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_dir "common-path-start"
check_dir "@unixcompat/cp.js"

echo ">>> entering example/linked"
cd "$SCRIPTPATH/../example/linked"
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> installing dependencies"
npm ci --no-audit --no-update-notifier
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_link "common-path-start"
check_link "@unixcompat/cp.js"
check_link ".bin/cp.js"
check_link "@pkgdep/link"

echo ">>> done"
