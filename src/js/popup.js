const $start = document.querySelector('#startWebcam')

$start.addEventListener('click', () => {
  chrome.tabs.create({ url: '/src/options.html?autostart=true' })
})
