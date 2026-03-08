---
title: "Nginx配置文件"
description: "Nginx Nginx 是高性能的 HTTP 和反向代理的web服务器，处理高并发能力是十分强大的，能经受高负 载的考验,有报告表明能支持高达 50,000 个并发连接数。 其特点是占有内存少，并发能力强，事实上nginx的并发能力确实在同"
pubDatetime: 2023-05-11T08:23:44Z
tags:
  - nginx
draft: false
---

# Nginx

[Nginx](https://nginx.org/en/) 是高性能的 HTTP 和反向代理的web服务器，处理高并发能力是十分强大的，能经受高负
载的考验,有报告表明能支持高达 50,000 个并发连接数。

其特点是占有内存少，并发能力强，事实上nginx的并发能力确实在同类型的网页服务器中表现较好，中国大陆使用nginx网站用户有：百度、京东、新浪、网易、腾讯、淘宝等。

# 配置文件

## 结构

配置文件nginx.conf位于其安装目录的conf目录下。nginx.conf由多个块组成，最外面的块是main，main包含Events和HTTP，HTTP包含upstream和多个Server，Server又包含多个location。

- main（全局设置）
- server（主机设置）
- upstream（负载均衡设置）
- location（URL匹配特定位置的设置）

![](https://pic.lamper.top/wp/2023/05/nginxjieg.webp)

## 详解

不那么详解的详解，后续补充

```conf
user nginx;

#user表示nginx的工作进程，表示哪个用户维护，默认为nobody
#如果定义两个，第一个表示用户，第二个表示用户组
#user  nobody;
#进程个数，通常参考服务器的cpu个数来设置进程数，auto则为自动设置
worker_processes  1;

#设置日志错误级别，第一个默认为error
#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#记录nginx的pid信息
#pid        logs/nginx.pid;

#工作进程最大连接数，如果并发量比较高，可将数值放大
events {
    worker_connections  1024;
}

http {
    #实现引用其它的配置文件
    include       mime.types;
    default_type  application/octet-stream;

    #自定义日志格式
    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #指定自定义的日志格式
    #access_log  logs/access.log  main;

    #零拷贝
    sendfile        on;
    #打开可减少网络消耗，缓存
    tcp_nopush     on;
    #提高包的发送速率
    tcp_nodelay    on;

    #keepalive_timeout  0;
    #65s内可以发送100次请求
    keepalive_timeout  65;
    keepalive_request  100;

    #压缩，还可以定义哪些文件，文件大小开启压缩
    #gzip  on;

    # 访问网站，就是访问网站中server中定义的信息，多个网站可配置多个server
    server {
        #网站监听的端口，默认80 docker部署的话80就是容器中的80端口。但是使用docker就不用配置多个。还可以使用ip:端口。
        listen       80;
        #指定域名，可配置多个
        server_name  cngraph.com;

        # 字符集utf-8
        #charset koi8-r;
        # 日志路径，和上面的作用域不同
        #access_log  logs/host.access.log  main;

        # 访问的文件资源路径，根据部署项目自行修改
        location / {
            root   /dist;
			#try_files $uri /index.html; #解决路由重定向跳转 404 页面配置
            #默认在自定义的目录去找指定的文件，这里是找index.html文件。如果是动态的网站，还需加上index.php
            index  index.html index.htm;
        }

        #默认会去找一个nginx的404页面，可以自己写一个
        error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        #防盗链
        location ~* \.(jpg|png|gif) {
                  valid_referers none blocked cngraph.com 43.138.13.202;
                  root /web/grapherweb/dist/static/img/;
                  if ($invalid_referer) {
                        return 403;
                  }
        }

        #重定向

    }

    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}
```

未完待续！如有错误，欢迎留言指正。
