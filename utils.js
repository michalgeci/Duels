// schedule code at time
export function startAt(startTimestamp, callback) {
  let time = Date.now()
  return setTimeout(() => {
    callback()
  }, startTimestamp - time)
}
