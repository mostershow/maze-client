'use strict';
var socket = $.WebSocketMgr();
var eventMgr = $.EventMgr();
var dataEncrypt = $.DataEncrypt();

//生成一个api的序列号 保证请求的顺序
function getSeqNum() {
	actionSeqNum++;
	return actionSeqNum;
}

// socket.wsConnection.userId = "11";
// socket.wsConnection.roomId = "11";
// socket.initConnection(eventMgr.assignedEvent);
function conn(userId,roomId){
	socket.wsConnection.userId = userId;
	socket.wsConnection.roomId = roomId;
	socket.initConnection(eventMgr.assignedEvent);
}


function registerEvent() {
	// eventMgr.addEvent(CmdID.LOGIN_RES_USERLOGIN,handleResForLogin);//登录请求后,服务的应答
	// eventMgr.addEvent(MessageCmdID.CID_MSG_DATA,handleResForNewMsg);//服务端向客户端发的消息
	// eventMgr.addEvent(MessageCmdID.CID_MSG_DATA_ACK,handleResForMsgAck);//客户端发消息成功后,服务端的应答
	// eventMgr.addEvent(MessageCmdID.CID_MSG_LIST_RESPONSE,handleResForMsgList);//客户端请求消息列表得到的应答
	// eventMgr.addEvent(MessageCmdID.CID_MSG_UNREAD_CNT_RESPONSE,handleUnReadMessageCnt);//客户端请求未读消息得到的应答
	// eventMgr.addEvent(GroupCmdID.CID_GROUP_NORMAL_LIST_RESPONSE,handleGroupNormalList);//客户端请求群列表得到应答
	// eventMgr.addEvent(GroupCmdID.CID_GROUP_INFO_RESPONSE,handleGroupInfoRes);//客户端请求群详情得到的应答
	// eventMgr.addEvent(BuddyListCmdID.CID_BUDDY_LIST_RECENT_CONTACT_SESSION_RESPONSE,handleResForRecentlySession);//请求最近会话列表服务端的应答
	// eventMgr.addEvent(BuddyListCmdID.CID_BUDDY_LIST_ALL_USER_RESPONSE,handleResForAllFriends);
	// eventMgr.addEvent(BuddyListCmdID.CID_BUDDY_LIST_USER_INFO_RESPONSE,handleResForFriendsByIds);
	eventMgr.addEvent(CmdID.HEARTBEAT, answerHeartBeat);
	eventMgr.addEvent(CmdID.MOVE_REQ, answerMove);
	eventMgr.addEvent(CmdID.MAZE_RES, recOtherMaze);
	eventMgr.addEvent(CmdID.MAZE_MOVE_RES, mazeMove);
}
registerEvent();

// encode
function buildPackage(req, commandId) {
	var length = req.length;
	console.log("readableBytes:" + length);
	var ByteBuffer = dcodeIO.ByteBuffer;
	var bb = new ByteBuffer();
	bb.writeUInt16(commandId);
	bb.writeUInt32(length); // 前4个字节存储长度
	// bb.writeUInt16(1); // 两个字节
	// bb.writeUInt16(0); // 两个字节
	// bb.writeUInt16(serviceId); // 两个字节
	// bb.writeUInt16(commandId); // 
	// bb.writeUInt16(seqNum);
	// bb.writeUInt16(0);
	bb.append(req);
	return bb;
}


function mazeMove(data) {
	otherMazeMove(data.pos);
}
function recOtherMaze(data) {
	console.log("接收到迷宫推送1");
	var json = JSON.stringify(data);
	console.log(json);
	getOtherMaze(data);
}

const heartCheck = {
	timeout: 10000,//10秒
	timeoutObj: null,
	reset: function () {//接收成功一次推送，就将心跳检测的倒计时重置为30秒
		clearTimeout(this.timeoutObj);//重置倒计时
		this.start();
	},
	start: function () {//启动心跳检测机制，设置倒计时30秒一次
		this.timeoutObj = setTimeout(function () {
			console.log("心跳一次");
			answerHeartBeat();
		}, this.timeout)
	},
	//onopen连接上，就开始start及时，如果在定时时间范围内，onmessage获取到了服务端消息，
	// 就重置reset倒计时，距离上次从后端获取消息30秒后，执行心跳检测，看是不是断了。
};

//应答来自服务端的心跳包
function answerHeartBeat() {
	// var IMHeartBeat = IMOther.build('IM.Other.IMHeartBeat');
	// var hearBeat = new IMHeartBeat();
	var buffer = buildPackage(str2UTF8("{}"), 1);
	socket.sendBinaryData(buffer.buffer);
}
function answerMove(d) {
	console.log("move!!!!!!!!!!!!!" + d);
	// var MoveReq = IMLogin.build('IM.Login.MoveReq');
	var move = {};
	move.direction = d.direction;
	move.userId = d.userId;
	var json = JSON.stringify(move)
	console.log(json);

	var buffer = buildPackage(str2UTF8(json), 11);
	socket.sendBinaryData(buffer.buffer);
}
//心跳检测  .所谓的心跳检测，就是隔一段时间向服务器仅限一次数据访问，因为长时间不使用会导致ws自动断开，
// 一般是间隔90秒内无操作会自动断开，因此，在间隔时间内进行一次数据访问，以防止ws断开即可，
//这里选择30秒，倒计时30秒内无操作则进行一次访问，有操作则重置计时器
//
//封装为键值对的形式，成为js对象，与json很相似



function str2UTF8(str) {
	var bytes = new Array();
	var len, c;
	len = str.length;
	for (var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if (c >= 0x010000 && c <= 0x10FFFF) {
			bytes.push(((c >> 18) & 0x07) | 0xF0);
			bytes.push(((c >> 12) & 0x3F) | 0x80);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if (c >= 0x000800 && c <= 0x00FFFF) {
			bytes.push(((c >> 12) & 0x0F) | 0xE0);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if (c >= 0x000080 && c <= 0x0007FF) {
			bytes.push(((c >> 6) & 0x1F) | 0xC0);
			bytes.push((c & 0x3F) | 0x80);
		} else {
			bytes.push(c & 0xFF);
		}
	}
	return bytes;
}
function byteToString(arr) {
	if (typeof arr === 'string') {
		return arr;
	}
	var str = '',
		_arr = arr;
	for (var i = 0; i < _arr.length; i++) {
		var one = _arr[i].toString(2),
			v = one.match(/^1+?(?=0)/);
		if (v && one.length == 8) {
			var bytesLength = v[0].length;
			var store = _arr[i].toString(2).slice(7 - bytesLength);
			for (var st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2);
			}
			str += String.fromCharCode(parseInt(store, 2));
			i += bytesLength - 1;
		} else {
			str += String.fromCharCode(_arr[i]);
		}
	}
	return str;
}
