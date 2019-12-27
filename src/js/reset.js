/**
 * Resets the background page to just a face pointer
 */
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'resetBackgroundPage') {
    chrome.runtime.sendMessage({
      action: 'toggleModel',
      model: 'bodypix',
      enabled: false
    })

    chrome.runtime.sendMessage({
      action: 'toggleModel',
      model: 'head',
      enabled: true,
      throttle: 0
    })
  }
})
