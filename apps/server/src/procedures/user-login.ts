import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { publicProcedure } from '../trpc'
import { db } from '../database'

const { JWT_SECRET } = process.env

if (JWT_SECRET === undefined) {
  throw new Error('JWT_SECRET must be set')
}

export const userLogin = publicProcedure
  .input(
    z.object({
      name: z.string(),
      password: z.string()
    })
  )
  .query(async req => {
    const user = await db
      .selectFrom('user')
      .select(['id', 'password'])
      .where('name', '=', req.input.name)
      .executeTakeFirst()

    if (user === undefined) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    if (!(await argon2.verify(user.password, req.input.password))) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return {
      token: jwt.sign({ id: user.id }, JWT_SECRET)
    }
  })
