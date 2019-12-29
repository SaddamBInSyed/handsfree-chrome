<template lang="pug">
.card
  .card-header
    .card-title.h5 Tab Management
  .card-body
    p
      button.btn.btn-primary.block.btn-xl(@click='prevTab') 👈 Prev Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='nextTab') 👉 Next Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='refreshTab') 🔄 Refresh Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='newTab') ➕ New Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='closeTab') ❌ Close Tab
</template>

<script>
export default {
  methods: {
    /**
     * Tab manaagemenet controls
     */
    prevTab() {
      chrome.runtime.sendMessage({ action: 'prevTab' })
    },
    nextTab() {
      chrome.runtime.sendMessage({ action: 'nextTab' })
    },
    refreshTab() {
      chrome.runtime.sendMessage({ action: 'refreshTab' })
    },
    newTab() {
      chrome.runtime.sendMessage({ action: 'newTab' })
    },
    closeTab() {
      chrome.runtime.sendMessage({ action: 'closeTab' })
    }
  }
}
</script>
