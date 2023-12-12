export async function getGeolocation (callback) {
  // получение координат
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const res = `[${latitude}, ${longitude}]`
        callback(res)
      },
      err => callback(null)
    )
  } else return null
}
