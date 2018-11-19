'use strict';

class Socket {
	constructor(socket) {
		this.io = socket;
		this.users_online = [];
	}

	ioConfig() {

		this.io.use((socket, next)=> {
			socket['id'] = socket.handshake.query.userId;
			socket['myfriends'] = socket.handshake.query.mylist.split(',');
			
			next();
		});
	}

	change_status(socket) {
		socket.on('change_status', (data)=> {
			var my_friends = socket.myfriends;

			my_friends.forEach(function(user) {
				var uid = 'user_'.user;

				if(this.users_online.indexOf(uid) != -1) {
					this.io.sockets.connected[uid].emit('new_status', {
						status: socket.status,
						user_id: socket.id
					});
				}
			});
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
				status: status,
				user_id: data.user_id
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
			
			this.chk_online_users(socket);
			this.change_status(socket);
			

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
			});
		});
	}
}

module.exports = Socket;