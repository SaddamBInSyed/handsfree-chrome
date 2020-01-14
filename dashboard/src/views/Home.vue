<template lang="pug">
.columns.mt-3
  .column.col-4.col-md-12.col-lg-6
    TabManagementCard
  .column.col-4.col-md-12.col-lg-6
    .card
      .card-header
        .card-title.h5 Settings
      .card-body
        p
          router-link.btn.btn-primary.block.btn-xl(tag='button' to='/calibrate')
            Crosshairs.mr-2
            | Calibrate Pointer
        p
          button.btn.btn-primary.block.btn-xl(@click='stopWebcam')
            Stop.mr-2
            | Stop Webcam
</template>

<script>
import TabManagementCard from '@/components/TabManagementCard'
import Crosshairs from 'icons/Crosshairs'
import Stop from 'icons/Stop'

export default {
  components: { TabManagementCard, Crosshairs, Stop },

  methods: {
    stopWebcam() {
      chrome.runtime.sendMessage({ action: 'stop' })
    }
  }
}
</script>
