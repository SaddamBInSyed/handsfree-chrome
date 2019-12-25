Handsfree.use('slideshare.advanceWithHands', {
  isRightArmUp: false,
  isLeftWristUp: false,

  onUse() {
    chrome.runtime.sendMessage({
      action: 'toggleBodyPix',
      toggle: true,
      throttle: 500
    })
    handsfree.model.bodypix.enabled = true
  },

  onFrame({ body }) {
    if (!body.pose || !body.rightWrist) return

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

  toNextSlide() {
    const $frame = this.findFrame()
    if ($frame) {
      const $btn = $frame.querySelector('#btnNext')
      $btn && $btn.click()
    }
  },

  toPrevSlide() {
    const $frame = this.findFrame()
    if ($frame) {
      const $btn = $frame.querySelector('#btnPrevious')
      $btn && $btn.click()
    }
  },

  findFrame() {
    let $foundFrame = null

    document.querySelectorAll('iframe').forEach(($frame) => {
      if (!$foundFrame && $frame.getAttribute('src').endsWith('/slideshelf')) {
        $foundFrame = $frame.contentDocument.querySelector('.ssIframeLoader')
          .contentDocument
      }
    })

    return $foundFrame
  }
})
