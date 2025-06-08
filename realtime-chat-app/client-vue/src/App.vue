<template>
  <div id="app">
    <h1>Real-time Chat</h1>

    <div v-if="!username" class="username-section">
      <input v-model="tempUsername" placeholder="Enter your username"/>
      <button @click="setUsername">Join Chat</button>
    </div>

    <div v-else>
      <div class="message-history">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="{'my-message': msg.sender === username, 'other-message': msg.sender !== username}"
        >
          <strong>{{ msg.sender }}:</strong> {{ msg.text }}
        </div>
        <div ref="messagesEnd" class="scroll-to-bottom"></div>
      </div>

      <div class="message-input-area">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'App',
  data() {
    return {
      socket: null,
      messages: [],
      newMessage: '',
      username: '',
      tempUsername: ''
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000'); // Connect to your Node.js server

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('message history', (history) => {
      this.messages = history;
      this.$nextTick(this.scrollToBottom);
    });

    this.socket.on('chat message', (msg) => {
      this.messages.push(msg);
      this.$nextTick(this.scrollToBottom);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  },
  methods: {
    setUsername() {
      if (this.tempUsername.trim()) {
        this.username = this.tempUsername.trim();
      }
    },
    sendMessage() {
      if (this.newMessage.trim() && this.username) {
        const messageData = {
          sender: this.username,
          text: this.newMessage.trim(),
          timestamp: new Date().toISOString()
        };
        this.socket.emit('chat message', messageData);
        this.newMessage = '';
      }
    },
    scrollToBottom() {
      const element = this.$refs.messagesEnd;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style>
/* Basic Styling for the Chat Interface */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 20px auto;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 500px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.username-section {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.message-history {
  flex-grow: 1;
  border: 1px solid #eee;
  padding: 10px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.my-message {
  align-self: flex-end;
  background-color: #dcf8c6;
  padding: 8px 12px;
  border-radius: 15px;
  margin-bottom: 8px;
  max-width: 80%;
  word-wrap: break-word;
}

.other-message {
  align-self: flex-start;
  background-color: #e0e0e0;
  padding: 8px 12px;
  border-radius: 15px;
  margin-bottom: 8px;
  max-width: 80%;
  word-wrap: break-word;
}

.message-history strong {
  font-weight: bold;
  margin-right: 5px;
  color: #333;
}

.message-input-area {
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: auto;
}

input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 20px;
  flex-grow: 1;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0056b3;
}

.scroll-to-bottom {
  height: 1px;
}
</style>