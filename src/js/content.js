handsfree = new Handsfree({
  isClient: true
})

Handsfree.use('logger', {
  onFrame(message) {
    console.log('onFrame', message)
  }
})

handsfree.start()
