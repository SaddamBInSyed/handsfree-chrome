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
  let search = $omnibarInput.value

  if (!search.startsWith('http:') && !search.startsWith('https:')) {
    search = `https://google.com/search?q=${search.replace(/ /g, '+')}`
  }

  chrome.runtime.sendMessage({ action: 'navigateToURL', url: search })
})

// Show keyboard
$omnibarInput.addEventListener('focus', () => {
  chrome.runtime.sendMessage({ action: 'showKeyboard' })
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

/**
 * Handle events
 */
chrome.runtime.onMessage.addListener(function(request) {
  switch (request.action) {
    case 'clickThroughDashboard':
      const $el = document.elementFromPoint(
        request.pointer.x,
        request.pointer.y
      )

      if ($el) {
        $el.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: request.pointer.x,
            clientY: request.pointer.y
          })
        )

        // Focus
        if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes($el.nodeName))
          $el.focus()
      }

      break

    case 'updateOmnibar':
      $omnibarInput.value = request.content
      break
  }
})
