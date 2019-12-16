const $omnibarInput = document.querySelector(
  '#handsfree-dashboard-omnibar-input'
)
const $omnibarSubmit = document.querySelector(
  '#handsfree-dashboard-omnibar-button'
)

/**
 * Omnibar
 */
$omnibarSubmit.addEventListener('click', () => {
  const search = $omnibarInput.value
  if (search.startsWith('http:') || search.startsWith('https:')) {
    window.location = search
  } else {
    window.location = `https://google.com/search?q=${search.replace(/ /g, '+')}`
  }
})
