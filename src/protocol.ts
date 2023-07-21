import { session, net, protocol } from "electron"
import path from "path"
import url from "url"
import behrImage from "./behr.png"

const SCHEME = 'fay'
const BEHR = 'behr'

// This ensures that the renderer process can load
// and stream an image from fay://
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME, privileges: {
      bypassCSP: true,
      standard: true,
      stream: true
    }
  }
])

/**
 * We setup a fay:// protocol that works within your app.
 * Whenever the renderer makes a request to, say, fay://behr.png,
 * this handler will take over and decide what to return.
 * 
 * We could return a file, or we could return a buffer, or we could
 * return a stream. In this case, we're returning a fetch stream.
 */
export function setupProtocol() {
  session.defaultSession.protocol.handle(SCHEME, (request) => {
    console.log(`Renderer requested ${request.url}`, { __dirname })

    // If we're requesting 'behr.png', we're requesting the default
    // image. Otherwise, try to find the file on disk.
    const isBehr = request.url.endsWith('pets/behr.png')
    const filePath = request.url.slice(`${SCHEME}://`.length)
    const fileUrl = isBehr
      ? url.pathToFileURL(path.join(__dirname, behrImage)).toString()
      : url.pathToFileURL(path.join(filePath)).toString()

    return net.fetch(fileUrl)
  })
}
