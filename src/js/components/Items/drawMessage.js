import convertTimestampToDate from '../supportComponents/convertTimestamp'

export default function drawMessage (data, bot, scroll = false, history = false) {
  if (data) {
    // console.log(data);
    const message = document.createElement('div')
    message.className = 'message'

    const fileText = document.createElement('span')
    fileText.className = 'message__text'
    fileText.textContent = data.text

    let messageContent = document.createElement('span')

    if (data.type && data.type.startsWith('image')) {
      messageContent = document.createElement('img')
      messageContent.src = data.file
    }

    if (data.type && data.type.startsWith('video')) {
      messageContent = document.createElement('video')
      messageContent.src = data.file
      messageContent.setAttribute('controls', 'controls')
    }

    if (data.type && data.type.startsWith('audio')) {
      messageContent = document.createElement('audio')
      messageContent.src = data.file
      messageContent.setAttribute('controls', 'controls')
    } 

    if (data.type && data.type.startsWith('other')) {
      messageContent = document.createElement('span')
      messageContent.innerHTML = `Файл : <a href="${data.file}">${data.file}</a>`

    } 

    
    else {
      const links = data.text.match(/http[^\s]+/gm)
      if (links) {
        for (const link of links) {
          data.text = data.text.replace(link, `<a href="${link}">${link}</a>`)
        }
      }
      messageContent.innerHTML = `<span>${data.text}</span>`
    }

    messageContent.className = 'message__content'
    
    const messageTime = document.createElement('span')
    messageTime.className = 'message__time'
    messageTime.textContent = convertTimestampToDate(data.date)

    console.log(data.type);

    data.file ? message.append(messageContent, fileText, messageTime) : message.append(messageContent, messageTime)

    if (history) {
      console.log("Отрисовка вначале");
      bot.insertAdjacentElement('afterbegin', message)
    }
    else {bot.append(message)}
  
    if (scroll) {
      // console.log(43);
      // console.log(bot.children[bot.children.length - 1]);
      // bot.children[bot.children.length - 1].scrollIntoView(true)
      setTimeout(() => bot.lastChild.scrollIntoView(true), 300)
    }
  }
}
