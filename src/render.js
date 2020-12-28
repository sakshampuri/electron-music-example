const { ipcRenderer } = require("electron");

const btn = document.getElementById("login");
const display = document.getElementById("token");

let token = undefined;

btn.onclick = async () => {
    console.log("Login starting");
    btn.className = btn.className + " disabled";
    ipcRenderer.send("auth-start");
    ipcRenderer.on("auth-success", (_, token) => {
        console.log({ token });
        token = token;
        display.innerHTML = `Congratulations! You are succesfully logged in!\nThis is your login token obtained: ${token} `;
    });
};
