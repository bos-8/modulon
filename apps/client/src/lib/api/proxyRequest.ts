export async function proxyRequest(req: Request, targetUrl: string, method = 'POST') {
  const rawBody = await req.text()
  const originalHeaders = req.headers
  const proxyHeaders = new Headers(originalHeaders)

  proxyHeaders.set('Content-Type', originalHeaders.get('content-type') || 'application/json')

  console.log('[PROXY] Forwarding:', method, targetUrl)
  console.log('[PROXY] Headers:', [...proxyHeaders.entries()])
  console.log('[PROXY] Body:', rawBody)

  const backendResponse = await fetch(targetUrl, {
    method,
    headers: proxyHeaders,
    body: method === 'GET' ? undefined : rawBody,
    credentials: 'include',
  })

  const responseText = await backendResponse.text()

  const resHeaders = new Headers()
  resHeaders.set('Content-Type', backendResponse.headers.get('content-type') || 'application/json')

  const setCookie = backendResponse.headers.get('set-cookie')
  if (setCookie) resHeaders.set('set-cookie', setCookie)

  return new Response(responseText, {
    status: backendResponse.status,
    headers: resHeaders,
  })
}
