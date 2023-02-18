export interface SetupOptions {
  config?: string | boolean
  cwd?: string
  lineBreak?: boolean
  progress?: boolean
  list?: boolean
  verbose?: boolean
  dryRun?: boolean
}

export interface DowngradeOptions extends SetupOptions {
  save?: boolean
}

export interface UpgradeOptions extends DowngradeOptions {
  deep?: boolean
}

export declare type Dependencies = string[] | null | undefined

// Collects peer dependencies from the specified packages and traverses them
// recursively to collect peer dependencies of the collected packages etc.
export function upgradeDependencies(deps?: Dependencies, options?: UpgradeOptions): Promise<void>

// Stops upgrading the specified dependencies and downgrades them
// to the version set in the package lock.
export function downgradeDependencies(deps?: Dependencies, options?: DowngradeOptions): Promise<void>

// Prepares package.json and otwer configuration files to automate updates
// of selected dependencies using this package.
export function setupUpdateDependencies(options?: SetupOptions): Promise<void>
