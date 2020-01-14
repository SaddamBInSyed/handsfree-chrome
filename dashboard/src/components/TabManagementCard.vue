<template lang="pug">
.card
  .card-header
    .card-title.h5 Tab Management
  .card-body
    p
      button.btn.btn-primary.block.btn-xl(@click='prevTab')
        ArrowLeftBox.mr-2
        | Prev Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='nextTab')
        ArrowRightBox.mr-2
        | Next Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='refreshTab') 
        Reload.mr-2
        | Refresh Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='newTab')
        PlusBox.mr-2
        | New Tab
    p
      button.btn.btn-primary.block.btn-xl(@click='closeTab')
        CloseBox.mr-2
        | Close Tab
</template>

<script>
import ArrowLeftBox from 'icons/ArrowLeftBox'
import ArrowRightBox from 'icons/ArrowRightBox'
import Reload from 'icons/Reload'
import PlusBox from 'icons/PlusBox'
import CloseBox from 'icons/CloseBox'

export default {
  components: { ArrowLeftBox, ArrowRightBox, Reload, PlusBox, CloseBox },

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
