type Handler = (payload: any) => void
const channels: Record<string, Set<Handler>> = {}
export function subscribe(event: string, handler: Handler) {
  if (!channels[event]) channels[event] = new Set()
  channels[event].add(handler)
  return () => channels[event].delete(handler)
}
export function publish(event: string, payload: any) {
  if (!channels[event]) return
  channels[event].forEach(h => h(payload))
}
