# Mapbox 我和她的足迹地图 ![Language](https://img.shields.io/badge/language-html-blue.svg?style=flat-square) ![Language](https://img.shields.io/badge/language-css-blue.svg?style=flat-square) ![Language](https://img.shields.io/badge/language-js-blue.svg?style=flat-square)

灵感来自于知乎的一个回答 @Tony Xu，打算给女朋友的一个惊喜

## 说明
* 地图采用Mapbox
* 基于Web Map的[mapbox.js](https://www.mapbox.com/mapbox.js/api/v2.4.0/)，在去过的城市上面标注足迹，城市之间连线
* 将城市和城市之间的连线数据采用JSON的格式导出，便于更新维护，手撸了一个简单的JSON解释器，去解析每个城市marker的城市名、详细内容、描述、marker的类型和坐标
* 左侧显示在一起的时间统计，和城市列表的导航栏

## 在线预览

[我和她的足迹地图](https://v4if.github.io/mapbox)  

## 部署效果图：

![mapbox](https://github.com/v4if/mapbox/raw/master/687474703a2f2f37786f7438632e636f6d312e7a302e676c622e636c6f7564646e2e636f6d2f323031362d30392d30382d3137323430362e706e67.png)

## 具体实现相关参考

相关技术细节请参考博客文章，详细地址： [程序员能给女朋友做什么特别浪漫的礼物？](https://v4if.github.io/2016/ForBunny/)
