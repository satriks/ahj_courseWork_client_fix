export default class AddMenu {
  constructor () {
    this.place = document.querySelector('.bot__add')
    this.menu = null
  }

  createAddMenu () {
    const menu = document.createElement('div')
    menu.className = 'add__menu'
    menu.addEventListener('click', this.addFIle)

    const addFile = document.createElement('span')
    addFile.className = 'menu__addFile'
    addFile.textContent = 'Add file'

    menu.append(addFile)
    this.menu = menu

    this.place.appendChild(menu)
  }

  clearAddMenu () {
    this.menu.remove()
  }

  addFIle () {
    document.querySelector('.bot__input-file').click()
  }
}
