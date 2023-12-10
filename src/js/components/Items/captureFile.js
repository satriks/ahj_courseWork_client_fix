export default function captureFile (data){
    const fileCapture = document.createElement('div');
    fileCapture.className = 'capture__file';

    let messageContent = document.createElement('span');
    

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

    const capture__wrapper = document.createElement('div')
    capture__wrapper.className = "capture__wrapper"

    const textArea = document.createElement('input');
    textArea.className = 'capture__input'
    textArea.placeholder = "Добавьте описание"

    const capture__btn = document.createElement('button');
    capture__btn.className = 'capture__btn'
    capture__btn.textContent = "Отправить"

    
    capture__wrapper.append(textArea, capture__btn)

    fileCapture.append(messageContent, capture__wrapper)

    return fileCapture

}