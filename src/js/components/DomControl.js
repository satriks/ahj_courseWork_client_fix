import createDom from './Items/StartDom'
import drawMessage from './Items/drawMessage'
import AddMenu from './Items/addMenu'
import LazyLoader from './Items/lazyLoader'

export default class DomControl {
  constructor (host) {
    this.host = host
    createDom(document.body)
    this.input = document.querySelector('.bot__input')
    this.bot = document.querySelector('.bot')
    this.addMenu = new AddMenu()
    this.lazy = new LazyLoader()
    this.listeners()
    this.getMessages()
  }

  listeners () {
    this.input.addEventListener('keydown', this.inputMessage)
    document.querySelector('.bot__add').addEventListener('click', this.handleAddMenu)
    document.querySelector('.bot__input-file').addEventListener('change', this.catchFile)
    this.bot.addEventListener('dragover', (event) => { event.preventDefault() })
    this.bot.addEventListener('drop', this.onDrop)
    this.bot.addEventListener('scroll', this.lazyLoad)
  }

  inputMessage = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      console.log(event.target.value)
      const messageForm = new FormData()
      messageForm.append('message', event.target.value)
      fetch(this.host + '/messages', { method: 'POST', body: messageForm })
        .then(() => {
          this.clearMessages()
          this.getMessages(true)
        })

      event.target.value = ''
    }
  }

  getMessages = (scroll = false) => {
    fetch(this.host + '/messages')
      .then((response) => response.json())
      .then((response) => {
        console.log(response.news)
        if (scroll) {
          response.news.forEach((message) => { drawMessage(message, this.bot, scroll) })
          return
        }
        this.lazy.addMessages(response.news)
        const dataForDraw = this.lazy.getMessages()
        dataForDraw.forEach((message) => { drawMessage(message, this.bot) })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  clearMessages () {
    [...this.bot.children].forEach(element => element.remove())
  }

  handleAddMenu = () => {
    if (document.querySelector('.add__menu')) {
      this.addMenu.clearAddMenu()
      return
    }
    this.addMenu.createAddMenu()
  }

  onDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files && event.dataTransfer.files[0]
    if (file) {
      this.sendFile(file)
      // TODO сделать отправку файла
    }
  }

  catchFile = (event) => {
    const file = document.querySelector('.bot__input-file').files[0]
    this.sendFile(file)
  }

  sendFile = (file) => {
    const data = new FormData()
    data.append('file', file)

    fetch(this.host + '/messages', { method: 'POST', body: data })
      .then((response) => {
        this.clearMessages()
        this.getMessages(true)
      })
  }

  lazyLoad = () => {
    try {
      const lastElement = this.bot.children[this.bot.children.length - 1].offsetTop
      const currentY = this.bot.scrollTop + this.bot.clientHeight

      if ((lastElement - 200) < currentY) {
        this.lazy.getMessages().forEach(message => { if (message) { drawMessage(message, this.bot, false) } })
      }
    } catch (err) {

    }
  }
}
