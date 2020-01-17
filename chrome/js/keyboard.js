/**
 * Adds a virtual keyboard
 * - Creates the keyboard once an input field is clicked
 */
Handsfree.use('virtual.keyboard', {
  keyboard: null,
  $target: null,
  $textarea: null,
  input: '',
  $wrap: null,

  onUse() {
    window.addEventListener('resize', () => {
      this.resizeKeyboard()
    })
  },

  onFrame({ head }) {
    if (head.pointer.state === 'mouseDown' && head.pointer.$target) {
      if (['INPUT', 'TEXTAREA'].includes(head.pointer.$target.nodeName)) {
        this.showKeyboard()
        this.$target = head.pointer.$target
        this.setInput(this.$target.value)
      }
    }
  },

  /**
   * Resizes the keyboard
   */
  resizeKeyboard(elementHeight) {
    if (elementHeight <= 0 || !this.$wrap) return

    if (!elementHeight || this.$wrap.clientHeight > window.innerHeight) {
      if (!elementHeight) elementHeight = 100

      this.$wrap.querySelectorAll('.hg-button').forEach((btn) => {
        btn.style.height = `${elementHeight}px`
      })

      this.resizeKeyboard(elementHeight - 10)
    }
  },

  /**
   * Either creates or shows the keyboard
   */
  showKeyboard() {
    Handsfree.disable('head.vertScroll')

    if (!this.keyboard) {
      this.createKeyboard()
      this.resizeKeyboard()
    } else {
      this.$wrap.classList.add('handsfree-simple-keyboard-visible')
    }
  },

  /**
   * Close the keyboard
   */
  cancel() {
    Handsfree.enable('head.vertScroll')

    this.$wrap.classList.remove('handsfree-simple-keyboard-visible')
    handsfree.emit('virtual.keyboard.cancel', { detail: '' })
  },

  /**
   * Close the keyboard
   */
  paste() {
    Handsfree.enable('head.vertScroll')

    this.$target.value = this.$textarea.value
    this.$wrap.classList.remove('handsfree-simple-keyboard-visible')
    handsfree.emit('virtual.keyboard.paste', { detail: this.$target.value })
  },

  setInput(input) {
    this.keyboard.setInput(input)
    this.$textarea.value = input
  },

  /**
   * Creates the keyboard and input area
   */
  createKeyboard() {
    // Container
    this.$wrap = document.createElement('div')
    this.$wrap.id = 'handsfree-simple-keyboard-wrap'
    document.body.appendChild(this.$wrap)

    // Cancel / Paste
    const $toolbar = document.createElement('div')
    $toolbar.id = 'handsfree-simple-keyboard-toolbar'
    this.$wrap.appendChild($toolbar)

    const $cancel = document.createElement('button')
    $cancel.classList.add('handsfree-button-cancel')
    $cancel.innerHTML = 'Cancel'
    $toolbar.appendChild($cancel)
    $cancel.addEventListener('click', () => {
      this.cancel()
    })

    const $paste = document.createElement('button')
    $paste.classList.add('handsfree-button-paste')
    $paste.innerHTML = 'Paste'
    $toolbar.appendChild($paste)
    $paste.addEventListener('click', () => {
      this.paste()
    })

    // Textarea
    this.$textarea = document.createElement('textarea')
    this.$textarea.id = 'handsfree-simple-keyboard-input'
    this.$textarea.setAttribute('rows', 3)
    this.$wrap.appendChild(this.$textarea)

    // Keyboard
    const $simpleKeyboard = document.createElement('div')
    $simpleKeyboard.classList.add('simple-keyboard')
    this.$wrap.appendChild($simpleKeyboard)
    setTimeout(() => {
      this.$wrap.classList.add('handsfree-simple-keyboard-visible')
    }, 50)

    this.keyboard = new SimpleKeyboard.default({
      useMouseEvents: true,

      onChange: (input) => {
        this.$textarea.value = input
      }
    })
  }
})
