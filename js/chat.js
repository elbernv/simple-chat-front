axios.defaults.baseURL = config.apiUrl;
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

let userReceiverInfo = null;
let myInfo = null;

socket.on('send_message', (data) => {
  if (data.receiverId === myInfo.id && data.senderId === userReceiverInfo.id) {
    createReceiveMessageElement(userReceiverInfo, { message: data.message });
  }
});

const showMessagesLoader = () => {
  const messagesContainer = document.getElementById('messages-container');
  const divElement = document.createElement('div');

  divElement.classList.add(
    'spinner-messages-container',
    'd-flex',
    'justify-content-center',
    'align-items-center',
  );

  divElement.innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `;

  messagesContainer.appendChild(divElement);
};

const getUserReceiverInfo = async (id) => {
  return users.data.find((user) => user.id == id);
};

const getMessages = async (receiverId) => {
  const response = await axios.get(`chat/messages`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    params: {
      userReceiverId: receiverId,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    getUserReceiverInfo();

    return;
  }

  return response.data;
};

const createSendMessageElement = (myInfo, message) => {
  const messagesContainer = document.getElementById('messages-container');
  const divElement = document.createElement('div');
  divElement.classList.add('d-flex', 'justify-content-start', 'mb-4');

  divElement.innerHTML = `
    <div class="img_cont_msg">
      <img
        src="${myInfo.imgUrl}"
        class="rounded-circle user_img_msg"
      />
    </div>
    <div class="msg_cotainer">
      ${message.message}
      <span class="msg_time">8:40 AM, Today</span>
    </div>
  `;

  messagesContainer.appendChild(divElement);

  if (
    messagesContainer.scrollHeight - messagesContainer.scrollTop >
    messagesContainer.clientHeight
  ) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

const createReceiveMessageElement = (userReceiverInfo, message) => {
  if (userReceiverInfo.id === myInfo.id) {
    return;
  }

  const messagesContainer = document.getElementById('messages-container');
  const divElement = document.createElement('div');
  divElement.classList.add('d-flex', 'justify-content-end', 'mb-4');

  divElement.innerHTML = `
    <div class="msg_cotainer_send">
      ${message.message}
      <span class="msg_time_send">8:55 AM, Today</span>
    </div>
    <div class="img_cont_msg">
      <img
        src="${userReceiverInfo.imgUrl}"
        class="rounded-circle user_img_msg"
      />
    </div>
    `;

  messagesContainer.appendChild(divElement);

  if (
    messagesContainer.scrollHeight - messagesContainer.scrollTop === 404 ||
    messagesContainer.scrollTop === 0
  ) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

const openChat = async (userId) => {
  userReceiverInfo = await getUserReceiverInfo(userId);
  const messagesContainer = document.getElementById('messages-container');

  messagesContainer.innerHTML = ``;
  showMessagesLoader();

  if (activeUsers.includes(userId)) {
    document.getElementById('chat-with-status').classList.remove('offline');
  } else {
    document.getElementById('chat-with-status').classList.add('offline');
  }

  document.getElementById('chat-with-user-id').innerText = userReceiverInfo.id;

  document.getElementById(
    'chat-with',
  ).innerText = `Chat with ${userReceiverInfo.name}`;
  document.getElementById('image-chat-with').src = userReceiverInfo.imgUrl;

  const messages = await getMessages(userId);
  messagesContainer.innerHTML = ``;

  for (const message of messages) {
    if (message.type === 'sent') {
      createSendMessageElement(myInfo, message);
      continue;
    }

    createReceiveMessageElement(userReceiverInfo, message);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const sendMessage = async (event) => {
  const msgTextArea = document.getElementById('message-text-area');

  if (userReceiverInfo) {
    socket.emit('send_message', {
      message: msgTextArea.value,
      senderId: myInfo.id,
      receiverId: userReceiverInfo.id,
      sentDate: new Date(),
    });
  }

  createSendMessageElement(myInfo, { message: msgTextArea.value });

  msgTextArea.value = '';
};

const chatEnterKeyPress = async (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();

  await sendMessage();
};

const chatMain = async () => {
  myInfo = await getMyInfo();
};

chatMain();
