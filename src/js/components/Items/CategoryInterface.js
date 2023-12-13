export default class CategoryInterface {
  constructor (filterCallback, closeCallback) {
    this.menu = null
    this.filterCallback = filterCallback
    this.closeCallback = closeCallback
  }

  createDom = (data, callback) => {
    const categoryMenu = document.createElement('div')
    categoryMenu.className = 'category__menu'

    const categoryMessage = document.createElement('div')
    categoryMessage.className = 'category__item'
    categoryMessage.addEventListener('click', () => this.filter('message'))

    const messageName = document.createElement('span')
    messageName.textContent = 'Message :'
    messageName.className = 'category__name'

    const messageCount = document.createElement('span')
    messageCount.className = 'category__count'
    messageCount.textContent = data.message

    categoryMessage.append(messageName, messageCount)

    const categoryVideo = document.createElement('div')
    categoryVideo.className = 'category__item'
    categoryVideo.addEventListener('click', () => this.filter('video'))

    const videoName = document.createElement('span')
    videoName.textContent = 'Video :'
    videoName.className = 'category__name'

    const videoCount = document.createElement('span')
    videoCount.className = 'category__count'
    videoCount.textContent = data.video

    categoryVideo.append(videoName, videoCount)

    const categoryAudio = document.createElement('div')
    categoryAudio.className = 'category__item'
    categoryAudio.addEventListener('click', () => this.filter('audio'))

    const audioName = document.createElement('span')
    audioName.textContent = 'Audio :'
    audioName.className = 'category__name'

    const audioCount = document.createElement('span')
    audioCount.className = 'category__count'
    audioCount.textContent = data.audio

    categoryAudio.append(audioName, audioCount)

    const categoryImage = document.createElement('div')
    categoryImage.className = 'category__item'
    categoryImage.addEventListener('click', () => this.filter('image'))

    const imageName = document.createElement('span')
    imageName.textContent = 'Image :'
    imageName.className = 'category__name'

    const imageCount = document.createElement('span')
    imageCount.textContent = data.image
    imageCount.className = 'category__count'

    categoryImage.append(imageName, imageCount)

    const categoryOther = document.createElement('div')
    categoryOther.className = 'category__item'
    categoryOther.addEventListener('click', () => this.filter('other'))

    const otherName = document.createElement('span')
    otherName.textContent = 'Other :'
    otherName.className = 'category__name'

    const otherCount = document.createElement('span')
    otherCount.className = 'category__count'
    otherCount.textContent = data.other

    categoryOther.append(otherName, otherCount)

    const close = document.createElement('button')
    close.className = 'category__close'
    close.textContent = 'X'
    close.addEventListener('click', this.clear)

    categoryMenu.append(categoryMessage, categoryImage, categoryVideo, categoryAudio, categoryOther, close)

    this.menu = categoryMenu

    callback.append(categoryMenu)
  }

  clear = () => {
    this.menu.remove()
    this.closeCallback()
  }

  filter = (type) => {
    console.log(type)
    this.filterCallback(type)
  }
}
