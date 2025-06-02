// @file: apps/client/src/lib/api/proxyRequest.ts

export async function proxyRequest(req: Request, targetUrl: string, method = 'POST') {
  const rawBody = await req.text()
  const contentType = req.headers.get('content-type') || 'application/json'

  console.log('[PROXY] Forwarding:', method, targetUrl)
  console.log('[PROXY] Content-Type:', contentType)
  console.log('[PROXY] Body:', rawBody)

  const backendResponse = await fetch(targetUrl, {
    method,
    headers: {
      'Content-Type': contentType,
      'cookie': req.headers.get('cookie') ?? '',
    },
    body: method === 'GET' ? undefined : rawBody,
    credentials: 'include',
  })

  const responseText = await backendResponse.text()

  return new Response(responseText, {
    status: backendResponse.status,
    headers: {
      'Content-Type': backendResponse.headers.get('content-type') || 'application/json',
      'set-cookie': backendResponse.headers.get('set-cookie') ?? '',
    },
  })
}
