'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');

const SocketServer = require('./socket.js');
class Server {
	constructor() {
		this.port = 5000;
		this.host = "localhost";

		this.app = express();
		this.http = http.Server(this.app); //Run  a server
		this.socket = socket(this.http); // here run sockte module
	}

	runServer() {

		new SocketServer(this.socket).socketConnection();

		/* here listern node js server */
		this.http.listen(this.port, this.host, ()=> {
			console.log(`the server running at http://${this.host}:${this.port}`);
		});
		/* here listern node js server */
	}
}

const app = new Server();
app.runServer(); //run a server