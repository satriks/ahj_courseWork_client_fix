export default function captureFile (data) {
  const fileCapture = document.createElement('div')
  fileCapture.className = 'capture__file'

  let messageContent = document.createElement('span')

  if (data.type && data.type.startsWith('image')) {
    messageContent = document.createElement('img')
    messageContent.src = URL.createObjectURL(data)
  }

  if (data.type && data.type.startsWith('video')) {
    messageContent = document.createElement('video')
    messageContent.src = URL.createObjectURL(data)
    messageContent.setAttribute('controls', 'controls')
  }

  if (data.type && data.type.startsWith('audio')) {
    messageContent = document.createElement('audio')
    messageContent.src = URL.createObjectURL(data)
    messageContent.setAttribute('controls', 'controls')
  }
  messageContent.className = 'capture__message'

  const captureWrapper = document.createElement('div')
  captureWrapper.className = 'capture__wrapper'

  const textArea = document.createElement('input')
  textArea.className = 'capture__input'
  textArea.placeholder = 'Добавьте описание'

  const captureBtn = document.createElement('button')
  captureBtn.className = 'capture__btn'
  captureBtn.textContent = 'Отправить'

  const close = document.createElement('button')
  close.className = 'capture__close'
  close.textContent = 'X'

  captureWrapper.append(textArea, captureBtn, close)

  fileCapture.append(messageContent, captureWrapper)

  return fileCapture
}
