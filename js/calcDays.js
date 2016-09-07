/*
* @Author: v4if
* @Date:   2016-09-05 09:41:17
* @Last Modified by:   v4if
* @Last Modified time: 2016-09-07 10:55:38
*/

function buildDateData() {
	// 开始时间戳
	var f_time = "2014-10-19 23:59:59";
	var b_time = Date.parse(new Date(f_time));
	// 当前时间戳
	var e_time = Date.parse(new Date());
	var delta_s = (e_time - b_time)/1000;
	var days = Math.floor(delta_s/(24*60*60));
	var left = delta_s%(24*60*60);
	var hours = Math.floor(left/(60*60));
	left = left%(60*60);
	var minutes = Math.floor(left/60);
	var seconds = Math.floor(left%60);

	var time_stamp = days + "天" + hours + "时" +  minutes + "分" + seconds + "秒";
	updateDate(time_stamp);
	// console.log(time_stamp);
}

function updateDate(time_stamp) {
	var heading_time = document.getElementById("heading_time");
	heading_time.innerHTML = time_stamp;
}
