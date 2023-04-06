import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { type IncomingMessage, type ServerResponse, createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import mime from 'mime'
import * as path from 'path'
import * as fsp from 'fs/promises'
import * as fs from 'fs'

import { type AppRouter, appRouter } from '.'
import { createContext } from './context'
import { db } from './database'

// api server
const apiServer = createHTTPServer({
  middleware: cors({
    origin: true
  }),
  router: appRouter,
  createContext
})

const wss = new WebSocketServer({ server: apiServer.server })
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext
})

apiServer.listen(2022)

// website server
const websiteServerHandler = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === undefined || req.headers.host === undefined) {
    res.writeHead(400)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  if (url.host === undefined) {
    res.writeHead(400)
    res.end()
    return
  }

  const result = await db
    .selectFrom('website')
    .select('access_path as accessPath')
    .where('domain', '=', url.host)
    .innerJoin('user', 'user.id', 'website.user_id')
    .select('user.name as username')
    .executeTakeFirst()

  if (result === undefined) {
    res.writeHead(404)
    res.end()
    return
  }

  const { username, accessPath } = result
  const websitePath = path.join('/home', username, accessPath)

  const readFileAndSend = async (filePath: string) => {
    const fileContent = await fsp.readFile(filePath)
    res.writeHead(200, {
      'Content-Type': mime.getType(filePath) ?? 'text/plain'
    })
    res.end(fileContent)
  }

  const checkFileExists = async (filePath: string) => {
    return (
      await fsp.access(filePath, fsp.constants.F_OK)
        .then(() => true)
        .catch(() => false)
    ) && (
      await fsp.lstat(filePath).then(stat => stat.isFile())
    )
  }

  const requestedPath = path.join(websitePath, url.pathname)
  if (await checkFileExists(requestedPath)) {
    await readFileAndSend(requestedPath)
    return
  }

  const fileToTry = ['index.html', 'index.htm']
  for (const file of fileToTry) {
    const filePath = path.join(websitePath, file)

    if (!(await checkFileExists(filePath))) {
      continue
    }

    await readFileAndSend(filePath)
    return
  }
}

const httpWebsiteServer = createHttpServer(websiteServerHandler)
httpWebsiteServer.listen(80)

const { SSL_CERT_PATH, SSL_KEY_PATH } = process.env

if (SSL_CERT_PATH !== undefined && SSL_KEY_PATH !== undefined) {
  const httpsWebsiteServer = createHttpsServer({
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  }, websiteServerHandler)
  httpsWebsiteServer.listen(443)
}
