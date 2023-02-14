export default function listDeps(deps, links) {
  console.log()
  if (Array.isArray(deps)) for (const dep of deps) console.log(`+ ${dep}`)
  else for (const name in deps) console.log(`+ ${name}${links ? ' => ' : '@'}${deps[name]}`)
}
