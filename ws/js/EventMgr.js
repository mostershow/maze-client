(function($) {
	jQuery.EventMgr = function() {
		var eventMap = {};

		this.addEvent=function(event, callback) {
			if(eventMap[event]) throw new Error(event + "事件已存在！");
			eventMap[event] = callback;
		}

		this.removeEvent=function(event) {
			delete eventMap[event];
		}

		this.assignedEvent=function(event, data) {
			if(eventMap[event]) {
				eventMap[event](data);
			} else {
				console.log(event + "消息未处理！  data:"+JSON.stringify(data))
			}
		}
		return {
			eventMap:eventMap,
			addEvent:this.addEvent,
			removeEvent:this.removeEvent,
			assignedEvent:this.assignedEvent
		};
	}
})($);