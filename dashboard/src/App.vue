<template lang="pug">
  .panel.pa-3.full-height
    .panel-body
      .input-group
        input.form-input.input-xl(type='text' placeholder='URL or web search')
        button.btn.btn-primary.input-group-btn.btn-xl(style='width: 150px') Submit

      .columns.mt-3
        .column.col-4
          TabManagementCard
</template>

<script>
import TabManagementCard from '@/components/TabManagementCard'

export default {
  name: 'app',
  components: { TabManagementCard },

  mounted() {
    chrome.runtime.onMessage.addListener(this.onMessage)
  },

  beforeDestroy() {
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
