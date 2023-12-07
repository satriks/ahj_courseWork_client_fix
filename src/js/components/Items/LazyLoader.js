export default class LazyLoader{
    constructor(messages = []){
        this.messages = []
        if (messages.length) this.messages = [...messages]
        this.count = 0
    }   

    addMessages(messages) {
        this.messages = [...this.messages, ...messages]
    }
    getMessages() { 
        const loadMessages = []
        for (let i = 0; i < 10; i++){
            if (this.messages.length == 0) {continue}
            loadMessages.push(this.messages.shift())
        }
        return loadMessages }
} 