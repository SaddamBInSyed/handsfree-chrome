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
  components: { TabManagementCard }
}
</script>

<style>
@import 'assets/sass/main.scss';
</style>
