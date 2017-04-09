import React from 'react';
import ReactDom from 'react-dom';
import io from 'socket.io-client';
import Chat from './chat';

const socket  = io.connect(),
      chatApp = new Chat(socket);

class App extends React.Component {
  state = {
    input: '',
    messages: [],
    room: '',
    users: []
  }

  componentDidMount() {
    socket.on('nameResult', result => {
      let message;

      if (result.success) {
        message = `You are now known as ${result.name}.`;
      } else {
        message = result.message;
      }

      this.pushMessages(message);
    });

    socket.on('joinResult', result => {
      this.setState({ room: result.room });
      this.pushMessages(`Room changed to ${result.room}.`);
    });

    socket.on('message', message => this.pushMessages(message.text));

    socket.on('usersInRoom', usersInRoom =>
      this.setState({ users: usersInRoom.list })
    );
  }

  pushMessages = message => this.setState({
    messages: [
      ...this.state.messages,
      message
    ]
  })

  processUserInput = (chatApp, socket) => {
    let systemMessage;

    if (this.state.input.charAt(0) === '/') {
      systemMessage = chatApp.processCommand(this.state.input);
      if (systemMessage) {
        this.pushMessages(systemMessage);
      }
    } else {
      chatApp.sendMessage(this.state.room, this.state.input);
      this.pushMessages(this.state.input);
    }
  }

  render() {    
    return (
      <div className='content'>
        <div className='room'>{ this.state.room }</div>
        <ul className='room-list'>
          {
            Array.prototype.map.call(
              this.state.users,
              (user, i) => <li key={i}>{user}</li>
            )
          }
        </ul>
        <div className='messages'>
          {
            Array.prototype.map.call(
              this.state.messages,
              (msg, i) => <pre key={i}>{msg}</pre>
            )
          }
        </div>
        <form
          className='send-form'
          onSubmit={ event => {
            event.preventDefault();
            this.processUserInput(chatApp, socket);
          }}
        >
          <input
            className='send-message'
            onChange={ event => this.setState({ input: event.target.value }) }
            value={ this.state.value }
          />
          <button className='send-btn' type='submit'>Send</button>
          <div className='help'>
            Chat commands:
            <ul>
              <li>Change nickname: <code>/nick [username]</code></li>
              <li>Join/create room: <code>/join [room name]</code></li>
            </ul>
          </div>
        </form>
      </div>
    );
  }
}

ReactDom.render(<App/>, document.getElementById('app'));
