/*
* @Author: v4if
* @Date:   2016-09-01 09:41:17
* @Last Modified by:   v4if
* @Last Modified time: 2016-11-02 16:16:25
*/

xhrRequest();

// ==========  For xhr Request  ==========
function getInstanceOfXHR() {
	var xhr;
	try {xhr = new XMLHttpRequest();}
	catch(e) {
		var IEXHRVers =["Msxml3.XMLHTTP","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
		for (var i=0,len=IEXHRVers.length;i< len;i++) {
			try {xhr = new ActiveXObject(IEXHRVers[i]);}
			catch(e) {continue;}
		}
	}
	return xhr;
}
function xhrRequest() {
	var xhr = getInstanceOfXHR();
	xhr.onload = function () {            
	  parserGeoJSON(xhr.responseText);
	};
	try {
	  xhr.open("get", "js/mapbox_feature_geojson.js", true);
	  xhr.send();
	}
	catch (ex) {
	  console.log(ex.message);
	}
}  

// For Parser
var parserNodes = [];
var geoText = "";
var index = -1;
var currentChar = "";
var token = "";
var tokenType = {
	Integer: 'Integer',
	Word: 'Word',
	LParen: 'LParen',				//大括号 {}
	RParen: 'RParen',
	Q_LParen: 'Q_LParen',
	Q_RParen: 'Q_RParen',		//方括号	[]
	Equal: 'Equal',					//=
	Quotes: 'Quotes',       //""
	Colon: 'Colon',         //:
	Comma: 'Comma',         //,
	CLRF: 'CLRF', 					//换行
	TAB: 'TAB',  						//TAB
	Strip: 'Strip',					//-
	ZHcn: 'ZHcn',						//汉字
	EOF: 'EOF',							//文件结束	
	NONE: 'NONE'						//类型不识别
};
// 解析
function parserGeoJSON(json) {
	geoText = json;
	if (isEmpty(geoText) != 0) {
		return;
	}
	// console.log(geoText);

	advance();
	token = nextToken();
	while(token.type != tokenType.EOF) {
		if (token.value == 'FeatureCollection') {
			parserFeature();
			break;
		}
		token = nextToken();
	}

	dump(parserNodes);

	buildLocationList(parserNodes);
}
// 按照格式解析类型
function eat(what, type, value) {
	if (what == 0) {
		// by Type
		while(token.type != tokenType.EOF) {
			
			if (token.type == type) {
				return 0;
			}
			token = nextToken();
		}
	} else if (what == 1) {
		// by Value
		while(token.type != tokenType.EOF) {
			
			if (token.value == value) {
				return 0;
			}
			token = nextToken();
		}
	}
	
	error();
}
// 读取解析的数据值
function getParserValue() {
	var result = [];

	eat(0, tokenType.Quotes);
	eat(0, tokenType.Colon);
	eat(0, tokenType.Quotes);

	// get value
	token = nextToken();
	while(token.type != tokenType.EOF) {
		if (token.type == tokenType.Quotes) {
			break;
		}
		result.push(token.value);
		token = nextToken();
	}

	return result.join("");
}
function getParserInteger() {
	eat(0, tokenType.Integer);
	return token.value;
}
// 获得解析数据的实例
function getInstanceOfParserNode(title, details, desc, type, coordinate) {
	this.title = title;
	this.details = details;
	this.desc = desc;
	this.type = type;
	this.coordinate = coordinate;
}
// dump parserNodes
function dump(obj) {
    var out = '';
    for (var i in obj) {
        if (obj[i]['type'] == 'Point') {
        	out += i + ": " + "[ title: " + obj[i]['title'] + " , details: " + obj[i]['details'] + " , desc: " + obj[i]['desc'] + " , type: " + obj[i]['type'] + " coordinate:[" + obj[i]['coordinate'].lng + ", " + obj[i]['coordinate'].lat + "] ]" + "\n";
        } else if (obj[i]['type'] == 'LineString') {
        	out += i + ": " + "[ title: " + obj[i]['title'] + " , desc: " + obj[i]['desc'] + " , type: " + obj[i]['type'] + " ]" + "\n";
        }
    }
    console.log(out);

    // var pre = document.createElement('pre');
    // pre.innerHTML = out;
    // document.body.appendChild(pre);
}
// lookForward 向前查找，判断结束条件 left先于right找到为期望结果
function lookForwardFor(left, right) {
	// 如果 ] 先于 { 找到，则意味着解析结束，返回值-1
	token = nextToken();
	while(token.type != tokenType.EOF && token.type != left && token.type != right) {
		token = nextToken();
	}

	if (token.type == tokenType.EOF) {
		return -1;
	} else if (token.type == left) {
		// 指针回退，继续解析
		if (index >= 0) {
			index = index -1;
		} else {
			index = -1;
		}
		return 0;
	} else if (token.type == right) {
		return -1;
	}
}
// 解析地图的Feature Layer数据
function parserFeature() {
	var i = 0;
	token = nextToken();
	while(token.type != tokenType.EOF) {
		if (token.value == 'features') {
			eat(0, tokenType.Q_LParen);
			while(token.type != tokenType.EOF) {
				eat(0, tokenType.LParen);

				eat(1, null, 'type');
				eat(1, null, 'Feature');

				{
					// parser for properties
					eat(1, null, 'properties');
					eat(0, tokenType.LParen);
					eat(1, null, 'title');
					var title = getParserValue();
					eat(1, null, 'details');
					var details = getParserValue();
					eat(1, null, 'description');
					var desc = getParserValue();
					eat(0, tokenType.RParen);
				}

				{
					// parser for geometry
					eat(1, null, 'geometry');
					eat(0, tokenType.LParen);

					// parser for coordinates
					eat(0, tokenType.Q_LParen);
					var coordinate = {};
					if (lookForwardFor(tokenType.Integer, tokenType.Q_LParen) == 0) {
						var lng = getParserInteger();
						eat(0, tokenType.Comma);
						var lat = getParserInteger();
						coordinate = {
							"lng": lng,
							"lat": lat
						};
					}
					eat(0, tokenType.Q_RParen);

					eat(1, null, 'type');
					var nodeType = getParserValue();

					eat(0, tokenType.RParen);
				}

				eat(0, tokenType.RParen);

				i = i + 1;
				parserNodes.push(new getInstanceOfParserNode(title, details, desc, nodeType, coordinate));

				if (lookForwardFor(tokenType.LParen, tokenType.Q_RParen) == -1) {
					break;
				}
			}

			eat(0, tokenType.Q_RParen);
			console.log("has parser " + i + " nodes");
			break;
		}
		token = nextToken();
	}
}
function error() {
	console.log("Parser Error！");
}
// 判断是否为空
function isEmpty(text) {
	if (text == " ") {
		return -1;
	} else {
		return 0;
	}
}
// 判断是否文件结尾
function isEOF(ch) {
	if (ch == -1) {
		return 0;
	} else {
		return -1;
	}
}
// 判断是否为数字
function isDigit(ch) {
	if (ch >= '0' && ch <= '9') {
		return 0;
	} else {
		return -1;
	}
}
// 判断是否为字母
function isAlpha(ch) {
	if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
		return 0;
	} else {
		return -1;
	}
}
// 判断是否是汉字
function isZHcn(ch) {
	var unicode = ch.charCodeAt();
	if (unicode >= 0x4e00 && unicode <= 0x9fa5) {
		return 0;
	} else {
		return -1;
	}
}
// 读取下一个字符
function advance() {
	index = index + 1;
	// 是否读到文件结束
	if (index > geoText.length) {
		currentChar = -1; 
	} else {
		currentChar = geoText.charAt(index);
	}
}
// 数字
function getInteger() {
	var result = [];
	while(isEmpty(currentChar) == 0 && (isDigit(currentChar) == 0 || currentChar == '.')) {
		result.push(currentChar);
		advance();
	} 
	return result.join("");
}
// 单词
function getWord() {
	var result = [];
	while(isEmpty(currentChar) == 0 && isAlpha(currentChar) == 0) {
		result.push(currentChar);
		advance();
	} 
	return result.join('');
}
// 包装Token {type, value}
function Token(type, value) {
	return {
		"type": type,
		"value": value
	}
}
// 提取单词的token
function nextToken() {
	while(isEOF(currentChar) != 0) {
		// 后面数据读取需要带有原始空格
		// if (isEmpty(currentChar) != 0) {
		// 	advance();
		// 	continue;
		// }

		// 数字
		if (isDigit(currentChar) == 0) {
			return Token(tokenType.Integer, getInteger());
		} else if (isAlpha(currentChar) == 0) {
			// 单词
			return Token(tokenType.Word, getWord());
		} else if (currentChar == '{') {
			advance();
			return Token(tokenType.LParen, '{');
		} else if (currentChar == '}') {
			advance();
			return Token(tokenType.RParen, '}');
		} else if (currentChar == '[') {
			advance();
			return Token(tokenType.Q_LParen, '[');
		} else if (currentChar == ']') {
			advance();
			return Token(tokenType.Q_RParen, ']');
		} else if (currentChar == '=') {
			advance();
			return Token(tokenType.Equal, '=');
		} else if (currentChar == '"') {
			advance();
			return Token(tokenType.Quotes, '"');
		} else if (currentChar == ':') {
			advance();
			return Token(tokenType.Colon, ':');
		} else if (currentChar == ',') {
			advance();
			return Token(tokenType.Comma, ',');
		} else if (currentChar == '	') {
			advance();
			return Token(tokenType.TAB, 'TAB');
		} else if (currentChar == '-') {
			advance();
			return Token(tokenType.Strip, '-');
		}
		else if (currentChar == '\n' || currentChar == '\r\n') {
			advance();
			return Token(tokenType.CLRF, 'CLRF');
		}
		else {
			var ch = currentChar;
			advance();
			return Token(tokenType.NONE, ch);
		}
	}

	return Token(tokenType.EOF, 'EOF');
}

// ========== For map interactive ==========
// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}
// 将解析的Nodes输出
function buildLocationList(data) {
  // Iterate through the list of stores
	for (i = 0; i < data.length; i++) {
  	var currentFeature = data[i];
  	
  	if (currentFeature.type == 'Point') {
  			// Select the listing container in the HTML and append a div
  		  // with the class 'item' for each store
  			var listings = document.getElementById('listings');
  			var listing = listings.appendChild(document.createElement('div'));
  			listing.className = 'item';
  		  listing.id = "listing-" + i;

  			// Create a new link with the class 'title' for each store
  			// and fill it with the store address
  			var link = listing.appendChild(document.createElement('a'));
  			link.href = '#';
  			link.className = 'title';
  			link.dataPosition = i;
  			link.innerHTML = currentFeature.title;

  			addEventListeners(link, currentFeature);

  			// Create a new div with the class 'details' for each store
  			// and fill it with the city and phone number
  			var details = listing.appendChild(document.createElement('div'));
  			details.innerHTML = currentFeature.details;
  	}
  }

	buildPoemData();
	buildTipData();
}
function buildPoemData() {
	var i = parserNodes.length;
	// 添加的诗的内容
	var listings = document.getElementById('listings');
	var listing = listings.appendChild(document.createElement('div'));
	listing.className = 'item';
  listing.id = "listing-" + i;

  var poemStr = '#include &lt;stdio.h&gt;<br> \
		void main()<br> \
		{<br> \
		&nbsp;&nbsp; double world;<br> \
		&nbsp;&nbsp; unsigned letter;<br> \
		&nbsp;&nbsp; short stay;<br> \
		&nbsp;&nbsp; long memories;<br> \
		&nbsp;&nbsp; printf("I miss you.\n");<br> \
		}<br>';
	var chStr = '两个人的世界，一封没有署名的信，短暂的重逢后，留下的只是回忆，我想你，我爱的人';
	// Create a new div with the class 'details' for each store
	// and fill it with the city and phone number
	var details = listing.appendChild(document.createElement('div'));
	details.innerHTML = poemStr + chStr;
}
function buildTipData() {
	var i = parserNodes.length + 1;
	// 添加的tip
	var listings = document.getElementById('listings');
	var listing = listings.appendChild(document.createElement('div'));
	listing.className = 'item';
  listing.id = "listing-" + i;


	// Create a new div with the class 'details' for each store
	// and fill it with the city and phone number
	var details = listing.appendChild(document.createElement('div'));
	details.innerHTML = 'Tips：<br>地图上的图标和连线可以点击的哦～';
	details.innerHTML +=  '<br><i class="iconfont">&#xe61e;</i>&nbsp;All by <a href="https://v4if.github.io">v4if</a>'
}
// For event listeners
function addEventListeners(element, currentFeature) {
	// Add an event listener for the links in the sidebar listing
	element.addEventListener('click', function(e){
	    // 1. Fly to the point associated with the clicked link
	    flyToCoordinate(currentFeature);
	    // // 2. Close all other popups and display popup for clicked store
	    createPopUp(currentFeature);
	    // 3. Highlight listing in sidebar (and remove highlight for all other listings)
	    var activeItem = document.getElementsByClassName('active');
	    if (activeItem[0]) {
	       activeItem[0].classList.remove('active');
	    }
	    this.parentNode.classList.add('active');
	});
}
// For map interactive
function flyToCoordinate(currentFeature) {
	map.panTo(currentFeature.coordinate, true);
}
// 创建弹出图层
function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  // Check if there is already a popup on the map and if so, remove it
  if (popUps[0]) popUps[0].remove();

  var popup = L.popup()
		.setLatLng(currentFeature.coordinate)
		.setContent(currentFeature.desc)
		.openOn(map);
}
