/**
 * Autostart
 */
const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('autostart')) {
  console.log('AUTOSTART')
}
