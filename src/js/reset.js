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

    Handsfree.disableAll()
    Handsfree.enable('head.pointer')
    Handsfree.enable('head.vertScroll')
    Handsfree.enable('head.click')
    Handsfree.enable('head.morphs')
  }
})
