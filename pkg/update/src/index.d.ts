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

export function upgradeDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

export function downgradeDependencies(deps?: Dependencies, options?: DependencyOptions): Promise<void>

export function setupUpdateDependencies(options?: SetupOptions): Promise<void>
