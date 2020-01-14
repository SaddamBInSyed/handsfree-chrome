const $start = document.querySelector('#start-webcam')
const $stop = document.querySelector('#stop-webcam')
const $toggleDebugger = document.querySelector('#toggle-debugger')

/**
 * Start the webcam
 * - If the user hasn't approved permissions yet, then visit the options page first
 */
$start.addEventListener('click', () => {
  chrome.storage.local.get(['hasCapturedStream'], (data) => {
    if (data.hasCapturedStream) {
      chrome.runtime.sendMessage({ action: 'start' })
      setHandsfreeState(true)
    } else {
      chrome.tabs.create({ url: '/chrome/options.html' })
    }
    window.close()
  })
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

/**
 * Toggle the debugger on/off
 */
$toggleDebugger.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'toggleDebugger' })
})
