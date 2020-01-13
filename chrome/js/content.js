let actions = []
let isAttachedLeft = false
let isDashboardOpen = false
let hasInjectedDashboard = false
let $dashboardFrame = null

handsfree = new Handsfree({
  isClient: true
})

/**
 * Load settings
 */
chrome.storage.local.get(['offset'], (data) => {
  if (data.offset) {
    Handsfree.plugins.head.pointer.config.offset = data.offset
  }
})

/**
 * Pass clicks into dashboard
 */
Handsfree.use('dashboard.clickThrough', {
  onFrame({ head }) {
    if (
      head.pointer.state === 'mouseDown' &&
      head.pointer.$target === $dashboardFrame
    ) {
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
 * Pingback
 */
Handsfree.use('background.ping', () => {
  chrome.runtime.sendMessage({
    action: 'ping'
  })
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
        $dashboardFrame.src = chrome.runtime.getURL(
          'chrome/dashboard/index.html'
        )
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
chrome.runtime.onMessage.addListener(function(message) {
  switch (message.action) {
    /**
     * Update the handsfree properties
     */
    case 'updateHandsfree':
      handsfree.head = message.head
      handsfree.body = message.body
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
      if (message.isVisible) {
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
      if (message.imageData) {
        const imageData = new ImageData(
          new Uint8ClampedArray(Object.values(message.imageData.data)),
          message.width,
          message.height
        )
        $canvas.getContext('2d').putImageData(imageData, 0, 0)
      }
      break

    /**
     * Shows the keyboard and sends the string on ready
     */
    case 'showKeyboard':
      // Called on cancel/paste
      const cb = function(data) {
        chrome.runtime.sendMessage({
          action: 'updateOmnibar',
          content: data.detail
        })

        document.removeEventListener('virtual.keyboard.paste', cb)
        document.removeEventListener('virtual.keyboard.cancel', cb)
      }

      // Show keyboard and await
      Handsfree.plugins.virtual.keyboard.showKeyboard()
      Handsfree.plugins.virtual.keyboard.$target = {
        value: '',
        isVirtual: true
      }
      Handsfree.plugins.virtual.keyboard.setInput('')
      handsfree.on('virtual.keyboard.paste', cb)
      handsfree.on('virtual.keyboard.cancel', cb)
      break

    /**
     * Starts the calibration process
     */
    case 'startCalibration':
      Handsfree.use('head.calibration', {
        framesCalibrated: 0,
        numFramesToCalibrate: 60,

        onFrame({ head }) {
          const leftOffset = !isAttachedLeft ? 80 : 0
          const dist = Math.sqrt(
            Math.pow(head.pointer.x - (message.center.x + leftOffset), 2) +
              Math.pow(head.pointer.y - message.center.y, 2)
          )

          this.step(head, leftOffset, dist)
          this.maybeEndCalibration(dist)
        },

        /**
         * Step the pointer towards the center
         */
        step(head, leftOffset, dist) {
          const stepSize = dist < 40 ? 3 : 20

          // Move toward center
          if (head.pointer.x < message.center.x + leftOffset) {
            Handsfree.plugins.head.pointer.config.offset.x += stepSize
          } else {
            Handsfree.plugins.head.pointer.config.offset.x -= stepSize
          }
          if (head.pointer.y < message.center.y) {
            Handsfree.plugins.head.pointer.config.offset.y += stepSize
          } else {
            Handsfree.plugins.head.pointer.config.offset.y -= stepSize
          }
        },

        /**
         * Ends calibration when the pointer is near the center
         */
        maybeEndCalibration(dist) {
          if (dist < 30) {
            this.framesCalibrated++
          } else {
            this.framesCalibrated = 0
          }

          if (this.framesCalibrated > this.numFramesToCalibrate) {
            Handsfree.disable('head.calibration')
            chrome.runtime.sendMessage({
              action: 'endCalibration',
              offset: Handsfree.plugins.head.pointer.config.offset
            })
          }
        }
      })
      break

    /**
     * Update calibration
     */
    case 'updateCalibration':
      Handsfree.plugins.head.pointer.config.offset = message.offset
      break
  }
})
