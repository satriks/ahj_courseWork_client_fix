import createDom from './Items/StartDom'
import drawMessage from './Items/drawMessage'
import AddMenu from './Items/addMenu'
import LazyLoader from './Items/lazyLoader'
import UpMenu from './Items/UpMenu'
import captureFile from './Items/captureFile'
// import WebSocket from './Items/WebSocket'

export default class DomControl {
  constructor (host) {
    this.host = host
    this.port = process.env.port || 7070
    createDom(document.body)
    this.input = document.querySelector('.bot__input')
    this.bot = document.querySelector('.bot')
    this.addMenu = new AddMenu()
    this.lazy = new LazyLoader()
    this.ws = new WebSocket("ws:" +  host.split(":")[1] +":" + (this.port + 1) + "?test=test")
    this.upMenu = new UpMenu()
    this.listeners()
    this.getMessages(true)

    

  }

  listeners = () => {
    this.input.addEventListener('keydown', this.inputMessage)
    document.querySelector('.bot__add').addEventListener('click', this.handleAddMenu)
    document.querySelector('.bot__input-file').addEventListener('change', this.catchFile)
    document.querySelector('.bot__menu').addEventListener('click', this.upMenu.toggleMenu)
    this.bot.addEventListener('dragover', (event) => { event.preventDefault() })
    this.bot.addEventListener('drop', this.onDrop)
    this.bot.addEventListener('scroll', this.lazyLoad)
    this.ws.addEventListener('message', (message) => {drawMessage(JSON.parse(message.data), this.bot, true)})
    this.upMenu.findInterfaces.querySelector('.find__input').addEventListener('keydown', this.filter)
    this.upMenu.findInterfaces.querySelector('.find__close').addEventListener('click', this.clearFilter)
  }

  //listener для текстового сообщения
  inputMessage = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      console.log(event.target.value)
      const messageForm = new FormData()
      messageForm.append('message', event.target.value)
      fetch(this.host + ":" + this.port + '/messages', { method: 'POST', body: messageForm })
        .then(() => {this.ws.send("update") })
      event.target.value = ''
    }
  }

  //получаем все сообщения 
  getMessages = (scroll = false) => {
    fetch(this.host + ":" + this.port + '/messages')
      .then((response) => response.json())
      .then((response) => {
        this.lazy.addMessages(response.messages)
        const dataForDraw = this.lazy.getMessages()
        dataForDraw.forEach((message) => { drawMessage(message, this.bot, scroll, true) })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  //очистка чата 
  clearMessages () {
    [...this.bot.children].forEach(element => element.remove())
  }
  // listener кнопки с плюсом 
  handleAddMenu = () => {
    if (document.querySelector('.add__menu')) {
      this.addMenu.clearAddMenu()
      return
    }
    this.addMenu.createAddMenu()
  }
  // DnD
  onDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files && event.dataTransfer.files[0]
    if (file) {
      this.sendFile(file)
    }
  }
  // получаем файл для отправки 
  catchFile = (event) => {
    const file = document.querySelector('.bot__input-file').files[0]
    this.sendFile(file)
  }

  // Отправка файла и отрисовка в чате 
  sendFile = (file) => {
    const data = new FormData()
    data.append('file', file)
    this.label = captureFile(file)
    document.querySelector('.bot__wrapper').insertAdjacentElement('afterbegin', this.label )
    document.querySelector('.capture__btn').addEventListener('click', () => {
      data.append('text', document.querySelector('.capture__input').value)
      fetch(this.host + ":" + this.port + '/messages', { method: 'POST', body: data })
        .then((response) => {
          this.ws.send("update")
          this.label.remove()
        })
    })

  }
  // Listener на скрол для ленивой загрузки
  lazyLoad = () => {
    try {
      const lastElement = this.bot.children[1].offsetTop
      const currentY = this.bot.scrollTop 
      if ((lastElement + 200) > currentY) {
        this.lazy.getMessages().forEach(message => { if (message) { drawMessage(message, this.bot, false, true) } })
      }
    } catch (err) {

    }
  }

  // фильтр
  filter = (event) => {
    console.log(event.key);
    if (event.key === "Enter"){
      const param = event.target.value
      fetch(this.host + ":" + this.port + '/messages/filter?filter=' + param)
        .then((response) => response.json())
        .then((response) => {
          this.lazy.addMessages(response.messages)
          const dataForDraw = this.lazy.getMessages()
          this.clearMessages()
          dataForDraw.forEach((message) => { drawMessage(message, this.bot, scroll, true) })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  clearFilter = () => {
    this.upMenu.findInterfaces.classList.add("hidden")
    this.clearMessages()
    this.lazy.messages = []
    this.getMessages()
  }
}
