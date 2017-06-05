FROM php:7.0-apache
MAINTAINER Julien Brêchet <julien.brechet@heig-vd.ch>
COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
