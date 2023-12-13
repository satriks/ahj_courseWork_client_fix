export default class LazyLoader {
  constructor (messages = []) {
    this.messages = [...messages]
  }

  addMessages (messages) {
    this.messages = [...this.messages, ...messages]
  }

  getMessages () {
    const loadMessages = []
    for (let i = 0; i < 10; i++) {
      if (this.messages.length === 0) { continue }
      loadMessages.push(this.messages.pop())
    }
    return loadMessages
  }
}

// TODO сделать что бы хранились все сообщение и при покрутке давались новые.  Для отрисовки нового сообщения сделать е отдельно без лейзи

// 1. получить все
// 2. отдавать 10
