'use strict';
var fs = require('fs');

function txt2arr(txt){
	var arr = [];
	var file = fs.readFileSync(txt, {
		encoding: 'utf-8'
	});
	var lines = file.split('\n');
		
	lines.forEach(function(line){
		var item = line.split('=');
		arr.push(item[0].trim());
		arr.push(item[1].trim());
	});
	return arr;
}

function arr2txt(data, file){
	var arr = [];
	for(var i = 0, len = data.length; i < len-1; i += 2){
		arr.push(data[i] + '=' + data[i + 1])
	}
	var txt = arr.join('\n');
	fs.writeFile(file, txt);
}
var i18nArr = txt2arr('./messages_zh_CN.properties');
var newI18nArr = [];
module.exports = function(content, file, conf){
	var conf = conf || {};
	conf.i18nFileName = conf.i18nFileName||'i18n';
	if(file.isHtmlLike){
		var reg = /__\(([^\)]*)\)/ig;
		var text;

		content = content.replace(reg, function(m, $1){
			var key = $1.trim();
			key = escape(key).replace(/%/g, '\\');
			var isInI18nArr = i18nArr.indexOf(key);
			var isInNewI18nArr = newI18nArr.indexOf(key);
			if(isInI18nArr > 0){
				text = '<@spring.messageText "' + i18nArr[isInI18nArr - 1] + '" "' + $1 +'"/>';
			}else if(isInNewI18nArr > 0){
				text = '<@spring.messageText "' + newI18nArr[isInNewI18nArr - 1] + '" "' + $1 +'"/>';
			}else{
				var randomStr = Math.random().toString(36).substr(10);
				var pathArr = file.subpathNoExt.split('/');
				var fileName = pathArr[pathArr.length - 1];
				console.log(randomStr);
				var t = fileName + '.text' + +new Date + '.' + randomStr;
				newI18nArr.push(t);
				newI18nArr.push(key);
				text = '<@spring.messageText "' + t + '" "' + $1 + '"/>';
			}
			return text;
		});
	}
	arr2txt(newI18nArr, './aa.txt');
	return content;
};