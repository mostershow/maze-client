(function($) {
	jQuery.WebSocketMgr = function() {
		const serverUrl = 'ws://localhost:10031';
		// 定义一个结构体
		const wsConnection = {};
		wsConnection.logined = false;
		// 结构体中想放什么，就放什么
		// wsConnection.onOpen = 'a';
		let callBack;

		/* 初始化websocket */
		function initConnection(cb) {
			callBack=cb;
			if(!!wsConnection.websocket) {
				wsConnection.websocket.close();
			}

			wsConnection.websocket = new WebSocket(serverUrl+"/"+wsConnection.userId+"/"+wsConnection.roomId);
			wsConnection.websocket.binaryType = "arraybuffer";
			//var imConnection = new WebSocket(imConnectionUrl);
			wsConnection.websocket.onopen = wsOpen;
			wsConnection.websocket.onmessage = wsMessage;
			wsConnection.websocket.onclose = wsClose;
		}

		const connection = wsConnection;

		/*连接服务端*/
		function wsOpen(event) {
			console.log('connect to im success');
			// wsConnection.clientState = UserStatType.USER_STATUS_ONLINE;
			// if(wsConnection.logined && !!wsConnection.loginInfo) {
			// 	// 如果登录(长连接建立)失败，不断重试
			// 	relogin(function(res, error) {
			// 		if(res) {
			// 			console.log('relogin success');
			// 		}
			// 	});
			// }
			// 连接好后开始心跳
			heartCheck.start();
		}
		/*关闭连接*/
		function wsClose(event) {
			if(!window.navigator.onLine) {
				wsConnection.clientState = UserStatType.USER_STATUS_OFFLINE;
			} else if(wsConnection.logined) {
				initConnection();
			}
		}
		/*收到数据*/
		function wsMessage(event) {
			var pdu = event.data.slice(0, 2);
			var len = event.data.slice(2,6);
			var ByteBuffer = dcodeIO.ByteBuffer;
			var pduLL = new ByteBuffer();
			pduLL.append(len);
			var length = pduLL.readUInt32(0);
			var data = event.data.slice(6,6+length);
			
			var pduBB = new ByteBuffer();
			pduBB.append(pdu);
			
			var serviceId = pduBB.readUInt16(0);
			
			console.log("serviceId:" + serviceId);
			
			var json = JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(data)));   //将二进制数组转为字符串(重点)
			// var json1 = byteToString(data);
			// var json = JSON.stringify(json1);
			console.log(json);
			var res = {}
			res.commandId = serviceId;
			res.data = json;
			// handleEventData(data);
			if(callBack)callBack(res.commandId, res.data);
			else console.log("消息未设置处理方法！");
			// 接到消息，重置心跳
			heartCheck.reset();
		}
		/*发送消息*/
		function sendMsg(argument) {
			wsConnection.websocket.send(Base64.encode(argument));
		}
		/*发送2进制数据*/
		function sendBinaryData(binaryData) {
			wsConnection.websocket.send(binaryData);
		}
		// const heartCheck = {
		// 	timeout: 10000,//10秒
		// 	timeoutObj: null,
		// 	reset: function () {//接收成功一次推送，就将心跳检测的倒计时重置为30秒
		// 		clearTimeout(this.timeoutObj);//重置倒计时
		// 		this.start();
		// 	},
		// 	start: function () {//启动心跳检测机制，设置倒计时30秒一次
		// 		this.timeoutObj = setTimeout(function () {
		// 			console.log("心跳一次");
		// 			answerHeartBeat();
		// 		}, this.timeout)
		// 	},
		// 	//onopen连接上，就开始start及时，如果在定时时间范围内，onmessage获取到了服务端消息，
		// 	// 就重置reset倒计时，距离上次从后端获取消息30秒后，执行心跳检测，看是不是断了。
		// };
		return {
			serverUrl:serverUrl,
			wsConnection:wsConnection,
			initConnection:initConnection,
			connection:connection,
			callBack:callBack,
			wsOpen:wsOpen,
			wsClose:wsClose,
			wsMessage:wsMessage,
			sendMsg:sendMsg,
			sendBinaryData:sendBinaryData
		};
	}
})($);