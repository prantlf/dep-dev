# @pkgdep/update

[![Latest version](https://img.shields.io/npm/v/@pkgdep/update)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@pkgdep/update)
](https://www.npmjs.com/package/@pkgdep/update)

Updates configured NPM packages without writing the new versions to package-lock.json.

If you want to install a part of NPM dependencies using the package configuration and the package lock and another part without it, using `npm up --no-save --no-package-lock`, this package will help you to automate it.

If you link NPM packages together during the development and you're affected by the problem that `npm up` and `npm ln` delete one another packages that the other one added, have a look at [`@pkgdep/link`]. It plays well with `@pkgdep/update`.

    # doesn't work                                    # works well
    npm ci                                            npm ci
    npm up --no-save --no-package-lock some-package   @pkgdep/update up some-package
    npm ln other-package                              dep-link ln other-package

## Synopsis

Update a dependency on `some-package` without modifying the package lock:

    @pkgdep/update up some-package

The contents of `package.json`:

```jsonc
{
  // prepare the project for extra dependencies
  "scripts": {
    "prepare": "@pkgdep/update up"
  },
  "devDependencies": {
    "some-package": "^2.0.0",
    "@pkgdep/update": "^1.0.0"
  },
  // added by "@pkgdep/update up ..."
  "updateDependencies": [
    "some-package"
  ]
}
```

## Installation

This module can be installed in your project using [NPM]. Make sure, that you use [Node.js] version 16.14 or newer.

    npm i -D @pkgdep/update

Package managers [PNPM] and [Yarn] aren't supported, because they didn't implement the command-line flag `--no-save`.

## Usage

If you need to update some NPM packages, which ar elocked by `package-lock.json`, you have to do it after installing the managed dependencies:

    npm ci
    npm up --no-save some-package

If you need to continue updating more NPM packages, repeated re-installations will make your work inefficient. You can enable automatic update of thesome NPM packages:

    npx @pkgdep/update s
    npx dep-update up some-package

And the installation of both managed and updated NPM packages will become simpler:

    npm ci

The contents of `package.json` will be extended with a preparation script, a development dependency and a section for the extra dependencies:

```json
{
  "scripts": {
    "prepare": "@pkgdep/update up"
  },
  "devDependencies": {
    "some-package": "^2.0.0",
    "@pkgdep/update": "^1.0.0"
  },
  "updateDependencies": [
    "some-package"
  ]
}
```

If you want to store the extra dependencies outside of `package.json`, you can request the file name `package-updates.json`, which will be tried by default before `package.json`:

    npx @pkgdep/update s -c package-updates.json

If you want to update multipel NPM dependencies by wildcard patterns, you can use [BASH patterns]. For example, the following pattern will match `@unixcompat/cat.js`, `@unixcompat/cp.js`, `@unixcompat/mkdir.js` and `@unixcompat/rm.js`:

    npx dep-update up "@unixcompat/*"

If you want to automate linking of NPM packages, you can engage [`@pkgdep/link`] too. See the [example on the project page].

## Command-line Interface

    Usage: @pkgdep/update [-cdsbplv] <command> [--] [package...]

    Commands:
      setup|s            prepare a NPM project to use @pkgdep/update
      update|upgrade|up  upgrade a dependency and if none provided,
                         read the configuration file
      downgrade|down     downgrade a dependency to the locked version

    Options:
      -c|--config <file>    configuration file with the dependencies
      -d|--directory <dir>  directory in which to run the npm commands   (.)
      -e|--[no-]deep        traverse direct and peer dependencies        (false)
      -s|--[no-]save        save the arguments to the configuration file (true)
      -b|--[no-]line-break  end the configuration file with a line break (true)
      -p|--[no-]progress    enable progress output for the npm commands  (true)
      -l|--[no-]list        enable listing the extra installed packages  (true)
      -v|--[no-]verbose     enable verbose output for the npm commands   (false)
      --dry-run             only print what packages would be installed  (false)
      -V|--version          print version number
      -h|--help             print usage instructions

    The default configuration file is package-updates.json in the package root and
    if not found, then package.json. The file should include updateDependencies.

    Examples:
    $ @pkgdep/update
    $ @pkgdep/update up my-dep
    $ @pkgdep/update up -d test -v

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
[BASH patterns]: https://www.linuxjournal.com/content/pattern-matching-bash