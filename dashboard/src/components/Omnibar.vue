<template lang="pug">
.input-group
  input.form-input.input-xl(ref='omnibar' type='text' placeholder='URL or web search' @focus='showKeyboard' v-model='omnibar')
  button.btn.btn-primary.input-group-btn.btn-xl(ref='submit' style='width: 150px' @click='runOmnibar') Submit
</template>

<script>
export default {
  mounted() {
    chrome.runtime.onMessage.addListener(this.onMessage)
  },

  beforeDestroy() {
    chrome.runtime.onMessage.removeListener(this.onMessage)
  },

  data: () => ({
    omnibar: ''
  }),

  methods: {
    /**
     * Either visit a URL or enter a search term
     */
    runOmnibar() {
      if (
        !this.omnibar.startsWith('http:') &&
        !this.omnibar.startsWith('https:')
      ) {
        this.omnibar = `https://google.com/search?q=${this.omnibar.replace(
          / /g,
          '+'
        )}`
      }

      chrome.runtime.sendMessage({ action: 'navigateToURL', url: this.omnibar })
    },

    showKeyboard() {
      chrome.runtime.sendMessage({ action: 'showKeyboard' })
    },

    /**
     * Handle messages
     */
    onMessage(request) {
      switch (request.action) {
        case 'updateOmnibar': {
          this.omnibar = request.content
          break
        }
      }
    }
  }
}
</script>
