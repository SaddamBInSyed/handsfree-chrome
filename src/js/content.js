let actions = []
let isAttachedRight = true

const handsfree = new Handsfree({
  isClient: true
})

/**
 * Inject quick actions bar
 */
const $actionsWrap = document.createElement('div')
$actionsWrap.classList.add('handsfree-actions-wrap')
document.body.appendChild($actionsWrap)

addAction('🏠', () => {
  console.log('Clicked 🏠')
})
addAction('🔁', () => {
  isAttachedRight = !isAttachedRight
  if (isAttachedRight) {
    $actionsWrap.classList.remove('handsfree-actions-wrap-left')
  } else {
    $actionsWrap.classList.add('handsfree-actions-wrap-left')
  }
})
addAction('👉', () => {
  console.log('Clicked 👉')
})
addAction('👈', () => {
  console.log('Clicked 👈')
})
addAction('🔍', () => {
  console.log('Clicked 🔍')
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
