const CLOUDFLARE_ANALYTICS_TOKEN = '7d75914d9a8d48e3acb6a197ed0591a0'

export const initCloudflareAnalytics = () => {
  if (
    !import.meta.env.PROD ||
    window.location.hostname !== 'alexeydev42.com' ||
    !window.location.pathname.startsWith('/phrase-cue/')
  ) {
    return
  }

  const script = document.createElement('script')

  script.type = 'module'
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.dataset.cfBeacon = JSON.stringify({
    token: CLOUDFLARE_ANALYTICS_TOKEN,
  })

  document.body.append(script)
}
