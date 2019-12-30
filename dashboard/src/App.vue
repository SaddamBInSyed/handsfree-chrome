<template lang="pug">
  .panel.pa-3.full-height
    .panel-body
      Omnibar
      router-view
</template>

<script>
import Omnibar from '@/components/Omnibar'

export default {
  name: 'app',
  components: { Omnibar },

  mounted() {
    chrome &&
      chrome.runtime.onMessage &&
      chrome.runtime.onMessage.addListener(this.onMessage)
  },

  beforeDestroy() {
    chrome &&
      chrome.runtime.onMessage &&
      chrome.runtime.onMessage.removeListener(this.onMessage)
  },

  methods: {
    /**
     * Handle messages
     */
    onMessage(request) {
      switch (request.action) {
        case 'clickThroughDashboard': {
          const $el = document.elementFromPoint(
            request.pointer.x,
            request.pointer.y
          )

          if ($el) {
            $el.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: request.pointer.x,
                clientY: request.pointer.y
              })
            )

            // Focus
            if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes($el.nodeName))
              $el.focus()
          }

          break
        }
      }
    }
  }
}
</script>

<style>
@import 'assets/sass/main.scss';
</style>
