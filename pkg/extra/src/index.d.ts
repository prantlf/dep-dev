export interface SetupOptions {
  config?: string | boolean
  cwd?: string
  lineBreak?: boolean
  progress?: boolean
  list?: boolean
  verbose?: boolean
  dryRun?: boolean
}

export interface DependencyOptions extends SetupOptions {
  save?: boolean
}

export declare type Dependencies = string[] | null | undefined

// Enables installing the extra specified dependencies and performs
// the installation right away.
export function installExtraDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

// Stops installing the extra specified dependencies and uninstalls them
// right away.
export function uninstallExtraDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

// Prepares package.json and other configuration files to automate installing
// of extra selected dependencies using this package.
export function setupExtraDependencies(options?: SetupOptions): Promise<void>
