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
  negate=$2
  if [ "$negate" != "" ]; then
    if [ -f "node_modules/$file" ]; then
      echo "$file found"
      exit 1
    fi
  else
    if [ ! -f "node_modules/$file" ]; then
      echo "$file not found"
      exit 1
    fi
  fi
}

echo ">>> entering example"
cd "$SCRIPTPATH/../example"
if [ "$?" != "0" ]; then exit 1; fi
export INIT_CWD=$PWD

echo ">>> restoring configuration"
rm -rf node_modules package-extras.json package-links.json
cp backup/* .
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> installing dependencies"
npm ci --no-audit --no-update-notifier
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_dir "build-number-generator"
check_dir "common-path-start"

echo ">>> initialising extras"
./node_modules/.bin/dep-extra s -c package-extras.json -v
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_file "../package-extras.json"

echo ">>> initialising links"
./node_modules/.bin/dep-link s
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_file "../package-links.json"

echo ">>> adding extras"
./node_modules/.bin/dep-extra i common-path-start
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> adding links"
./node_modules/.bin/dep-link ln \
  ../pkg/link/example/original/node_modules/common-path-start \
  ../pkg/link/example/original/node_modules/@unixcompat/cp.js
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output"
check_dir "build-number-generator"
check_link "common-path-start"
check_link "@unixcompat/cp.js"
check_link ".bin/cp.js"

echo ">>> installing dependencies again"
npm ci --no-audit --no-update-notifier
if [ "$?" != "0" ]; then exit 1; fi

echo ">>> checking output again"
check_dir "build-number-generator"
check_link "common-path-start"
check_link "@unixcompat/cp.js"
check_link ".bin/cp.js"

echo ">>> done"
