handsfree = new Handsfree({
  isClient: true
})

/**
 * Scrolls the page vertically
 */
window.Handsfree.use('head.vertScroll', {
  config: {
    vertScroll: {
      // The multiplier to scroll by. Lower numbers are slower
      scrollSpeed: 0.15,
      // How many pixels from the the edge to scroll
      scrollZone: 100
    }
  },

  /**
   * Scroll the page when the cursor goes above/below the threshold
   */
  onFrame({ head }) {
    // @FIXME we shouldn't need to do this
    if (!head.pointer.x && !head.pointer.y) return

    if (head.pointer.y < this.config.vertScroll.scrollZone) {
      window.scrollTo(
        0,
        window.scrollY +
          (head.pointer.y - this.config.vertScroll.scrollZone) *
            this.config.vertScroll.scrollSpeed
      )
    } else if (
      head.pointer.y >
      window.innerHeight - this.config.vertScroll.scrollZone
    ) {
      window.scrollTo(
        0,
        window.scrollY +
          (head.pointer.y -
            window.innerHeight +
            this.config.vertScroll.scrollZone) *
            this.config.vertScroll.scrollSpeed
      )
    }
  }
})

/**
 * Click on things
 */
// Number of frames mouse has been downed
let mouseDowned = 0
// Max number of frames to keep down
// @TODO make this variable or adjustable
let maxMouseDownedFrames = 1
let mouseUp = false
let thresholdMet = false
// For some reason the linter isn't caching this
// eslint-disable-next-line no-unused-vars
let mouseDrag = false

window.Handsfree.use('head.click', {
  config: {
    // Morphs to watch for and their required confidences
    morphs: {
      0: 0.25,
      1: 0.25
    }
  },

  /**
   * Detect click state and trigger a real click event
   */
  onFrame({ head }) {
    // @FIXME we shouldn't need to do this
    if (!head.pointer.x && !head.pointer.y) return

    thresholdMet = false

    Object.keys(this.config.morphs).forEach((key) => {
      const morph = +this.config.morphs[key]
      if (morph > 0 && head.morphs[key] >= morph) thresholdMet = true
    })

    if (thresholdMet) {
      mouseDowned++
      document.body.classList.add('handsfree-clicked')
    } else {
      mouseUp = mouseDowned
      mouseDowned = 0
      mouseDrag = false
      document.body.classList.remove('handsfree-clicked')
    }

    // Set the state
    if (mouseDowned > 0 && mouseDowned <= maxMouseDownedFrames)
      head.pointer.state = 'mouseDown'
    else if (mouseDowned > maxMouseDownedFrames)
      head.pointer.state = 'mouseDrag'
    else if (mouseUp) head.pointer.state = 'mouseUp'
    else ''

    // Actually click something (or focus it)
    if (head.pointer.state === 'mouseDown') {
      const $el = document.elementFromPoint(head.pointer.x, head.pointer.y)
      if ($el) {
        $el.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: head.pointer.x,
            clientY: head.pointer.y
          })
        )

        // Focus
        if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes($el.nodeName))
          $el.focus()
      }
    }
  }
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
