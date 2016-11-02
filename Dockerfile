#FROM 指令指定基础镜像
#比较常用的基础镜像有ubuntu，centos。这里使用了一个nginx镜像
FROM nginx

#MAINTAINER指令用于将镜像制作者相关的信息写入到镜像中
#您可以将您的信息填入name以及email
MAINTAINER v4if <karma_wjc@yeah.net>

#COPY指令复制主机的文件到镜像中 （在这里当前路径就是repo根目录）
#将项目的所有文件加入到Nginx静态资源目录里
COPY . /usr/share/nginx/html

#EXPOSE：指定容器监听的端口
EXPOSE 80
