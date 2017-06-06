FROM php:7.0-apache
MAINTAINER Julien Brêchet <julien.brechet@heig-vd.ch>

RUN apt-get update && \
	apt-get install -y vim
	
COPY src/ /var/www/html/
