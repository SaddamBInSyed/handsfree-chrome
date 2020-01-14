/**
 * Autostart
 * - Happens when a user clicks "start webcam" from popup
 */
Handsfree.libSrc = '/handsfree/'
handsfree = new Handsfree({ autostart: true })

/**
 * Plugins only run with a media stream, so lets set a variable to know that we have it
 */
Handsfree.use('approved', {
  onUse() {
    chrome.storage.local.get(['hasCapturedStream'], (data) => {
      this.isApproved = data.hasCapturedStream
    })
  },

  onFrame() {
    if (!this.isApproved) {
      this.isApproved = true
      chrome.runtime.sendMessage({ action: 'start' })
      chrome.storage.local.set({ hasCapturedStream: true })
    }
  }
})
