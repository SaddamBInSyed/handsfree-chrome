let actions = []
let isAttachedLeft = false
let isDashboardOpen = false
let hasInjectedDashboard = false
let $dashboardFrame = null

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
 * Dashboard Button
 */
addAction('📱', () => {
  isDashboardOpen = !isDashboardOpen
  if (isDashboardOpen) {
    $actionsWrap.classList.add('handsfree-actions-open')

    if (!hasInjectedDashboard) {
      // Avoid recursive frame insertion...
      var extensionOrigin = 'chrome-extension://' + chrome.runtime.id
      if (!location.ancestorOrigins.contains(extensionOrigin)) {
        let $wrap = document.createElement('div')
        $wrap.id = 'handsfree-dashboard-wrap'
        document.body.appendChild($wrap)

        $dashboardFrame = document.createElement('iframe')
        $dashboardFrame.src = chrome.runtime.getURL('src/dashboard.html')
        $dashboardFrame.id = 'handsfree-dashboard'
        $wrap.appendChild($dashboardFrame)

        isAttachedLeft && $wrap.classList.add('handsfree-dashboard-wrap-left')

        // @FIXME this seems flaky
        setTimeout(() => {
          $wrap.classList.add('handsfree-dashboard-visible')
        }, 50)
      }

      chrome.runtime.sendMessage({ action: 'injectDashboard' })
    } else {
      document
        .querySelector('#handsfree-dashboard-wrap')
        .classList.add('handsfree-dashboard-visible')
    }

    hasInjectedDashboard = true
  } else {
    document
      .querySelector('#handsfree-dashboard-wrap')
      .classList.remove('handsfree-dashboard-visible')
    $actionsWrap.classList.remove('handsfree-actions-open')
  }
})

/**
 * Pass clicks into dashboard
 */
Handsfree.use('dashboard.clickThrough', {
  onFrame({ head }) {
    if (head.pointer.state === 'mouseDown') {
      const offset = isAttachedLeft ? 0 : 80

      chrome.runtime.sendMessage({
        action: 'clickThroughDashboard',
        pointer: {
          x: head.pointer.x - offset,
          y: head.pointer.y
        }
      })
    }
  }
})

/**
 * Change quick actions side
 */
addAction('🔁', () => {
  isAttachedLeft = !isAttachedLeft
  chrome.storage.local.set({ isActionsAttachedLeft: isAttachedLeft })
  const $dashboard = document.querySelector('#handsfree-dashboard-wrap')

  if (isAttachedLeft) {
    $dashboard && $dashboard.classList.add('handsfree-dashboard-wrap-left')
    $actionsWrap.classList.add('handsfree-actions-wrap-left')
  } else {
    $dashboard && $dashboard.classList.remove('handsfree-dashboard-wrap-left')
    $actionsWrap.classList.remove('handsfree-actions-wrap-left')
  }
})

/**
 * History
 */
addAction('◀', () => {
  chrome.runtime.sendMessage({ action: 'goBack' })
})
addAction('▶', () => {
  chrome.runtime.sendMessage({ action: 'goForward' })
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

  $actionsWrap.style.marginTop = `${-(actions.length / 2) * 80}px`
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
