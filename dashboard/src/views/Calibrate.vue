<template lang="pug">
  .container.mt-3
    h1 Calibrate
    p Click the calibration button below and then point your head at the calibration dot that appears below it. The pointer will readjust itself until it reaches the calibration dot and hovers over it for 3 seconds.

    .text-center
      p(v-if='!isCalibrating && !isAboutToCalibrate')
        button.btn.btn-primary.btn-xl(@click='startCalibration') Start calibration
      p(v-if='isAboutToCalibrate || isCalibrating')
        button.btn.btn-primary.btn-xl(disabled) Point head towards circle below
      #calibration-marker(v-if='isCalibrating || isAboutToCalibrate')
</template>

<script>
export default {
  data: () => ({
    isCalibrating: false,
    isAboutToCalibrate: false
  }),

  methods: {
    /**
     * Starts the calibration process
     */
    startCalibration() {
      this.isAboutToCalibrate = true
      setTimeout(() => {
        this.isAboutToCalibrate = false
        this.isCalibrating = true

        chrome &&
          chrome.runtime.sendMessage &&
          chrome.runtime.sendMessage({
            action: 'startCalibration',
            center: {
              x: 0,
              y: 0
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
