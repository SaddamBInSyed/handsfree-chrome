chrome.storage.local.set({
  isHandsfreeStarted: false
})

// Configure Handsfree
Handsfree.libSrc = '/src/handsfree/'
handsfree = new Handsfree({
  isServer: true
})

/**
 * Sends the inferred values to the client
 */
handsfree.onServerFrame = function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'updateHandsfree',
      head: handsfree.head,
      pointer: handsfree.pointer
    })
  })
}

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
chrome.runtime.onMessage.addListener(function(message) {
  switch (message.action) {
    /**
     * Tell all tabs to start running plugins
     */
    case 'start':
      chrome.storage.local.set(
        {
          isHandsfreeStarted: true
        },
        function() {
          chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; ++i) {
              chrome.tabs.sendMessage(tabs[i].id, { action: 'start' })
            }
          })
          handsfree.start()
        }
      )
      break

    /**
     * Tell all tabs to stop listening
     */
    case 'stop':
      chrome.storage.local.set(
        {
          isHandsfreeStarted: false
        },
        function() {
          chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; ++i) {
              chrome.tabs.sendMessage(tabs[i].id, { action: 'stop' })
            }
          })
          handsfree.stop()
        }
      )
      break
  }
})
