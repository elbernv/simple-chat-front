const url = "http://192.168.2.229:3001"
const socket = io("http://192.168.2.229:5000")
const messageInput = document.getElementById('message');
let profile = { name : window.location.search.slice(1, window.location.search.length) };


const checkIfUserHasProfile = async () => {
  const response = await axios.get(`${url}/check-if-user-has-profile?name=${profile?.name || 'notprofile'}`);
  
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

const messageSentByMe = (sendBy) => {
  return sendBy === profile.name
}

const createMessageSentByMeElement = (messageBody) => {
  const msgCardBody = document.getElementById('msg-card-body');
  const div = document.createElement('div');
  div.classList.add('d-flex', 'justify-content-start', 'mb-4');

  div.innerHTML = `
    <div class="img_cont_msg">
      <img src="${messageBody.image}" class="rounded-circle user_img_msg">
    </div>
    <div class="msg_cotainer">
      ${messageBody.message}
      <span class="msg_time">9:12 AM, Today</span>
    </div>
  `
  msgCardBody.appendChild(div);
  console.log(msgCardBody.scrollHeight);
  console.log(msgCardBody.scrollTop);
  if(
      msgCardBody.scrollHeight - msgCardBody.scrollTop === 404 ||
      msgCardBody.scrollTop === 0
    ){
    msgCardBody.scrollTop = msgCardBody.scrollHeight;
  }
}

const createMessageSentByAnother = (messageBody) => {
  const msgCardBody = document.getElementById('msg-card-body');
  const div = document.createElement('div');
  div.classList.add('d-flex', 'justify-content-end', 'mb-4');

  div.innerHTML = `
    <div class="msg_cotainer_send">
      ${messageBody.message}
      <span class="msg_time_send">9:10 AM, Today</span>
    </div>
    <div class="img_cont_msg">
      <img src="${messageBody.image}" class="rounded-circle user_img_msg">
    </div>
  `
  msgCardBody.appendChild(div);
  if(
      msgCardBody.scrollHeight - msgCardBody.scrollTop === 404 ||
      msgCardBody.scrollTop === 0
    ){
    msgCardBody.scrollTop = msgCardBody.scrollHeight;
  }
}

const sendMessage = () => {
  if(messageInput.value === ""){
    return;
  }

  socket.emit('send-message', {message: messageInput.value, sendBy: profile.name});

  messageInput.value = "";
}

checkIfUserHasProfile()
  .then(async (response)=>{
    console.log(response)
    if(response.data === false){
      window.location.href = 'registro.html'
    }

    profile = response.data;

    socket.emit("get-active-users", '');

    socket.on('get-active-users', (data)=>{
      const contacts = document.getElementById('contacts');
      contacts.innerHTML = ``;

      for(const activeUser of data){
        createActiveUserElement(activeUser);
      }
    });

    socket.on('receive-message', (data)=>{
      if(messageSentByMe(data.sendBy)){
        createMessageSentByMeElement(data);
        return;
      }

      createMessageSentByAnother(data);
      return;
    })

  })
  .catch((error)=>{
    console.log(error)
  })

  messageInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});