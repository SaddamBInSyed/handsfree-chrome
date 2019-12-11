handsfree = new Handsfree({
  isClient: true
})

/**
 * Start tracking if background page is started
 */
chrome.storage.local.get(['isHandsfreeStarted'], function(data) {
  data.isHandsfreeStarted && handsfree.start()
})

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener(function(request) {
  switch (request.action) {
    /**
     * Update the handsfree properties
     */
    case 'updateHandsfree':
      handsfree.head = request.head
      break

    /**
     * Start/stop
     */
    case 'start':
      handsfree.start()
      break
    case 'stop':
      handsfree.stop()
      break

    /**
     * Toggle the debugger on/off
     */
    case 'toggleDebugger':
      if (request.isVisible) {
        handsfree.showDebugger()
      } else {
        handsfree.hideDebugger()
      }
      break

    /**
     * Update debugger pixels
     */
    case 'updateDebugger':
      const $canvas = handsfree.debugger.canvas
      if (request.imageData) {
        const imageData = new ImageData(
          new Uint8ClampedArray(Object.values(request.imageData.data)),
          request.width,
          request.height
        )
        $canvas.getContext('2d').putImageData(imageData, 0, 0)
      }
      break
  }
})
