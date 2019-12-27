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
Handsfree.use('debugger.streamToTab', {
  onFrame() {
    if (handsfree.debugger.isVisible) {
      this.streamDebug()
    }
  },

  /**
   * Stream debug information to client
   * - This is a secure but very slow process, so lets throttle it
   */
  streamDebug: Handsfree.throttle(function() {
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
  }, 250)
})

/**
 * Sends the inferred values to the client
 */
Handsfree.use('background.updateHandsfree', ({ head, body }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs[0]) return

    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'updateHandsfree',
      head,
      body
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
        const isVisible = !data.isDebuggerVisible

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

    /**
     * Navigate to next tab
     */
    case 'nextTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].index

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          let newTabId = 0

          if (tabs.length > 1) {
            if (tabId < tabs.length - 1) newTabId = tabId + 1
            else newTabId = 0
          }

          chrome.tabs.update(tabs[newTabId].id, { active: true })
        })
      })
      break

    /**
     * Navigate to previous tab
     */
    case 'prevTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].index

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          let newTabId = 0

          if (tabs.length > 1) {
            if (tabId > 0) newTabId = tabId - 1
            else newTabId = tabs.length - 1
          }

          chrome.tabs.update(tabs[newTabId].id, { active: true })
        })
      })
      break

    /**
     * Create a new tab
     */
    case 'newTab':
      chrome.tabs.create({
        url: 'https://handsfree.js.org/#/chrome/newtab',
        active: true
      })
      break

    /**
     * Remove current tab
     */
    case 'closeTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.remove(tabs[0].id)
      })
      break

    /**
     * Traverse history
     */
    case 'goBack':
      chrome.tabs.goBack()
      break
    case 'goForward':
      chrome.tabs.goForward()
      break

    /**
     * Pass clicks through into iframe
     */
    case 'clickThroughDashboard':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'start' })
      })
      break

    /**
     * Toggles a model on/off, optionally throttling it
     *
     * @param {Boolean} message.enabled Whether to enable the model or not
     * @param {String} message.name The model to throttle ['head', 'bodypix']
     * @param {Integer} message.throttle How much to throttle the model by
     */
    case 'toggleModel':
      handsfree.model[message.model].enabled = message.enabled
      handsfree.reload()

      if (message.hasOwnProperty('throttle')) {
        handsfree.throttleModel(message.model, message.throttle)
      }

      handsfree.zeroWebojiData()
      handsfree.zeroBodypixData()
      break
  }
})

/**
 * Update current tab
 * @see https://developer.chrome.com/extensions/tabs#event-onActivated
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, {
    action: 'resetBackgroundPage'
  })
})
