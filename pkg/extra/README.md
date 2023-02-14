# @pkgdep/extra

[![Latest version](https://img.shields.io/npm/v/@pkgdep/extra)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@pkgdep/extra)
](https://www.npmjs.com/package/@pkgdep/extra)

Installs extra configured NPM packages without saving them as dependencies to package.json.

If you want to install a part of NPM dependencies using the package configuration and the package lock and another part without it, using `npm i --no-save`, this package will help you to automate it.

If you link NPM packages together during the development and you're affected by the problem that `npm i` and `npm ln` delete one another packages that the other one added, have a look at [`@pkgdep/link`]. It plays well with `dep-extra`.

    # doesn't work                 # works well
    npm ci                          npm ci
    npm i --no-save some-package    dep-extra i some-package
    npm ln other-package            dep-link ln other-package

## Synopsis

Add an extra dependency on `some-package`:

    dep-extra i some-package@^2.0.0

The contents of `package.json`:

```jsonc
{
  // prepare the project for extra dependencies
  "scripts": {
    "prepare": "dep-extra i"
  },
  "devDependencies": {
    "@pkgdep/extra": "^1.0.0"
  },
  // added by "dep-extra i ..."
  "extraDependencies": {
    "some-package": "^2.0.0"
  }
}
```

## Installation

This module can be installed in your project using [NPM]. Make sure, that you use [Node.js] version 16.14 or newer.

    npm i -D @pkgdep/extra

Package managers [PNPM] and [Yarn] aren't supported, because they didn't implement the command-line flag `--no-save`.

## Usage

If you need to install extra NPM packages, which aren't managed by `package.json`, you have to do it after installing the managed dependencies:

    npm ci
    npm i --no-save some-package

If you need to keep more extra NPM packages installed, repeated re-installations will make your work inefficient. You can enable automatic installation of the extra NPM packages together with the managed ones:

    npx @pkgdep/extra s
    npx @pkgdep/extra i some-package

And the installation of both managed and extra NPM packages will become simpler:

    npm ci

The contents of `package.json` will be extended with a preparation script, a development dependency and a section for the extra dependencies:

```json
{
  "scripts": {
    "prepare": "dep-extra i"
  },
  "devDependencies": {
    "@pkgdep/extra": "^1.0.0"
  },
  "extraDependencies": {
    "some-package": "^2.0.0"
  }
}
```

If you want to store the extra dependencies outside of `package.json`, you can request the file name `package-extras.json`, which will be tried by default before `package.json`:

    npx @pkgdep/extra s -c package-extras.json

If you want to automate linking of NPM packages, you can engage [`@pkgdep/link`] too. See the [example on the project page].

## Command-line Interface

    Usage: dep-extra [-cdsbplv] <command> [--] [package...]

    Commands:
      setup|s                   prepare a NPM project to use @pkgdep/extra
      install|i|add             install an extra dependency and if none
                                provided, read the configuration file
      uninstall|un|remove|rm|r  uninstall an extra dependency

    Options:
      -c|--config <file>    configuration file with the dependencies
      -d|--directory <dir>  directory in which to run the npm commands   (.)
      -s|--[no-]save        save the arguments to the configuration file (true)
      -b|--[no-]line-break  end the configuration file with a line break (true)
      -p|--[no-]progress    enable progress output for the npm commands  (true)
      -l|--[no-]list        enable listing the extra installed packages  (true)
      -v|--[no-]verbose     enable verbose output for the npm commands   (false)
      --dry-run             only print what packages would be installed  (false)
      -V|--version          print version number
      -h|--help             print usage instructions

    The default configuration file is package-extras.json in the package root and
    if not found, then package.json. The file should include extraDependencies.

    Examples:
    $ dep-extra
    $ dep-extra i my-dep
    $ dep-extra i -d test -v

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using `npm test`.

## License

Copyright (c) 2023 Ferdinand Prantl

Licensed under the MIT license.

[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[`@pkgdep/link`]: https://www.npmjs.com/package/@pkgdep/link
[example on the project page]: ../../README.md#extra-and-link
