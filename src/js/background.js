Handsfree.libSrc = '/src/handsfree/'
handsfree = new Handsfree({
  isServer: true
})

/**
 * Sends the inferred values to the client
 */
Handsfree.use('message.bus', {
  onFrame(context) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateHead',
        head: context.head
      })
    })
  }
})

/**
 * Override requestAnimationFrame, which doesn't work in background script
 */
_requestAnimationFrame = requestAnimationFrame
requestAnimationFrame = newRequestAnimationFrame = function(cb) {
  setTimeout(function() {
    cb()
  }, 25)
}

/**
 * Handle listeners
 */
chrome.runtime.onMessage.addListener(function(message, callback) {
  switch (message.data) {
    case 'start':
      handsfree.start()
      break
    case 'stop':
      handsfree.stop()
      break
  }
})
