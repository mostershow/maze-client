var app=angular.module('todo', ['ionic']);

var ProtoBuf = dcodeIO.ProtoBuf;
var IMBaseDefine = ProtoBuf.loadProtoFile("./ws/pb/IM.BaseDefine.proto"); 
var IMLogin = ProtoBuf.loadProtoFile("./ws/pb/IM.Login.proto");
var IMGroup = ProtoBuf.loadProtoFile("./ws/pb/IM.Group.proto");
var IMOther = ProtoBuf.loadProtoFile("./ws/pb/IM.Other.proto");
var IMBuddy = ProtoBuf.loadProtoFile("./ws/pb/IM.Buddy.proto");
var IMMessage = ProtoBuf.loadProtoFile("./ws/pb/IM.Message.proto");

var apiHashMap = new HashMap;
var local_msg_id = 1000000;

var actionSeqNum = 1;


function HashMap(){
	this.Set = function(key,value){this[key] = value};  
	this.Get = function(key){return this[key]};  
	this.Contains = function(key){return this.Get(key) == null?false:true};  
	this.Remove = function(key){delete this[key]};  
}

var imDb = {
	initDb:function() { 
			   this.userDb = new HashMap;
			   this.msgDb = new HashMap;
			   this.groupDb = new HashMap;
		   },
	getUserbyId: function(key) {
					 return this.userDb.Get(key);
				 },
	addUsertoDb: function(key,user) {
					 user.uid = key;
					 this.userDb.Set(key,user);
				 },
	getAllUserFromDb: function() {
						  var list = new Array();  
						  for(var i in this.userDb) {
							  var item = this.userDb.Get(i);
							  if(typeof item === 'function' || item.uid === imConnection.uid) {
								  continue;
							  }
							  list.push(item);
						  }
						  return list;
					  },
	getMessageBykey: function(key) {
						 return this.msgDb.Get(key);
					 },
	addMessagetoDb: function(key,msg) {
						var msgs = this.msgDb.Get(key);
						if(!Array.isArray(msgs)) {
							msgs = [];
						}
						if(!Array.isArray(msg)) {
							msgs = [].concat(msg).concat(msgs);    
						}else {
							msgs = msgs.concat(msg);    
						}
						this.msgDb.Set(key,msgs);
					},
	addGroupInfoToDb: function(groupinfo) {
						  if(Array.isArray(groupinfo)) {
							  for(var i in groupinfo) {
								  var item = groupinfo[i];
								  this.groupDb.Set(item.group_id,item);
							  }
						  }else {
							  this.groupDb.Set(groupinfo.group_id,groupinfo);
						  }
					  },
	findGroupInfoById:function(id) {
						  return this.groupDb.Get(id);
					  },
	getAllGroupList:function() {
						var list = new Array();  
						for(var i in this.groupDb) {
							var item = this.groupDb.Get(i);
							if(typeof item === 'function') {
								continue;
							}
							list.push(item);
						}
						return list;
					}
};

//定义的一些常量以及枚举
var DD_MESSAGE_IMAGE_PREFIX = "&$#@~^@[{:"
var DD_MESSAGE_IMAGE_SUFFIX = ":}]&$~@#@"

var UserStatType = {
	USER_STATUS_ONLINE : 1,
	USER_STATUS_OFFLINE : 2,
	USER_STATUS_LEAVE : 3
};

var ServiceID = {
	SID_LOGIN : 1,
	SID_BUDDY_LIST : 2,
	SID_MSG : 3,
	SID_GROUP : 4,
	SID_FILE : 5,
	SID_SWITCH_SERVICE : 6,
	SID_OTHER : 7,
	SID_INTERNAL : 8
};

var BuddyListCmdID = {
	CID_BUDDY_LIST_RECENT_CONTACT_SESSION_REQUEST : 513,
	CID_BUDDY_LIST_RECENT_CONTACT_SESSION_RESPONSE : 514,
	CID_BUDDY_LIST_STATUS_NOTIFY : 515,
	CID_BUDDY_LIST_USER_INFO_REQUEST : 516,
	CID_BUDDY_LIST_USER_INFO_RESPONSE : 517,
	CID_BUDDY_LIST_REMOVE_SESSION_REQ : 518,
	CID_BUDDY_LIST_REMOVE_SESSION_RES : 519,
	CID_BUDDY_LIST_ALL_USER_REQUEST : 520,
	CID_BUDDY_LIST_ALL_USER_RESPONSE : 521,
	CID_BUDDY_LIST_USERS_STATUS_REQUEST : 522,
	CID_BUDDY_LIST_USERS_STATUS_RESPONSE : 523,
	CID_BUDDY_LIST_CHANGE_AVATAR_REQUEST : 524,
	CID_BUDDY_LIST_CHANGE_AVATAR_RESPONSE : 525,
	CID_BUDDY_LIST_PC_LOGIN_STATUS_NOTIFY : 526,
	CID_BUDDY_LIST_REMOVE_SESSION_NOTIFY : 527,
	CID_BUDDY_LIST_DEPARTMENT_REQUEST : 528,
	CID_BUDDY_LIST_DEPARTMENT_RESPONSE : 529,
	CID_BUDDY_LIST_AVATAR_CHANGED_NOTIFY : 530,
	CID_BUDDY_LIST_CHANGE_SIGN_INFO_REQUEST :531,
	CID_BUDDY_LIST_CHANGE_SIGN_INFO_RESPONSE : 532,
	CID_BUDDY_LIST_SIGN_INFO_CHANGED_NOTIFY : 533
};

var CmdID = {
	HEARTBEAT : 1,
	LOGIN_REQ_USERLOGIN : 3,
	LOGIN_RES_USERLOGIN : 4,
	CID_LOGIN_REQ_LOGINOUT : 261,
	CID_LOGIN_RES_LOGINOUT : 262,
	CID_LOGIN_KICK_USER : 263,
	CID_LOGIN_REQ_DEVICETOKEN : 264,
	CID_LOGIN_RES_DEVICETOKEN : 265,
	CID_LOGIN_REQ_KICKPCCLIENT : 266,
	CID_LOGIN_RES_KICKPCCLIENT : 267,
	CID_LOGIN_REQ_PUSH_SHIELD : 268,
	CID_LOGIN_RES_PUSH_SHIELD : 269,
	CID_LOGIN_REQ_QUERY_PUSH_SHIELD : 270,
	CID_LOGIN_RES_QUERY_PUSH_SHIELD : 271,
	MOVE_REQ:11,
	MAZE_RES:12,
	MAZE_MOVE_RES:13,
};


var MessageCmdID = {
	CID_MSG_DATA : 769,
	CID_MSG_DATA_ACK : 770,
	CID_MSG_READ_ACK : 771,
	CID_MSG_READ_NOTIFY : 772,
	CID_MSG_TIME_REQUEST : 773,
	CID_MSG_TIME_RESPONSE : 774,
	CID_MSG_UNREAD_CNT_REQUEST : 775,
	CID_MSG_UNREAD_CNT_RESPONSE : 776,
	CID_MSG_LIST_REQUEST : 777,
	CID_MSG_LIST_RESPONSE : 778,
	CID_MSG_GET_LATEST_MSG_ID_REQ : 779,
	CID_MSG_GET_LATEST_MSG_ID_RSP : 780,
	CID_MSG_GET_BY_MSG_ID_REQ : 781,
	CID_MSG_GET_BY_MSG_ID_RES : 782
};

var SessionType = {
	SESSION_TYPE_SINGLE : 1,
	SESSION_TYPE_GROUP : 2
};


var UserStatType = {
	USER_STATUS_ONLINE : 1,
	USER_STATUS_OFFLINE : 2,
    USER_STATUS_LEAVE : 3
};

var MsgType = {
	MSG_TYPE_SINGLE_TEXT : 1,
	MSG_TYPE_SINGLE_AUDIO : 2,
	MSG_TYPE_GROUP_TEXT : 17,
	MSG_TYPE_GROUP_AUDIO : 18
};

var ResultType = {
	REFUSE_REASON_NONE : 0,
	REFUSE_REASON_NO_MSG_SERVER : 1,
	REFUSE_REASON_MSG_SERVER_FULL : 2,
	REFUSE_REASON_NO_DB_SERVER : 3,
	REFUSE_REASON_NO_LOGIN_SERVER : 4,
	REFUSE_REASON_NO_ROUTE_SERVER : 5,
	REFUSE_REASON_DB_VALIDATE_FAILED : 6,
	REFUSE_REASON_VERSION_TOO_OLD : 7
};

var GroupCmdID = {
	CID_GROUP_NORMAL_LIST_REQUEST : 1025,
	CID_GROUP_NORMAL_LIST_RESPONSE : 1026,
	CID_GROUP_INFO_REQUEST : 1027,
	CID_GROUP_INFO_RESPONSE : 1028,
	CID_GROUP_CREATE_REQUEST : 1029,
	CID_GROUP_CREATE_RESPONSE : 1030,
	CID_GROUP_CHANGE_MEMBER_REQUEST : 1031,
	CID_GROUP_CHANGE_MEMBER_RESPONSE : 1032,
	CID_GROUP_SHIELD_GROUP_REQUEST : 1033,
	CID_GROUP_SHIELD_GROUP_RESPONSE : 1034,
	CID_GROUP_CHANGE_MEMBER_NOTIFY : 1035
};

var OtherCmdID = {
  CID_OTHER_HEARTBEAT : 1793,
  CID_OTHER_STOP_RECV_PACKET : 1794,
  CID_OTHER_VALIDATE_REQ : 1795,
  CID_OTHER_VALIDATE_RSP : 1796,
  CID_OTHER_GET_DEVICE_TOKEN_REQ : 1797,
  CID_OTHER_GET_DEVICE_TOKEN_RSP : 1798,
  CID_OTHER_ROLE_SET : 1799,
  CID_OTHER_ONLINE_USER_INFO : 1800,
  CID_OTHER_MSG_SERV_INFO : 1801,
  CID_OTHER_USER_STATUS_UPDATE : 1802,
  CID_OTHER_USER_CNT_UPDATE : 1803,
  CID_OTHER_SERVER_KICK_USER : 1805,
  CID_OTHER_LOGIN_STATUS_NOTIFY : 1806,
  CID_OTHER_PUSH_TO_USER_REQ : 1807,
  CID_OTHER_PUSH_TO_USER_RSP : 1808,
  CID_OTHER_GET_SHIELD_REQ : 1809,
  CID_OTHER_GET_SHIELD_RSP : 1810,
  CID_OTHER_FILE_TRANSFER_REQ : 1841,
  CID_OTHER_FILE_TRANSFER_RSP : 1842,
  CID_OTHER_FILE_SERVER_IP_REQ : 1843,
  CID_OTHER_FILE_SERVER_IP_RSP : 1844
};
