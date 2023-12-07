export default function createDom(element){
    const wrapper = document.createElement('div');
    wrapper.className = "bot__wrapper" 

    const bot = document.createElement('div');
    bot.className = "bot"

    const inputFile = document.createElement('input');
    inputFile.type = "file"
    inputFile.className = "bot__input-file"
    inputFile.classList.add("hidden")

    const inputControl = document.createElement('div');
    inputControl.className = "bot__input-control"

    const buttonAdd = document.createElement('button');
    buttonAdd.className = "bot__add"
    buttonAdd.textContent = "+"

    const botInput = document.createElement('input');
    botInput.className = "bot__input"
    botInput.type = "text"
    botInput.placeholder = "Введите текст"

    const buttonAudio = document.createElement('button');
    buttonAudio.className = "bot__audio"
    buttonAudio.textContent = "🎤"

    const buttonVideo = document.createElement('button');
    buttonVideo.className = "bot__audio"
    buttonVideo.textContent = "📹"

    const botMenu = document.createElement('button');
    botMenu.className = "bot__menu"
    botMenu.textContent = "︙"



    inputControl.append(buttonAdd, botInput, buttonAudio, buttonVideo)
    wrapper.append(bot,inputFile, inputControl, botMenu)

    element.appendChild(wrapper)

}