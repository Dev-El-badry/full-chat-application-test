'use strict';

class Socket {
	constructor(socket) {
		this.io = socket;
		this.users_online = [];
		this.status = '';
	}

	ioConfig() {

		this.io.use((socket, next)=> {
			socket['id'] = socket.handshake.query.userId;

			if(socket.handshake.query.mylist != '' || socket.handshake.query.mylist != 'undefined') {
				socket['myfriends'] = socket.handshake.query.mylist.split(',');
			} else {
				socket['myfriends'] = [];
			}

			if(socket.handshake.query.username != '' || socket.handshake.query.username != 'undefined') {
				socket['username'] = socket.handshake.query.username;
			} else {
				socket['username'] = '';
			}

			if(this.status != '') {
				socket['status'] = this.status;
			} else {
				socket['status'] = socket.handshake.query.status;
				this.status = socket.handshake.query.status;
			}
			
			next();
		});
	}

	send_private_message(socket) {
		socket.on('snd_private_msg', (data)=> {
			console.log('data', data.to);

			this.io.sockets.connected[socket.id].emit('new_private_message', {
				username: socket.username,
				from_uid: data.to,
				whois: socket.id,
				message: data.message
			});

			this.io.sockets.connected[data.to].emit('new_private_message', {
				username: socket.username,
				from_uid: socket.id,
				whois: socket.id,
				message: data.message
			});
		});
	}

	change_status(socket) {
		socket.on('change_status', (data)=> {
			var my_friends = socket.myfriends;
			if(my_friends.length > 0) {

				this.status = data.status; //assign new value to update status
				my_friends.forEach((user) =>{
					var uid = 'user_'+user;

					if(this.users_online.indexOf(uid) != -1) {
						this.io.sockets.connected[uid].emit('new_status', {
							status: data.status,
							user_id: socket.id
						});
					}
				});

			}
		});
	}

	chk_online_users(socket) {
		socket.on('chk_online', (data)=> {
			
			if(this.users_online.indexOf(data.user_id) != -1)
			{	
				var status = 'online';

				//send to all without me iam online
				this.io.sockets.connected[data.user_id].emit('iam_online', {
					status: 'online',
					user_id: socket.id
				});
			} else {
				var status = 'offline';
			}

			this.io.sockets.connected[socket.id].emit('is_online', {
				status: this.status,
				user_id: data.user_id
			});
		});

	}

	broadcast_private(socket) {
		socket.on('broadcast_private', (data)=> {
			this.io.sockets.connected[data.to].emit('new_broadcast', {
				from: socket.id,
				to: data.to,
				username:data.username
			});	
		});
	}

	socketConnection() {
		this.ioConfig();

		this.io.on('connection', (socket)=> {
			this.users_online = Object.keys(this.io.sockets.sockets);

			/*socket.broadcast.emit('online_users', {
				socket_id: socket.id
			});*/
			
			this.change_status(socket);
			this.chk_online_users(socket);
			this.broadcast_private(socket);
			this.send_private_message(socket);
			
			this.socketDisconnection(socket); //disconnect user list
		});
	}

	socketDisconnection(socket) {


		socket.on('disconnect', (data)=> {
			
			var myfirends = socket.myfriends;
			
			myfirends.forEach((user)=> {
				var uid = 'user_'+user;
				if(this.users_online.indexOf(uid) != -1)
				{
					this.io.sockets.connected[uid].emit('iam_offline', {
						status: 'offline',
						user_id: socket.id
					});
				}
				socket.disconnect();
				var index = this.users_online.indexOf(uid);

				this.users_online.splice(index, 1);
				Object.keys(this.io.sockets.sockets).splice(index, 1);


			});
		});
	}
}

module.exports = Socket;