import convertTimestampToDate from '../supportComponents/convertTimestamp'

export default function drawMessage (data, bot, scroll = false) {
  if (data) {
    // console.log(data);
    const message = document.createElement('div')
    message.className = 'message'
    let messageContent = document.createElement('span')

    if (data.type && data.type.startsWith('image')) {
      messageContent = document.createElement('img')
      messageContent.src = data.message
    }

    if (data.type && data.type.startsWith('video')) {
      messageContent = document.createElement('video')
      messageContent.src = data.message
      messageContent.setAttribute('controls', 'controls')
    }

    if (data.type && data.type.startsWith('audio')) {
      messageContent = document.createElement('audio')
      messageContent.src = data.message
      messageContent.setAttribute('controls', 'controls')
    } else {
      const links = data.message.match(/http[^\s]+/gm)
      if (links) {
        for (const link of links) {
          data.message = data.message.replace(link, `<a href="${link}">${link}</a>`)
        }
      }
      messageContent.innerHTML = `<span>${data.message}</span>`
    }

    messageContent.className = 'message__content'

    const messageTime = document.createElement('span')
    messageTime.className = 'message__time'
    messageTime.textContent = convertTimestampToDate(data.date)

    message.append(messageContent, messageTime)

    bot.append(message)
    if (scroll) {
      // console.log(43);
      // console.log(bot.children[bot.children.length - 1]);
      // bot.children[bot.children.length - 1].scrollIntoView(true)
      setTimeout(message.scrollIntoView(true), 300)
    }
  }
}
