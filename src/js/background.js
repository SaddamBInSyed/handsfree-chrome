chrome.storage.local.set({
  isHandsfreeStarted: false
})

// Configure Handsfree
Handsfree.libSrc = '/src/handsfree/'
handsfree = new Handsfree()
Handsfree.disableAll()

/**
 * Create a plugin to send debug information to tabs
 */
Handsfree.use('debugger.streamToTab', () => {
  if (handsfree.debugger.isVisible) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs[0]) return

      // Draw webgl into canvas
      const $webgl2 = handsfree.debugger.canvas
      const $debug = handsfree.debugger.debug
      $debug.getContext('2d').drawImage($webgl2, 0, 0)

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateDebugger',
        width: $webgl2.width,
        height: $webgl2.height,
        imageData: $debug
          .getContext('2d')
          .getImageData(0, 0, $webgl2.width, $webgl2.height)
      })
    })
  }
})

/**
 * Sends the inferred values to the client
 */
Handsfree.use('background.updateHandsfree', ({ head }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs[0]) return

    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'updateHandsfree',
      head
    })
  })
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

    /**
     * Toggle the debugger
     */
    case 'toggleDebugger':
      chrome.storage.local.get(['isDebuggerVisible'], (data) => {
        const isVisible = !data.isVisible

        chrome.storage.local.set({ isDebuggerVisible: isVisible }, () => {
          chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; ++i) {
              chrome.tabs.sendMessage(tabs[i].id, {
                action: 'toggleDebugger',
                isVisible
              })

              if (isVisible) {
                handsfree.showDebugger()
              } else {
                handsfree.hideDebugger()
              }
            }
          })
        })
      })
      break
  }
})
