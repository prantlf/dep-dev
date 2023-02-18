// Lists versions or linked paths of specified dependencies.
export default function listDeps(deps, links) {
  console.log()
  // handle an array of formatted dependency specifications
  if (Array.isArray(deps)) for (const dep of deps) console.log(`+ ${dep}`)
  // handle a object with version or target path specifications
  else for (const name in deps) console.log(`+ ${name}${links ? ' => ' : '@'}${deps[name]}`)
}
