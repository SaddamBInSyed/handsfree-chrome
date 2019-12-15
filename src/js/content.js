let actions = []
let isAttachedLeft = false

const handsfree = new Handsfree({
  isClient: true
})

/**
 * Inject quick actions bar
 */
const $actionsWrap = document.createElement('div')
$actionsWrap.classList.add('handsfree-actions-wrap', 'handsfree-hidden')
document.body.appendChild($actionsWrap)

chrome.storage.local.get(['isHandsfreeStarted'], (data) => {
  if (data.isHandsfreeStarted) {
    $actionsWrap.classList.remove('handsfree-hidden')
  } else {
    $actionsWrap.classList.add('handsfree-hidden')
  }
})

chrome.storage.local.get(['isActionsAttachedLeft'], (data) => {
  if (data.isActionsAttachedLeft) {
    isAttachedLeft = true
    $actionsWrap.classList.add('handsfree-actions-wrap-left')
  }
})

/**
 * Home Button
 */
addAction('🏠', () => {
  window.location.href = 'https://handsfree.js.org/#/chrome'
})

/**
 * Change quick actions side
 */
addAction('🔁', () => {
  isAttachedLeft = !isAttachedLeft
  chrome.storage.local.set({ isActionsAttachedLeft: isAttachedLeft })
  if (isAttachedLeft) {
    $actionsWrap.classList.add('handsfree-actions-wrap-left')
  } else {
    $actionsWrap.classList.remove('handsfree-actions-wrap-left')
  }
})

/**
 * Tab right/left
 */
addAction('👉', () => {
  chrome.runtime.sendMessage({ action: 'nextTab' })
})
addAction('👈', () => {
  chrome.runtime.sendMessage({ action: 'prevTab' })
})

/**
 * New tab
 */
addAction('➕', () => {
  chrome.runtime.sendMessage({ action: 'newTab' })
})

/**
 * Close tab
 */
addAction('❌', () => {
  chrome.runtime.sendMessage({ action: 'closeTab' })
})

/**
 * Adds an action button to the actions bar
 * - Updates wrapper z so that it's centered
 *
 * @param {String} content
 * @param {Function} cb The callback to run after a clicked
 */
function addAction(content, cb) {
  const $btn = document.createElement('button')
  $btn.classList.add('handsfree-action-button')
  $btn.innerText = content

  actions.push({
    $el: $btn
  })

  $actionsWrap.style.marginTop = `${-(actions.length / 2) * 60}px`
  $actionsWrap.appendChild($btn)

  $btn.addEventListener('click', function() {
    cb($btn)
  })
}

/**
 * Start tracking if background page is started
 */
chrome.storage.local.get(['isHandsfreeStarted'], function(data) {
  data.isHandsfreeStarted && handsfree.start()
})

/**
 * Toggle debugger
 */
chrome.storage.local.get(['isDebuggerVisible'], function(data) {
  data.isDebuggerVisible && handsfree.showDebugger()
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
      $actionsWrap.classList.remove('handsfree-hidden')
      break
    case 'stop':
      handsfree.stop()
      $actionsWrap.classList.add('handsfree-hidden')
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
