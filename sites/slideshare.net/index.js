/**
 * - Click on a slideshare slide to activate it
 * - Right hand up goes to next slide
 * - Left hand up goes to prev slide
 * - Raise both eyebrows or both hands to deactivate
 */
Handsfree.use('slideshare.advanceWithHands', {
  isRightArmUp: false,
  isLeftWristUp: false,
  isSlideFocused: false,

  onFrame({ head, body }) {
    this.maybeExitSlideshow({ head, body })
    this.handleHandGestures(body)
    this.lookForActivationClick(head)
  },

  /**
   * Click a slideshare iframe to activate it
   * - Throttles head tracking
   * - Enables bodypix
   */
  lookForActivationClick(head) {
    if (head.pointer.state === 'mouseDown') {
      const $target = head.pointer.$target

      if (
        $target &&
        $target.nodeName === 'IFRAME' &&
        $target.getAttribute('src').endsWith('/slideshelf')
      ) {
        this.isSlideFocused = true
        this.$slides = $target.contentDocument.querySelector(
          '.ssIframeLoader'
        ).contentDocument

        chrome.runtime.sendMessage({
          action: 'toggleModel',
          model: 'head',
          enabled: true,
          throttle: 250
        })
        Handsfree.disable('head.pointer')
        Handsfree.disable('head.vertScroll')

        chrome.runtime.sendMessage({
          action: 'toggleModel',
          model: 'bodypix',
          enabled: true,
          throttle: 0
        })
      }
    }
  },

  /**
   * Handles hand gestures
   * - Right hand up to go right
   * - Left hand up to go left
   */
  handleHandGestures(body) {
    if (!this.isSlideFocused || !body.pose || !body.rightWrist) return

    // Advance right
    if (!this.isRightWristUp && body.rightWrist.y < body.rightShoulder.y) {
      this.isRightWristUp = true
      this.toNextSlide()
    } else if (body.rightWrist.y > body.rightShoulder.y) {
      this.isRightWristUp = false
    }

    // Advance left
    if (!this.isLeftWristUp && body.leftWrist.y < body.leftShoulder.y) {
      this.isLeftWristUp = true
      this.toPrevSlide()
    } else if (body.leftWrist.y > body.leftShoulder.y) {
      this.isLeftWristUp = false
    }
  },

  /**
   * Advances to next slide
   */
  toNextSlide() {
    const $frame = this.findSlideshareFrame()
    if ($frame) {
      const $btn = $frame.querySelector('#btnNext')
      $btn && $btn.click()
    }
  },

  /**
   * Advances to previous slide
   */
  toPrevSlide() {
    const $frame = this.findSlideshareFrame()
    if ($frame) {
      const $btn = $frame.querySelector('#btnPrevious')
      $btn && $btn.click()
    }
  },

  /**
   * Finds the first slideshare iframe
   */
  findSlideshareFrame() {
    let $foundFrame = null

    document.querySelectorAll('iframe').forEach(($frame) => {
      if (!$foundFrame && $frame.getAttribute('src').endsWith('/slideshelf')) {
        $foundFrame = $frame.contentDocument.querySelector('.ssIframeLoader')
          .contentDocument
      }
    })

    return $foundFrame
  },

  /**
   * Exit full screen when both hands are up or when both eyebrows are up
   */
  maybeExitSlideshow({ head, body }) {
    if (!this.isSlideFocused || !body.pose || !body.rightWrist) return

    if (
      (body.leftWrist.y < body.leftShoulder.y &&
        body.rightWrist.y < body.rightShoulder.y) ||
      head.state.browsUp
    ) {
      this.isSlideFocused = false
      chrome.runtime.sendMessage({
        action: 'toggleModel',
        model: 'head',
        enabled: true,
        throttle: 0
      })
      Handsfree.enable('head.pointer')
      Handsfree.enable('head.vertScroll')

      chrome.runtime.sendMessage({
        action: 'toggleModel',
        model: 'bodypix',
        enabled: false
      })
    }
  }
})
