interface Options {
  config?: string | boolean
  cwd?: string
  lineBreak?: boolean
  list?: boolean
  verbose?: boolean
  dryRun?: boolean
}

export interface SetupOptions extends Options{
  progress?: boolean
}

export interface UnlinkDependencyOptions extends Options {
  save?: boolean
}

export interface LinkDependencyOptions extends UnlinkDependencyOptions {
  junctions?: boolean
}

export declare type Dependencies = string[] | null | undefined

// Enables linking the specified dependencies to directories in the local file
// system and creates the links right away.
export function linkDependencies(deps?: Dependencies, options?: LinkDependencyOptions): Promise<void>

// Stops linking the specified dependencies to directories in the local file
// system, and removes the links right away.
export function unlinkDependencies(deps?: Dependencies, options?: UnlinkDependencyOptions): Promise<void>

// Prepares package.json and other configuration files to automate linking
// of selected dependencies using this package.
export function setupLinkDependencies(options?: SetupOptions): Promise<void>
