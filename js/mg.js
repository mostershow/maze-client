/*
Sansi Maze
- A maze game based on JavaScript.

Copyright (c) 2008 oldJ, Sansi.Org
Author: oldj.wu@gmail.com, http://oldj.net/
License: LGPL

* Last Update: 2010-11-30 15:04:40

You can get the last version by SVN:
svn checkout http://sansi.googlecode.com/svn/trunk/ sansi-read-only
*/

// 迷宫类
function MG(ob, w, h) {
	this.ob = document.getElementById(ob);
	this.w = w || 20;
	this.h = h || 20;
	this.grid_size = 20;		// 迷宫格子宽度，暂时没有用
	this.grid_str = "";		// 迷宫的字符串形式，暂时没有用
	this.grids = [];		// 迷宫每个格子的状态，数值为[0, 15]
	this.grid_ob = [];		// 迷宫各格子对应的DOM元素
	this.is_moved = false;		// 用户是否按下过方向键
	this.mark_history = false;	// 是否将走过的格子用红色标出
	this.mark_history2 = false;	// 是否标出最短路径，暂时没有用
	this.chkCanvasTagSupport();	// 检查是否支持Canvas标签
	this.is_mine = false;
	
}
function serverCreateMaze(w, h,userId,roomId) {
	var data = {};

	data.userId = userId;
	data.roomId = roomId;
	data.width = w;
	data.height = h;

	return new Promise((resolve, reject) => {
		$.ajax({
			url: 'http://127.0.0.1:8080/init',
			type: 'post',
			contentType: 'application/json;charset=UTF-8',
			data: JSON.stringify(data),
			datatype: "json",//"xml", "html", "script", "json", "jsonp", "text".           
			success: function (data) {
				resolve(data.mg.grids)
				// console.log(data.mg.grids);
				// return data.mg.grids;
			}
		});
	})

}
function serverMove(d) {
	var data = {};

	data.userId = '1';
	data.direction = d;
	return new Promise((resolve, reject) => {
		$.ajax({
			url: 'http://127.0.0.1:8080/move',
			type: 'post',
			contentType: 'application/json;charset=UTF-8',
			data: JSON.stringify(data),
			datatype: "json",//"xml", "html", "script", "json", "jsonp", "text".           
			success: function (data) {
				resolve(data)
				// console.log(data.mg.grids);
				// return data.mg.grids;
			}
		});
	})
}
function randomString(e) {    
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}
MG.prototype = {
	
	init: function () {
		// 初始化迷宫地图
		var x, y;
		this.grids = [];
		this.grid_ob = [];
		this.grid_str = "";
		this.grids[this.w * this.h - 1] = 0;
		/*for (y = 0; y < this.h; y ++)
			for (x = 0; x < this.w; x ++) {
				//this.grids.push(Math.floor(Math.random() * 16).toString(16));
				this.grids.push(0);
			}*/
		//this.grid_str = this.grids.join("");
		return this;
	},
	set: function (sets) {
		// 设置迷宫的宽度与高度
		if (sets.width) this.w = sets.width;
		if (sets.height) this.h = sets.height;
		this.userId = sets.userId;
		this.roomId = sets.roomId;
		return this;
	},
	create: async function () {
		this.grids = await serverCreateMaze(this.w, this.h,this.userId,this.roomId);
		return this;
	},
	chkCanvasTagSupport: function () {
		// 检查是否支持Canvas标签
		this.canvas = document.createElement("canvas");
		this.is_canvas_valid = !!this.canvas.getContext;
	},
	clear: function () {
		// 清除迷宫上的DOM元素
		this.canvas = null;
		while (this.ob.childNodes[0])
			this.ob.removeChild(this.ob.childNodes[0]);
		return this;
	},
	show: async function () {
		// 将迷宫从数据转化为DOM元素并显示在页面上
		this.clear();
		if (this.is_canvas_valid) {
			this._showByCanvas();
		} else {
			this._showByDOM();
		}
		this.me = new MG_Me(this);
		return this;
	},
	_showByDOM: function () {
		var tmp_ob, i, grid_ob = this.grid_ob,
			w = this.w,
			h = this.h,
			len = w * h,
			grid_size = this.grid_size,
			grids = this.grids,
			fragement = document.createDocumentFragment();
		this.ob.style.width = grid_size * w + 2 + "px";
		this.ob.style.height = grid_size * h + 2 + "px";

		for (i = 0; i < len; i++) {
			tmp_ob = document.createElement("div");
			tmp_ob.setAttribute("class", "grid");
			tmp_ob.setAttribute("className", "grid");
			tmp_ob.style.width = grid_size + "px";
			tmp_ob.style.height = grid_size + "px";
			tmp_ob.style.left = grid_size * (i % w) + "px";
			tmp_ob.style.top = grid_size * Math.floor(i / w) + "px";

			MG.border(tmp_ob, grids[i]);
			grid_ob.push(tmp_ob);
			fragement.appendChild(tmp_ob);
		}

		tmp_ob.setAttribute("class", "grid mg_finish");
		//tmp_ob.setAttribute("className", "grid mg_finish");
		this.ob.appendChild(fragement);
	},
	_showByCanvas: function () {
		// 使用canvas显示
		var grid_size = this.grid_size,
			grids = this.grids,
			w = grid_size * this.w,
			h = grid_size * this.h;
		this.ob.style.width = w + "px";
		this.ob.style.height = h + "px";
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", w);
		this.canvas.setAttribute("height", h);
		this.ob.appendChild(this.canvas);

		// 在canvas上画图
		var x, y, ix, iy,
			w = this.w,
			h = this.h,
			i, len = w * h,
			ctx = this.canvas.getContext("2d");
		this.ctx = ctx;
		ctx.fillStyle = "#f5f5f5";
		ctx.fillRect(0, 0, w, h);
		for (i = 0; i < len; i++) {
			ix = grid_size * (i % w);
			iy = grid_size * Math.floor(i / w);
			MG.border2(ctx, ix, iy, ix + grid_size, iy + grid_size, grids[i]);
		}
		var finish_img = new Image();
		finish_img.src = "img/finish.gif";
		finish_img.className = "finish-img";
		//this.ctx.drawImage(finish_img, w - this.grid_size + 2, h - this.grid_size + 2);
		this.ob.appendChild(finish_img);
	},
	fillBox: function (grid_i, c) {
		// 将格子 grid_i 涂成颜色 c
		this.ctx.fillStyle = c;
		var x = (grid_i % this.w) * this.grid_size,
			y = Math.floor(grid_i / this.w) * this.grid_size;;;;
		this.ctx.fillRect(x, y, this.grid_size, this.grid_size);

		var v = this.grids[grid_i];
		MG.border2(this.ctx, x, y, x + this.grid_size, y + this.grid_size, v);
	}
};

MG.border = function (ob, v) {
	// MG对象的方法，
	// 根据格子的值显示格子四条边是否可通过
	if (!v) {
		ob.style.backgroundColor = "#666";
		return;
	}
	if (v & 1)
		ob.style.borderTop = "solid 1px #f5f5f5";
	if (v & 2)
		ob.style.borderRight = "solid 1px #f5f5f5";
	if (v & 4)
		ob.style.borderBottom = "solid 1px #f5f5f5";
	if (v & 8)
		ob.style.borderLeft = "solid 1px #f5f5f5";
};
MG.border2 = function (ctx, ix, iy, ix2, iy2, v) {
	// MG对象的方法，Canvas方式
	// 根据格子的值显示格子四条边是否可通过
	if (!v) {
		ctx.fillRect(ix, iy, ix2, iy2);
		return;
	}

	ctx.strokeStyle = "#aaa";
	ctx.lineWidth = 1;
	var _d = function (x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1 + 0.5, y1 + 0.5);
		ctx.lineTo(x2 + 0.5, y2 + 0.5);
		ctx.closePath();
		ctx.stroke();
	};

	if (!(v & 1))
		_d(ix, iy, ix2, iy);
	if (!(v & 2))
		_d(ix2, iy, ix2, iy2);
	if (!(v & 4))
		_d(ix, iy2, ix2, iy2);
	if (!(v & 8))
		_d(ix, iy, ix, iy2);
};


// 走迷宫的小人的类
function MG_Me(mg) {
	this.mg = mg || null;
	this.pos = 0;
	this.history = [0];
	this.history2 = [0];
	this.is_moving = false;
	this.last_move = new Date();
	this.finished = false;
	this.emotions = {
		normal: "img/me.gif",
		happy: "img/me_happy.gif",
		unhappy: "img/me_unhappy.gif",
		surprised: "img/me_surprised.gif",
		tongue: "img/me_tongue.gif"
	};

	if (this.mg) this.init();
}

MG_Me.prototype = {
	init: function (mine) {
		var tmp_ob = document.createElement("div"),
			tmp_img = document.createElement("img"),
			tmp_info = document.createElement("div"),
			tmp_span = document.createElement("p"),
			_this = this;
		tmp_info.setAttribute("class", "inform");
		tmp_info.setAttribute("className", "inform");
		this.inform_box = tmp_info;
		this.inform_span = tmp_span;
		tmp_info.appendChild(tmp_span);
		tmp_ob.appendChild(tmp_info);
		tmp_img.setAttribute("src", "img/me.gif");
		this.me_img = tmp_img;
		tmp_ob.setAttribute("class", "me");
		tmp_ob.setAttribute("className", "me");
		tmp_ob.appendChild(tmp_img);
		tmp_ob.style.width = this.mg.grid_size + "px";
		tmp_ob.style.height = this.mg.grid_size + "px";
		this.ob = tmp_ob;
		this.mg.ob.appendChild(this.ob);
		this.is_mine = mine;
		if (this.mg.is_mine) {
			$.hotkeys.add("up", function () {
				_this.move(0);
			});
			$.hotkeys.add("right", function () {
				_this.move(1);
			});
			$.hotkeys.add("down", function () {
				_this.move(2);
			});
			$.hotkeys.add("left", function () {
				_this.move(3);
			});
			setTimeout(function () {
				if (_this.mg.is_moved) return;
				_this.inform(SANSI_TOY_MSG.keyboard_hint);
			}, 3000);
		}

		this.itvl = setInterval(function () {
			if (!_this.mg.is_moved) return;
			var now = new Date();
			if (now - _this.last_move > 10000) {
				_this.inform(SANSI_TOY_MSG.hello);
				_this.setEmotion("surprised");
			}
		}, 3000);

		this.setMark(1, this.mg.mark_history);
		//this.setMark(2, this.mg.mark_history2);
	},
	move: function (d) {
		var data = {};
		data.direction = d;
		data.userId = this.mg.userId;
		answerMove(data);
		// serverMove(d);
		if (this.is_moving || this.finished) return;
		this.mg.is_moved = true;
		var v = this.mg.grids[this.pos];
		if (v & Math.pow(2, d)) {
			if (d == 0)
				this.moveTo(this.pos - this.mg.w);
			if (d == 1)
				this.moveTo(this.pos + 1);
			if (d == 2)
				this.moveTo(this.pos + this.mg.w);
			if (d == 3)
				this.moveTo(this.pos - 1);
		}
		this.last_move = new Date();
	},
	moveTo: function (p) {
		this.is_moving = true;
		this.inform();
		this.setEmotion("normal");

		this.history.unshift(p);
		if (this.mg.mark_history) {
			if (this.mg.is_canvas_valid) {
				this.mg.fillBox(this.history[0], "#ffcccc");
			} else {
				this.mg.grid_ob[this.history[0]].style.backgroundColor = "#fcc";
			}
		}
		/*if (this.history2[0] == p) {
			this.history2.shift();
		} else {
			if (this.mg.mark_history2)
				this.mg.grid_ob[this.history2[0]].style.backgroundColor = "#f99";
			this.history2.unshift(p);
		}*/
		var x = p % this.mg.w,
			y = Math.floor(p / this.mg.w),
			top = y * this.mg.grid_size + "px",
			left = x * this.mg.grid_size + "px",
			_this = this;

		$(this.ob).animate({
			top: top,
			left: left
		}, 100, "linear", function () {
			_this.pos = p;
			_this.is_moving = false;
			var v = _this.mg.grids[p];
			if (p == _this.mg.grids.length - 1) {
				_this.inform(SANSI_TOY_MSG.win);
				_this.finished = true;
				_this.setEmotion("happy");
				clearInterval(_this.itvl);
			} else if (p != 0 && (v == 1 || v == 2 || v == 4 || v == 8)) {
				_this.inform(SANSI_TOY_MSG.blind_alley);
				_this.setEmotion("unhappy");
			} else if (p == 0) {
				_this.inform(SANSI_TOY_MSG.back_to_the_start);
				_this.setEmotion("surprised");
			}
		});
	},
	inform: function (s) {
		if (s) {
			$(this.inform_span).html(s);
			$(this.inform_box).fadeIn(500);
		} else {
			$(this.inform_box).fadeOut(500);
		}
	},
	setEmotion: function (em) {
		if (this._emotion_str == em) return;
		if (this.emotions[em]) {
			this.me_img.setAttribute("src", this.emotions[em]);
			this._emotion_str = em;
		}
	},
	setMark: function (h, v) {
		var i;
		if (h == 1) {
			this.mg.mark_history = v;
			for (i = 0; i < this.history.length; i++) {
				if (this.mg.is_canvas_valid) {
					this.mg.fillBox(this.history[i], v ? "#ffcccc" : "#f5f5f5");
				} else {
					this.mg.grid_ob[this.history[i]].style.backgroundColor = v ? "#fcc" : "#f5f5f5";
				}
			}
		} else if (h == 2) {
			this.mg.mark_history2 = v;
			for (i = 0; i < this.history2.length; i++) {
				if (this.mg.is_canvas_valid) {
					this.mg.fillBox(this.history2[i], v ? "#ff9999" : "#f5f5f5");
				} else {
					this.mg.grid_ob[this.history2[i]].style.backgroundColor = v ? "#f99" : "#f5f5f5";
				}
			}
		}
	}
};


