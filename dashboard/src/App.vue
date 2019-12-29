<template lang="pug">
  .panel.pa-3.full-height
    .panel-body
      .input-group
        input.form-input.input-lg(type='text' placeholder='URL or web search')
        button.btn.btn-primary.input-group-btn.btn-lg Submit
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
@import 'assets/sass/main.scss';
</style>
