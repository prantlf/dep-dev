# @pkgdep/update

[![Latest version](https://img.shields.io/npm/v/@pkgdep/link)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@pkgdep/link)
](https://www.npmjs.com/package/@pkgdep/link)

Links local NPM packages automatically according to a configuration.

If you link local NPM packages together during the development, using `npm ln`, this package will help you to automate it.

If you want to install some extra NPM dependencies without the package configuration and the package lock and you're affected by the problem that `npm i` and `npm ln` delete one another packages that the other one added, have a look at [`@pkgdep/extra`]. It plays well with `dep-link`.

    # doesn't work                 # works well
    npm ci                          npm ci
    npm i --no-save some-package    dep-extra i some-package
    npm ln other-package            dep-link ln other-package

## Synopsis

Add a symbolic link to `other-package`:

    dep-link ln ../other-package

The contents of `package.json`:

```jsonc
{
  // prepare the project for linked dependencies
  "scripts": {
    "prepare": "dep-link ln"
  },
  "devDependencies": {
    "@pkgdep/link": "^1.0.0"
  }
}
```

The contents of `package-links.json`:

```jsonc
{
  // added by "dep-link ln ..."
  "linkDependencies": {
    "other-package": "../other-package"
  }
}
```

## Installation

This module can be installed in your project using [NPM]. Make sure, that you use [Node.js] version 16.14 or newer.

    npm i -D @pkgdep/link

Package managers [PNPM] and [Yarn] aren't supported, because they didn't implement the command-line flag `--no-save`.

## Usage

If you need to link local NPM packages, you have to do it after installing the managed dependencies:

    npm ci
    npm link other-package

If you need to link more local NPM packages, repeated re-installations will make your work inefficient. You can enable automatic linking to the local NPM packages after the dependencies are installed:

    npx @pkgdep/link s
    npx dep-link ln other-package

And the installation of the remote NPM packages and linking to the local ones will become simpler:

    npm ci

The contents of `package.json` will be extended with a preparation script and a development dependency:

```json
{
  "scripts": {
    "prepare": "dep-link ln"
  },
  "devDependencies": {
    "@pkgdep/link": "^1.0.0"
  }
}
```

And another file will be created to maintain the linked dependencies - `package-links.json`:

```json
{
  "linkDependencies": {
    "other-package": "../other-package"
  }
}
```

Linking to local NPM packages is specific to each developer's machine and shouldn't be maintained in the seource code repository. The file `package-links.json` should be included in `.gitignore`, which is performed by `dep-link s` by default:

```json
package-links.json
```

If you want to automate linking of NPM packages, you can engage [`@pkgdep/extra`] too:

    npx @pkgdep/link s -c package-extras.json
    npx dep-extra i some-package
    npx @pkgdep/link s
    npx dep-link ln ../other-package

And the resulting contents of `package.json`:

```json
{
  "scripts": {
    "prepare": "dep-extra i && dep-link ln"
  },
  "devDependencies": {
    "@pkgdep/link": "^1.0.0",
    "@pkgdep/link": "^1.0.0"
  }
}
```

And `package-extras.json`:

```json
{
  "extraDependencies": {
    "some-package": "^2.0.0"
  }
}
```

And `package-links.json`:

```json
{
  "linkDependencies": {
    "other-package": "../other-package"
  }
}
```

And `.gitignore`:

    package-links.json

## Command-line Interface

    Usage: dep-link [-cdjsbplv] <command> [--] [package...]

    Commands:
      setup|s    prepare a NPM project to use @pkgdep/link
      link|ln    replace a package directory in node_modules with a symbolic
                link to a local directory with the NPM package development
      unlink|un  remove a symbolic link in node_modules with the NPM package

    Options:
      -c|--config <file>    configuration file with the dependencies
      -d|--directory <dir>  directory in which to run the npm commands   (.)
      -j|--[no-]junctions   prefer creating junctions on Windows         (true)
      -s|--[no-]save        save the arguments to the configuration file (true)
      -b|--[no-]line-break  end the configuration file with a line break (true)
      -p|--[no-]progress    enable progress output for the npm commands  (true)
      -l|--[no-]list        enable listing the extra installed packages  (true)
      -v|--[no-]verbose     enable verbose output for the npm commands   (false)
      --dry-run             only print what packages would be installed  (false)
      -V|--version          print version number
      -h|--help             print usage instructions

    The default configuration file is package-links.json in the package root and
    if not found, then package.json. The file should include linkDependencies.

    Examples:
    $ dep-link
    $ dep-link ln my-dep
    $ dep-link ln -d test -v

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
