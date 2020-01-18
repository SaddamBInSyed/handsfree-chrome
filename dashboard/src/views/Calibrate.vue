<template lang="pug">
  .container.mt-3
    p
      router-link.btn.btn-primary(to='/' tag='button') ◀ Back to home
    h1 Calibrate
    p Click the calibration button below and then point your head at the calibration dot that appears below it. The pointer will readjust itself until it reaches the calibration dot and hovers over it for 3 seconds.

    .text-center
      p(v-if='!isCalibrating && !isAboutToCalibrate')
        button.btn.btn-primary.btn-xl(@click='startCalibration') Start calibration
      p(v-if='isAboutToCalibrate || isCalibrating')
        button.btn.btn-primary.btn-xl(disabled) Point head towards circle below
      #calibration-marker(ref='marker' v-if='isCalibrating || isAboutToCalibrate')
</template>

<script>
export default {
  data: () => ({
    isCalibrating: false,
    isAboutToCalibrate: false
  }),

  mounted() {
    chrome.runtime.onMessage.addListener(this.listen)
  },

  beforeDestroy() {
    chrome.runtime.onMessage.removeListener(this.listen)
  },

  methods: {
    listen(message) {
      switch (message.action) {
        case 'endCalibration':
          this.isCalibrating = false
          this.isAboutToCalibrate = false
          break
      }
    },

    /**
     * Starts the calibration process
     */
    startCalibration() {
      this.isAboutToCalibrate = true
      chrome.runtime.sendMessage({
        action: 'preCalibration'
      })

      setTimeout(() => {
        this.isAboutToCalibrate = false
        this.isCalibrating = true
        const bounds = this.$refs.marker.getBoundingClientRect()

        chrome &&
          chrome.runtime.sendMessage &&
          chrome.runtime.sendMessage({
            action: 'startCalibration',
            center: {
              x: bounds.left + bounds.width / 2,
              y: bounds.top + bounds.height / 2
            }
          })
      }, 2000)
    }
  }
}
</script>

<style scoped>
#calibration-marker {
  width: 160px;
  height: 160px;
  border-radius: 160px;
  margin: auto;
  border: 2px solid #aac;
}
</style>
