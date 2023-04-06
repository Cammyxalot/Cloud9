import { spawnSync } from 'child_process'
import * as path from 'path'

export const runScript = (script: string, args: string[] = []) => {
  spawnSync('chmod', [
    '+x',
    path.join(__dirname, '..', 'scripts', `${script}.sh`)
  ])
  const result = spawnSync(
    'sh',
    [path.join(__dirname, '..', 'scripts', `${script}.sh`), ...args],
    {
      encoding: 'utf-8'
    }
  )

  if (result.status !== 0) {
    throw new Error(result.stderr)
  }

  return result.stdout
}
