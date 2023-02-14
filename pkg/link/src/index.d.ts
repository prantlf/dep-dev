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

export function linkDependencies(deps?: Dependencies, options?: LinkDependencyOptions): Promise<void>

export function unlinkDependencies(deps?: Dependencies, options?: UnlinkDependencyOptions): Promise<void>

export function setupLinkDependencies(options?: SetupOptions): Promise<void>
