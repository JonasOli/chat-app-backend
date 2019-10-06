const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
	socket.emit("message", generateMessage("Welcome!"));
	socket.broadcast.emit("message", "a new user has joined");

	socket.on("sendMessage", (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed", null);
		}

		io.emit("message", generateMessage(message));
		callback(null, "Delivered");
	});

	socket.on("sendLocation", ({ lat, long }, callback) => {
		io.emit("message", `https://www.google.com/maps?q=${lat},${long}`);
		callback();
	});

	socket.on("disconnect", () => {
		io.emit("message", "a user has left");
	});
});

server.listen(port, () => console.log(`Server is running in port ${port}`));
