export const getVarsInPath = (path: string): string[] => {
  const vars: string[] = []

  if (path.endsWith('.json')) {
    path = path.slice(0, -'.json'.length)
  }

  const explodedPath = path.split('/')

  explodedPath.forEach(pathElement => {
    const isVar = pathElement.startsWith('[') && pathElement.endsWith(']')
    if (isVar) {
      vars.push(pathElement.slice(1, -1))
    }
  })

  return vars
}
