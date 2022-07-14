const url = "http://192.168.2.229:3001"
const socket = io("http://192.168.2.229:5000")

const checkIfUserHasProfile = async () => {
  const response = await axios.get(`${url}/check-if-user-has-profile`);
  
  return response;
}

const createActiveUserElement = (activeUser) => {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="d-flex bd-highlight">
      <div class="img_cont">
        <img src="${activeUser.image}" style="height: 100%; width: 100%;border-radius: 50%;">
        <span class="online_icon"></span>
      </div>
      <div class="user_info">
        <span>${activeUser.name}</span>
        <p>${activeUser.name} is online</p>
      </div>
     </div>
  `
  const contacts = document.getElementById('contacts');

  contacts.appendChild(li)
}

checkIfUserHasProfile()
  .then(async (response)=>{
    if(response.data === false){
      window.location.href = 'registro.html'
    }

    socket.emit("get-active-users", {data: ''})

    socket.on('get-active-users', (data)=>{
      const contacts = document.getElementById('contacts');
      contacts.innerHTML = ``;

      for(const activeUser of data){
        createActiveUserElement(activeUser);
      }
    })
  })
  .catch((error)=>{
    console.log(error)
  })

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
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="card" style="width: 18rem;">
      <img class="card-img-top" src="https://estnn.com/wp-content/uploads/2022/06/sg-fiddle-e1655985495691.jpg" alt="Card image cap" width="300" heigth="200">
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <p>
          ${message}
        </p>
      </div>
    </div>
  `;
  return div;
}