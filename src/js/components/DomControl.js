import createDom from './items/StartDom'
import drawMessage from './items/drawMessage'
import AddMenu from './items/addMenu'
import LazyLoader from './items/lazyLoader'
import UpMenu from './items/UpMenu'
import captureFile from './items/captureFile'
import CategoryInterface from './items/CategoryInterface'
import { getGeolocation } from './items/getGeolocation'
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
    this.ws = new WebSocket('ws:' + host.split(':')[1] + ':' + (this.port + 1) + '?test=test')
    this.category = new CategoryInterface(this.filterCategory, this.getMessages)
    this.upMenu = new UpMenu(this.categoryMenu)
    this.pin = null
    this.videoBtn = document.querySelector('.bot__video')
    this.audioBtn = document.querySelector('.bot__audio')
    this.positionBtn = document.querySelector('.bot__position')
    drawMessage.pinned = this.pinned
    drawMessage.host = this.host + ':' + this.port
    this.upMenu.host = this.host + ':' + this.port

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
    this.ws.addEventListener('message', (message) => { drawMessage(JSON.parse(message.data), this.bot, true) })
    this.upMenu.findInterfaces.querySelector('.find__input').addEventListener('keydown', this.filter)
    this.upMenu.findInterfaces.querySelector('.find__close').addEventListener('click', this.clearFilter)
    this.videoBtn.addEventListener('click', this.onVideo)
    this.audioBtn.addEventListener('click', this.onAudio)
    this.positionBtn.addEventListener('click', this.onPosition)
  }

  // listener для текстового сообщения
  inputMessage = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      const messageForm = new FormData()
      messageForm.append('message', event.target.value)
      fetch(this.host + ':' + this.port + '/messages', { method: 'POST', body: messageForm })
        .then(() => { this.ws.send('update') })

      event.target.value = ''
      if (document.querySelector('.category__menu')) {
        this.categoryMenu()
      }
    }
  }

  // получаем все сообщения
  getMessages = (scroll = false) => {
    fetch(this.host + ':' + this.port + '/messages')
      .then((response) => response.json())
      .then((response) => {
        this.clearMessages()
        this.lazy.addMessages(response.messages)
        const dataForDraw = this.lazy.getMessages()
        dataForDraw.forEach((message) => { drawMessage(message, this.bot, scroll, true) })
        if (this.pin) {
          this.pin.classList.remove('pin__message')
          const pinMessage = [...this.bot.children].find((message) => message.id === this.pin.id)
          this.pinned(pinMessage)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  // очистка чата
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

    const send = () => {
      data.append('text', document.querySelector('.capture__input').value)
      fetch(this.host + ':' + this.port + '/messages', { method: 'POST', body: data })
        .then((response) => {
          this.ws.send('update')
          this.label.remove()
          if (document.querySelector('.category__menu')) {
            this.categoryMenu()
          }
        })
    }

    document.querySelector('.bot__wrapper').insertAdjacentElement('afterbegin', this.label)
    document.querySelector('.capture__close').addEventListener('click', () => { this.label.remove() })
    document.querySelector('.capture__btn').addEventListener('click', send)
    document.querySelector('.capture__input').addEventListener('keydown', (evt) => { if (evt.key === 'Enter') { send() } })
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
    if (event.key === 'Enter') {
      const param = event.target.value
      fetch(this.host + ':' + this.port + '/messages/filter?filter=' + param)
        .then((response) => response.json())
        .then((response) => {
          event.target.closest('.find__wrapper').style.top = 10 + 'px'
          this.lazy.messages = []
          this.clearMessages()
          this.lazy.addMessages(response.messages)
          const dataForDraw = this.lazy.getMessages()
          dataForDraw.forEach((message) => { drawMessage(message, this.bot, scroll, true) })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  clearFilter = () => {
    this.upMenu.findInterfaces.classList.add('hidden')
    this.clearMessages()
    this.lazy.messages = []
    this.getMessages()
  }

  // Запись видео
  onVideo = async (event) => {
    if (event.target.classList.contains('record')) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.recorder.stop()
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).catch((err) => {
      console.log(err)
      // not granted
    })

    this.stream = stream

    const recorder = new MediaRecorder(stream)
    this.recorder = recorder

    const chunks = []

    this.liveStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      this.videoStream()
      this.videoStreamELement.srcObject = stream
      return stream
    }).catch((err) => {
      console.log(err)
      // not granted
    })

    recorder.addEventListener('start', () => {
      console.log('start record')
      this.videoBtn.classList.add('record')
      this.videoBtn.textContent = '⏸'
    })

    recorder.addEventListener('dataavailable', (event) => {
      chunks.push(event.data)
    })

    recorder.addEventListener('stop', () => {
      this.videoBtn.classList.remove('record')
      this.videoBtn.textContent = '📹'
      this.liveStream.getTracks().forEach((track) => track.stop())
      if (this.videoStreamELement) {
        this.videoStreamELement.remove()
      }
      const blob = new Blob(chunks)
      const file = new File([blob], 'video.mp4', { type: 'video' })
      this.sendFile(file)
    })
    recorder.start()
  }

  // Запись аудио
  onAudio = async (event) => {
    if (event.target.classList.contains('record')) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.recorder.stop()
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      // video: true,
      audio: true
    }).catch((err) => {
      console.log(err)
      // not granted
      this.accessesForm()
    })

    this.stream = stream

    const recorder = new MediaRecorder(stream)
    this.recorder = recorder

    const chunks = []

    recorder.addEventListener('start', () => {
      console.log('start record')
      this.audioBtn.classList.add('record')
      this.audioBtn.textContent = '⏸'
    })

    recorder.addEventListener('dataavailable', (event) => {
      chunks.push(event.data)
    })

    recorder.addEventListener('stop', () => {
      this.audioBtn.classList.remove('record')
      this.audioBtn.textContent = '🎤'

      const blob = new Blob(chunks)
      const file = new File([blob], 'audio.mp3', { type: 'audio' })
      this.sendFile(file)
    })
    recorder.start()
  }

  // Геолокация
  onPosition = () => {
    getGeolocation((position) => {
      if (position) {
        const messageForm = new FormData()
        messageForm.append('message', ` Текущая геопозиция: ${position}`)
        fetch(this.host + ':' + this.port + '/messages', { method: 'POST', body: messageForm })
          .then(() => { this.ws.send('update') })
      }
    })
  }

  // livestream при записи
  videoStream = (stream) => {
    this.videoStreamELement = document.createElement('video')
    this.videoStreamELement.className = 'timeline__stream'
    this.videoStreamELement.muted = true
    this.videoStreamELement.autoplay = true
    document.body.appendChild(this.videoStreamELement)
  }

  categoryMenu = async (favorite = false) => {
    if (favorite) {
      const data = await fetch(this.host + ':' + this.port + '/messages/favorite')
        .then((res) => res.json())
        .then(res => res.messages)

      this.lazy.messages = []
      this.clearMessages()
      data.forEach((message) => drawMessage(message, this.bot))
      const closeFavorite = document.createElement('button')
      closeFavorite.className = 'close__favorite'
      closeFavorite.textContent = 'Выйти из избранного'
      closeFavorite.addEventListener('click', this.getMessages)
      this.bot.insertAdjacentElement('afterbegin', closeFavorite)

      return
    }

    if (document.querySelector('.category__menu')) {
      this.category.clear()
    }
    const data = await fetch(this.host + ':' + this.port + '/messages/category')
      .then((response) => response.json())
      .then((response) => response.messages)
    this.category.createDom(data, document.querySelector('.bot__wrapper'))
  }

  filterCategory = async (filter) => {
    const data = await fetch(this.host + ':' + this.port + `/messages/category/filter?filter=${filter}`)
      .then((response) => response.json())
      .then((response) => response.messages)
    this.lazy.messages = []
    this.clearMessages()
    data.forEach((message) => drawMessage(message, this.bot))
  }

  pinned = (message) => {
    if (this.pin) {
      this.pinPlace.insertAdjacentElement('afterend', this.pin)
      this.pinPlace.remove()
      this.pin.classList.remove('pin__message')
      this.pinArea.remove()
      if (document.querySelector('.find__wrapper') && !document.querySelector('.find__wrapper').classList.contains('hidden')) {
        document.querySelector('.find__wrapper').style.top = 10 + 'px'
      }
      if (this.pin === message) {
        this.pin = null
        return
      }
    }

    const pinPlace = document.createElement('div')
    pinPlace.className = "'pin__place"
    this.pinPlace = pinPlace

    message.insertAdjacentElement('beforebegin', pinPlace)
    console.log('pinned')
    this.pin = message
    this.pinArea = document.createElement('div')
    this.pinArea.className = 'pin__area'
    this.bot.insertAdjacentElement('afterbegin', this.pinArea)
    message.classList.add('pin__message')

    this.pinArea.append(message)
  }
}
