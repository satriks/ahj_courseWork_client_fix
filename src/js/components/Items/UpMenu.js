import CategoryInterface from "./CategoryInterface"

export default class UpMenu {
    constructor (categoryCallback) {
      this.place = document.querySelector('.bot__wrapper')
      this.menu = null
      this.findInterfaces = null
      this.findClose = null
      // this.category = new CategoryInterface()
      this.categoryCallback = categoryCallback
      this.place.insertAdjacentElement("afterbegin", this.createAddMenu())
      this.findMessageInterfaces()
    }

    createAddMenu () {

    const menu = document.createElement('div')
    menu.className = 'up__menu hidden'


    const find = document.createElement('span')
    find.className = 'up__find'
    find.textContent = 'Поиск'
    find.addEventListener('click', this.findMessage)

    const type = document.createElement('span')
    type.className = 'up__type'
    type.textContent = 'Категории'
    type.addEventListener('click',() => {
      this.menu.classList.toggle('hidden')
      this.categoryCallback()
    })
    
    this.menu = menu
    menu.append(find, type)

    return menu
    }

    toggleMenu = () => {
        this.menu.classList.toggle('hidden')
    }
    findMessageInterfaces = () => {
      const findInputWrapper = document.createElement('div')
      findInputWrapper.className = 'find__wrapper hidden'
      
      const findInput = document.createElement('input')
      findInput.className='find__input '
      findInput.placeholder = 'Введите текст для поиска'

      const close = document.createElement('span')
      close.className = "find__close"
      close.textContent = "X"
      this.findClose = close

      findInputWrapper.append(findInput, close)


      this.findInterfaces = findInputWrapper
      document.querySelector('.bot__wrapper').append(findInputWrapper)

    }
    findMessage = () => {
      this.findInterfaces.classList.toggle('hidden')
      this.menu.classList.toggle('hidden')

    }



}