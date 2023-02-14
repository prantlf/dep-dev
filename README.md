# Developing with NPM Dependencies

This is a monorepo for [`@pkgdep/extra`], [`@pkgdep/link`] and [`@pkgdep/update`] - tools to automate development with NPM packages. Installs, updates and links configured NPM packages without saving changes to package.json and package-lock.json.

If you use extra NPM packages, which are not maintained by the package lock, or link NPM packages together during the development, you'll be affected by the problem that `npm i` and `npm ln` delete one another packages that the other one added, and that their changes will be lost as soon as you run `npm ci`:

    # doesn't work                  # works well
    npm ci                          npm ci
    npm i --no-save some-package    dep-extra i some-package
    npm ln other-package            dep-link ln other-package

[Many problems](#problems) with `npm i` and `npm ln` have been discussed.

## Packages

See the package directories for more information about their usage.

* [`@pkgdep/extra`] - Installs extra configured NPM packages without saving them as dependencies to package.json.
* [`@pkgdep/link`] - Links local NPM packages automatically according to a configuration.
* [`@pkgdep/update`] - Updates configured NPM packages without writing to package-lock.json.

## Installation

Theses tools can be installed in your project using [NPM]. Make sure, that you use [Node.js] version 16.14 or newer. The package [`@pkgdep/link`] can be used alone or combined with [`@pkgdep/extra`] or [`@pkgdep/update`], which each can be used alone too. The packages [`@pkgdep/extra`] and [`@pkgdep/update`] are usually not combined together.

    npm i -D @pkgdep/extra @pkgdep/link
    npm i -D @pkgdep/update @pkgdep/link

Package managers [PNPM] and [Yarn] aren't supported, because they didn't implement the command-line flag `--no-save`.

## Extra and Link

Automate installing of extra NPM packages and linking of local NPM packages:

    npx @pkgdep/extra s
    npx @pkgdep/link s

Add extra NPM packages to be installed and local NPM packages to be linked:

    npx @pkgdep/extra i some-package
    npx @pkgdep/link ln ../other-package

Install the project dependencies including the extra and linked NPM packages:

    npm ci

And the resulting contents of `package.json`:

```json
{
  "scripts": {
    "prepare": "dep-extra i && dep-link ln"
  },
  "devDependencies": {
    "@pkgdep/extra": "^1.0.0",
    "@pkgdep/link": "^1.0.0"
  },
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

See [`@pkgdep/extra`] and [`@pkgdep/link`] for more information about their usage alone.

## Update and Link

Automate updating of selectedNPM packages and linking of local NPM packages:

    npx @pkgdep/update s
    npx @pkgdep/link s

Add selected NPM packages to be updated and local NPM packages to be linked:

    npx @pkgdep/update up some-package
    npx @pkgdep/link ln ../other-package

Install the project dependencies including the updated and linked NPM packages:

    npm ci

And the resulting contents of `package.json`:

```json
{
  "scripts": {
    "prepare": "dep-update up && dep-link ln"
  },
  "devDependencies": {
    "some-package": "^2.0.0",
    "@pkgdep/update": "^1.0.0",
    "@pkgdep/link": "^1.0.0"
  },
  "updateDependencies": [
    "some-package"
  ]
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

See [`@pkgdep/update`] and [`@pkgdep/link`] for more information about their usage alone.

## Problems

Examples of problems reported about the functionality of `npm i` and `npm ln`:

* [4 reasons to avoid using npm link](https://hirok.io/posts/avoid-npm-link)
* [npm install after npm link deletes linked module dependencies in it's node_modules folder](https://github.com/npm/npm/issues/17287)
* [npm install removes linked packages, npm link replaces linked package contents](https://github.com/npm/cli/issues/2380)
* [npm 5 dedupes even in linked modules](https://github.com/npm/npm/issues/16788)
* [configuration setting to never delete symlinks](https://github.com/npm/npm/pull/18922)
* [npm link unlinks after install of any package](https://github.com/npm/npm/issues/16970)
* [npm install replaces links with downloaded modules](https://github.com/UD-UD/npm-safe-install/issues/15)
* [npm v7 does not install linked packages dependencies](https://github.com/npm/cli/issues/2339)
* [Critical issue with npm link --install-links --save ../package/ deleting the package directory!](https://github.com/npm/cli/issues/4863)

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using `npm test`.

## License

Copyright (c) 2023 Ferdinand Prantl

Licensed under the MIT license.

[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[`@pkgdep/extra`]: ./pkg/extra
[`@pkgdep/link`]: ./pkg/link
[`@pkgdep/update`]: ./pkg/update
