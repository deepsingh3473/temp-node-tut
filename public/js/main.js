const chatMessages = document.querySelector(".chat-messages");
const chatForm = document.getElementById("chat-form");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

const socket = io();

const { username , room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on("message", ({username, text, time})=>{
    outputMessage(username, text, time);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (event)=>{
    event.preventDefault();

    let msg = event.target.elements.msg.value;
    socket.emit("chatMessage", msg);

    event.target.elements.msg.value = "";
    event.target.elements.msg.focus();
});

function outputMessage(username, text, time){
    let div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${username} <span>${time}</span></p>
    <p class="text">
      ${text}
    </p>`;
    chatMessages.appendChild(div);
}

function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    usersList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}