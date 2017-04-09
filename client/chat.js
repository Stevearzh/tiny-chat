export default class Chat {
  constructor(socket) {
    this.socket = socket;
  }

  sendMessage = (room, text) => this.socket.emit('message', {
    room, text
  })

  changeRoom = newRoom => this.socket.emit('join', { newRoom })

  processCommand = cmd => {
    const words   = cmd.split(' '),
          command = words[0]
            .substring(1, words[0].length)
            .toLowerCase();
    let message = false;

    switch (command) {
      case 'join':
        words.shift();
        this.changeRoom(words.join(' '));
        break;
      case 'nick':
        words.shift()
        this.socket.emit('nameAttempt', words.join(' '));
        break;
      default:
        message = 'Unrecognized command.';
        break;        
    }

    return message;
  }
}
