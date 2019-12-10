const $start = document.querySelector('#startWebcam')
const $stop = document.querySelector('#stopWebcam')

/**
 * Start the webcam
 */
$start.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'start' })
  setHandsfreeState(true)
  window.close()

  // Run this when permissions haven't been accepted yet
  // chrome.tabs.create({ url: '/src/options.html?autostart=true' })
})

/**
 * Stop the webcam
 */
$stop.addEventListener('click', () => {
  setHandsfreeState(false)
  chrome.runtime.sendMessage({ action: 'stop' })
  window.close()
})

/**
 * Sets the button class
 */
function setHandsfreeState(isStarted) {
  if (isStarted) {
    $start.classList.add('hidden')
    $stop.classList.remove('hidden')
  } else {
    $start.classList.remove('hidden')
    $stop.classList.add('hidden')
  }
}
chrome.storage.local.get(['isHandsfreeStarted'], function(data) {
  setHandsfreeState(data.isHandsfreeStarted)
})
