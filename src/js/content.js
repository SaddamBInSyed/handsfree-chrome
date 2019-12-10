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
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'updateHandsfree':
      handsfree.head = request.head
      break

    case 'start':
      handsfree.start()
      break

    case 'stop':
      handsfree.stop()
      break
  }
})
