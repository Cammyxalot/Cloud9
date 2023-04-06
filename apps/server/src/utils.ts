import { spawnSync } from 'child_process'
import * as path from 'path'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const { JWT_SECRET } = process.env

if (JWT_SECRET === undefined) {
  throw new Error('JWT_SECRET must be set')
}

export const runScript = (script: string, args: string[] = []) => {
  spawnSync('chmod', ['+x', path.join(__dirname, '..', 'scripts', `${script}.sh`)])
  const result = spawnSync('sh', [path.join(__dirname, '..', 'scripts', `${script}.sh`), ...args], {
    encoding: 'utf-8'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr)
  }

  return result.stdout
}

const JwtTokenSchema = z.object({
  id: z.string()
})

export const decodeAndVerifyJwtToken = async (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET)
  const result = JwtTokenSchema.safeParse(decoded)

  if (!result.success) {
    throw new Error('invalid token')
  }

  return result.data
}
