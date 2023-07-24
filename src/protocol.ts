import { session, net, protocol, app } from "electron"
import url from "url"

const SCHEME = 'fay'
const IMAGES = 'images'

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
    const image = request.url.slice(`${SCHEME}://${IMAGES}/`.length)
    const fileUrl = url.pathToFileURL(app.getPath("userData") + "/images/" + image).toString()
    console.log(`Renderer requested ${fileUrl}`)

    return net.fetch(fileUrl)
  })
}
