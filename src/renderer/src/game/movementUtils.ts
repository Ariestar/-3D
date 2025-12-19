export function getSpeedMultiplier(run: boolean, crouch: boolean) {
  if (run) return 1.6
  if (crouch) return 0.5
  return 1
}
