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

export function installExtraDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

export function uninstallExtraDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

export function setupExtraDependencies(options?: SetupOptions): Promise<void>
