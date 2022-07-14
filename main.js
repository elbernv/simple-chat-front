const socket = io("http://192.168.2.229:5000")

const message = document.getElementById('message');
const messages = document.getElementById('messages');

const handleSubmitNewMessages = () => {
  socket.emit('message', { data : message.value });
}

socket.on('message', ({data})=>{
    handleNewMessage(data);
})

const handleNewMessage = (message)=>{
  messages.appendChild(buildNewMessage(message))
}

const buildNewMessage = (message) => {
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(message));
  return li;
}