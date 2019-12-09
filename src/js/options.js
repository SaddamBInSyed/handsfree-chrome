/**
 * Autostart
 * - Happens when a user clicks "start webcam" from popup
 */
Handsfree.libSrc = '/handsfree/'
const urlParams = new URLSearchParams(window.location.search)

let handsfree
if (urlParams.get('autostart')) {
  handsfree = new Handsfree({ autostart: true })
}
