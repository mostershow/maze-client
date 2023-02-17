(function($) {
	jQuery.DataEncrypt = function() {
		//aes加密
		this.aesEncryptText=function(text) {
			try {
				var data = padText(CryptoJS.enc.Utf8.parse(text), getStringLength(text));
				console.log(data);
				var key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				var iv = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				var encrypted = CryptoJS.AES.encrypt(data, key, {
					iv: iv,
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.NoPadding
				});
				text = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
				// console.log(text);
				// // var key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				// // var iv  = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				// text = CryptoJS.AES.decrypt(text, key, {iv:iv, mode: CryptoJS.mode.ECB,  padding: CryptoJS.pad.ZeroPadding});
				// if(text.words[text.words.length - 2] == 0) {
				// 	text.words[text.words.length - 1] = 0;
				// 	}
				// console.log(text);
				// //text.words[47] = 0;
				// text = CryptoJS.enc.Utf8.stringify(text);
			} catch(err) {
				text = '';
			}
			return text;
		}

		//aes解密
		this.aesDecryptText=function(data) {
			var typeString = typeof data;
			//console.log(typeString);
			if(typeof data != 'string') {
				var msg_data = data.buffer.slice(data.offset, data.limit);
				var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(msg_data)));
				data = Base64.decode(base64String);
			}
			var text = '';
			try {
				var key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				var iv = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
				text = CryptoJS.AES.decrypt(data, key, {
					iv: iv,
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.NoPadding
				});
				if(text.words[text.words.length - 2] == 0) {
					text.words[text.words.length - 1] = 0;
				}
				text = CryptoJS.enc.Utf8.stringify(text);
			} catch(err) {
				text = '';
			}
			return text;
		}

		//给准备加密的数据补零
		this.padText=function(source, count) {
			var size = 4;
			var x = source.words.length % size;
			if(x > 0) {
				var padLength = size - x;
				//var end = count * 3;
				for(var i = 0; i < padLength - 1; i++) {
					source.words.push(0);
				}
				source.words.push(count);
			}

			source.sigBytes = 4 * source.words.length;
			return source;
		}

		this.getStringLength=function(str) {
			///<summary>获得字符串实际长度，中文3，英文1</summary> utf8
			///<param name="str">要获得长度的字符串</param>
			var realLength = 0,
				len = str.length,
				charCode = -1;
			for(var i = 0; i < len; i++) {

				charCode = str.charCodeAt(i);
				if(charCode >= 0 && charCode <= 128) realLength += 1;
				else realLength += 3;
				//console.log(i  + '   :' + realLength);
			}
			return realLength;
		};

		return {
			aesEncryptText: this.aesEncryptText,
			aesDecryptText: this.aesDecryptText,
			padText: this.padText,
			getStringLength: this.getStringLength
		};
	}
})($);