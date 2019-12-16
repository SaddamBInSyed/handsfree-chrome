/**
 * Omnibar
 */
const $omnibarInput = document.querySelector(
  '#handsfree-dashboard-omnibar-input'
)
const $omnibarSubmit = document.querySelector(
  '#handsfree-dashboard-omnibar-button'
)

$omnibarSubmit.addEventListener('click', () => {
  const search = $omnibarInput.value
  if (search.startsWith('http:') || search.startsWith('https:')) {
    window.location = search
  } else {
    window.location = `https://google.com/search?q=${search.replace(/ /g, '+')}`
  }
})

/**
 * Tab management
 */
document.querySelector('#handsfree-close-tab').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'closeTab' })
})
document.querySelector('#handsfree-new-tab').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'newTab' })
})
document.querySelector('#handsfree-next-tab').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'nextTab' })
})
document.querySelector('#handsfree-prev-tab').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'prevTab' })
})
