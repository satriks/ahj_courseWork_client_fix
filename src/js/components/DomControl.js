import createDom from './Items/StartDom'
import drawMessage from './Items/drawMessage'
import AddMenu from './Items/addMenu'
import LazyLoader from './Items/lazyLoader'
import UpMenu from './Items/UpMenu'
import captureFile from './Items/captureFile'
import CategoryInterface from './Items/CategoryInterface'
import { getGeolocation } from './Items/getGeolocation'
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
    this.category = new CategoryInterface(this.filterCategory, this.getMessages)
    this.upMenu = new UpMenu(this.categoryMenu)
    this.videoBtn = document.querySelector('.bot__video')
    this.audioBtn = document.querySelector('.bot__audio')
    this.positionBtn = document.querySelector('.bot__position')
    

    this.listeners()
    this.getMessages(true)
    // this.onVideo()
    // getGeolocation((pos) => console.log(pos))
    // this.categoryMenu()

    

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
    this.videoBtn.addEventListener('click', this.onVideo)
    this.audioBtn.addEventListener('click', this.onAudio)
    this.positionBtn.addEventListener('click', this.onPosition)
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
      if ( document.querySelector('.category__menu')){
        this.categoryMenu()
      }
    }
  }

  //получаем все сообщения 
  getMessages = (scroll = false) => {
    fetch(this.host + ":" + this.port + '/messages')
      .then((response) => response.json())
      .then((response) => {
        this.clearMessages()
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

    const send = () => {
      data.append('text', document.querySelector('.capture__input').value)
      fetch(this.host + ":" + this.port + '/messages', { method: 'POST', body: data })
        .then((response) => {
          this.ws.send("update")
          this.label.remove()
          if ( document.querySelector('.category__menu')){
            this.categoryMenu()
          }
        })
      }

    document.querySelector('.bot__wrapper').insertAdjacentElement('afterbegin', this.label )
    document.querySelector('.capture__close').addEventListener('click', () =>{this.label.remove()})
    document.querySelector('.capture__btn').addEventListener('click', send)
    document.querySelector('.capture__input').addEventListener('keydown', (evt) => { if (evt.key === "Enter") {send()}})

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
          this.lazy.messages = []
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
  //Запись видео 
  onVideo = async (event) => {
    if (event.target.classList.contains("record")) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.recorder.stop()
      return
    }


    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).catch((err) => {
      // not granted
      this.accessesForm()

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
      const file = new File([blob], 'video', {type: "video"})
      console.log(file);
      this.sendFile(file)
     
    })
    recorder.start()


  }
  //Запись аудио
  onAudio = async (event) => {
    if (event.target.classList.contains("record")) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.recorder.stop()
      return
    }


    const stream = await navigator.mediaDevices.getUserMedia({
      // video: true,
      audio: true
    }).catch((err) => {
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
      const file = new File([blob], 'video', {type: "audio"})
      console.log(file);
      this.sendFile(file)
     
    })
    recorder.start()


  }
  //Геолокация
  onPosition = () => {
    getGeolocation( (position) => {
      if (position){
        const messageForm = new FormData()
        messageForm.append('message', ` Текущая геопозиция: ${position}`)
        fetch(this.host + ":" + this.port + '/messages', { method: 'POST', body: messageForm })
          .then(() => {this.ws.send("update") })

      }
    })
  }
  //livestream при записи 
  videoStream = (stream) => {
    this.videoStreamELement = document.createElement('video')
    this.videoStreamELement.className = 'timeline__stream'
    this.videoStreamELement.muted = true
    this.videoStreamELement.autoplay = true
    document.body.appendChild(this.videoStreamELement)
  }

  categoryMenu = async () => {

    if (document.querySelector('.category__menu')){
      this.category.clear()
    }    
      const data = await fetch(this.host + ":" + this.port + '/messages/category')
        .then((response) => response.json())
        .then((response) => response.messages)
      console.log(data);
      this.category.createDom(data, document.querySelector('.bot__wrapper'))

  }

  filterCategory = async (filter) => {
    const data = await fetch(this.host + ":" + this.port + `/messages/category/filter?filter=${filter}`)
    .then((response) => response.json())
    .then((response) => response.messages)
    this.lazy.messages = []
    this.clearMessages()
    data.forEach((message) => drawMessage(message, this.bot))
  }
}
