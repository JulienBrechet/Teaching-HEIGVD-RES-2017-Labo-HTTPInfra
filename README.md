# RES - Labo-HTTPInfra report
### Authors : Julien Brêchet and Adrien Marco
### Last update : 09.06.2017

## Important !
If you clone the repository, you will probably need to open the file `apache2-foreground` of the reverse-proxy image in Notepad and save it with **UNIX EOL**.

You will need to install `chance.js` and `express.js` in the `src` repository of the express image. You can run those following commands :

	npm install --save chance
	npm install --save express
	npm install express-generator -g

## Step 1: Static HTTP server with apache httpd

### Docker image and Dockerfile
First we need a docker image. In the project repository, we make a new folder `docker-images`. This repository will contain our docker images (the name of this folder isn't important, we could have called it with an another name).

Then we want to choose a php-apache image. We take an image on Docker Hub --> [Official PHP image](https://hub.docker.com/_/php/).

In the `docker-images` repository, we made a new one called `apache-php-image` and in the latter we create the `Dockerfile`. 

In the web page of this image, we can found what we need to add to our Dockerfile to use php. We add :

	FROM php:7.0-apache
	COPY src/ /var/www/html/

The first line means that we use a php:7.0 version. The second line say that we need to create a `src` repository in `apache-php-image`. All files and folders that are in `src` will be copied in the docker image at `/var/www/html/`.<br/>
**Note :** we can call the src repository with the name we want. If we call it `sources` we need to modify the Dockerfile and rename *src* to *sources*.
However we must copy the files of *src* in the php image in the `/var/www/html/` folder. It's because in the default configuration, the html content is in `/var/www/html/`. If we want, we can modify the configuration files and subfiles in `/etc/apache2/` and `/etc/apache2/sites-available/` but we won't do that for this step.

### Nice looking HTML content
Now we want to have a nice looking and responsive template. We choose [a one page bootstrap](https://startbootstrap.com/template-overviews/grayscale/). We modify it a little to remove unnecessary content and now we have a nice web page !

### Building the image
We go in the `apache-php-image` that contains the Dockerfile and we use the command `docker build -t res/apache_php .` to create a docker image with our Dockerfile and named *res/apache_php*.

### Running the container
Then we run a container with the command `docker run -p 9090:80 res/apache_php`. We make a port mapping to listen to the port 9090 of the VM mapped on the port 80 of the *res/apache_php* container.

Now we can go in our web browser (Chrome of course) and tape `192.168.99.100:9090` to access to the html content of our container.

### Images
#### Docker image and Dockerfile
![Dockerfile](/images/Dockerfile.png)

#### View in browser
![Browser view](/images/browser_view.png)

## Step 2: Dynamic HTTP server with express.js

### Docker image and Dockerfile
For this step, we create a new repository for a new docker image. We create the folder `express-image` in `docker-images`.

We want to use node.js in this step to make a dynamic HTTP server. We go on Docker Hub and we choose the [official Node image](https://hub.docker.com/_/node/).<br/>
According to the website of node.js, the current LTS version is *6.10.3*. So we choose to use this version of node.js.

We create the Dockefile with node, we create a source folder called *src* to store files and folders that will be copied in the docker image at `/opt/app` and we need an entry point (we use CMD) to execute the command needed when we start a container whis this image.

#### Dockerfile
![Dockerfile](/images/Dockerfile2.png)

### Creating package.json
In the `src` repository, we use the command `npm init` and we add the parameters of our application (name, version, description, entrypoint, ...) for creating `package.json`. We choose to manage and return an array of some animals, so we name our application ***animals***.

### Chance.js dependency
We want a dependency to `chance.js` for generating random information (String and int) that will be useful to randomize our animals. We use the command `npm install --save chance` (--save because we want to save the dependency). A `node_modules` repository is created (containing the dependency of chance.js) and the dependency is added in `package.json`.

### Express.js framework
In this step 2, we want to write a dynamic HTTP server with the express.js framework. So we need to install this framework with the command `npm install --save express`.

We want to install the tool for using the `express` command too. We use the command `npm install express-generator -g` (*-g* for global installation because it's a tool).

### Node application that returns dynamic content
We write an `index.js` file in `src` that returns an array containing a liste of 1 to 20 random animals. Here is the code below :<br/>
![index.js of step 2 part 1](/images/step2_code1.png)<br/>
![index.js of step 2 part 2](/images/step2_code2.png)<br/>
![index.js of step 2 part 3](/images/step2_code3.png)

We go in the `express-image` repository and we build our image with the command `docker build -t res/express_animals .`. Then we run a container with our image with the command `docker run -p 9090:5970 res/express_animals`. We make a port mapping to listen to the port 9090 of the VM mapped on the port 5970 of the *res/express_animals* container.

When the container is running, we can access to its dynamic content with our web browser at the address `192.168.99.100:9090`. Here are some examples of responses that the HTTP server can give us :

![Example of response 1](/images/step2_response1.png)

![Example of response 2](/images/step2_response2.png)


## Step 3: Reverse proxy with apache (static configuration)

### Single entry point
In this step, we will build a single entry point to our HTTP server.

### Running containers
We run the static and dynamic containers with the commands `docker run -d --name apache_static res/apache_php` and `docker run -d --name express_dynamic res/express_animals`.<br/>
We can see their ip address with `docker inpect apache_static (or express_dynamic) | grep -i ipaddress`.

Each time we run the two containers, we must check and memorize their ip address because we must hard-coding those addresses in the configuration of the reverse proxy (`172.17.0.2` for the static apache one and `172.17.0.3` for the dynamic express one). It is why the static configuration is fragile and needs to be improved.

### Creating the reverse proxy
First we create a new folder in `docker-images` called `apache-reverse-proxy` and we create the Dockerfile in it. We want an apache php image like in the step one, except now we create a `conf` repository containing our config for the reverse-proxy that we need to copy in `/etc/apache2` where the config is in an apache server.

Once the Dockerfile made, we create in `conf` a folder `sites-available` and we create in the latter the files `000-default.conf` and `001-reverse-proxy.conf`. We configure at first the default config. In the `VirtualHost` balise, we do nothing. This method increases security because if we don't specify the host in the HTTP request, we can't access the content of the server. The access is more restricted.

#### Dockerfile
![Dockerfile](/images/Dockerfile3.png)

#### 000-default.conf
![000-default.conf](/images/000-default.conf.png)

#### 001-reverse-proxy.conf
![001-reverse-proxy.conf](/images/001-reverse-proxy.conf.png)

### Building the reverse proxy image and running the container
We build our image with the command `docker build -t res/apache_reverse_proxy .`. Then we run a container based on this image with the command `docker run -d -p 9090:80 res/apache_reverse_proxy`. We make a port mapping to listen to the port 9090 of the VM mapped on the port 80.

If we go on the address 192.168.99.100:9090 with our web browser, we can see that our security trick works.<br/>
![Forbidden access](/images/access_forbidden.png)

If we go via the console and we specify the host with *julien.res.ch*, we can see it works.

![Works with console](/images/validation_with_cmd.png)



### Modifying the hosts file
We are on Windows. We need to add a host in the file `C:\WINDOWS\system32\drivers\etc\hosts`. We add the line for our *julien.res.ch* host : `192.168.99.100	julien.res.ch`. Now can we reach our HTTP server with the hostname `julien.res.ch`.

### Testing with Postman
![Static works with Postman](/images/validation_with_postman2.png)

![Dynamic works with Postman](/images/validation_with_postman.png)

### Testing with Chrome
We can test the static content with the address `julien.res.ch:9090` and the dynamic one with `julien.res.ch:9090/api/animals/`.

![Static works with Chrome](/images/validation_with_chrome1.png)

![Dynamic works with Chrome](/images/validation_with_chrome2.png)


## Step 4: AJAX requests with JQuery

### Modifing the Dockerfile of apache-php
We want to have an editor (vim in this case) to modify some files in the container. We can modify the Dockerfile to install vim at the start of the container. We add the same 2 lines for the apache-reverse-proxy image and the express image.

![Dockerfile with vim](/images/Dockerfile_vim.png)

### Modifying the index.html file
We modify the *index.html* file in our apache-php image and we add a custom script called `animals.js`.

We add those 2 lines in the script part at the bottom of `index.html`. The second line calls a script `animals.js` located in the `js` repository.

	<!-- Custom script to load animals -->
	<script src="js/animals.js"></script>

### Creating the script animals.js
Now we must create the script called by *index.html*. It is located in the `js` repository. Here is the code below :

![Script animals.js](/images/animals.js.png)

The field with the class `intro-text` is updated every 5 seconds with the name of the beast and which animal it is from the first animal of the JSON array `animals` returned by `express_static` (*getJSON()* method used with path */api/animals/*).

### Rebuilding the apache-php image
When we have created the script `animals.js` and updated `index.html`, we can go in `apache-php` and rebuild the apache-php image with the command `docker build -t res/apache_php .`.

Then we can run the 3 containers with those 3 commands :

	docker run -d --name apache_static res/apache_php
	docker run -d --name express_dynamic res/express_animals
	docker run -d -p 9090:80 --name apache_reverse_proxy res/apache_reverse_proxy

We must check if the IP address of *apache\_static* is `172.17.0.2` and if the IP of *express_dynamic* is `172.17.0.3` because like we said in part 3, the IP addresses are hard-coded in the reverse-proxy. Then we can check if the field with the class `intro-text` is well updated all 5 secondes.

![AJAX animal 1](/images/AJAX_animal1.png)

![AJAX animal 2](/images/AJAX_animal2.png)

For security restriction reasons, we must have a reverse-proxy server to get the dynamic content from *express_dynamic*. If we didn't have a reverse-proxy, we would had two different domains, one for the apache static container and one for the express dynamic one.

Browsers restrict cross-domain requests for security purposes and most AJAX technologies aren't cross-domain for obvious safety reasons too. If we didn't have a reverse-proxy server, we couldn't get the JSON array from the dynamic container because we wouldn't be allowed to access to it from the apache static container.<br/>

## Step 5: Dynamic reverse proxy configuration
In this last step, the goal is to get rid of hard-coded IP addresses in the reverse-proxy configuration. The configuration must become dynamic.

### Using PHP as template engine
We need to recuperate the environment variables with a script.
First, we create in `apache-reverse-proxy` a new folder named `templates` and in the latter we create a file called `config-template-php`.

In `config-template.php`, we copy the content of the config we have in `001-reverse-proxy-conf` (replacing `"` with `'`) and we retrieve the environment variables `STATIC_APP` and `DYNAMIC_APP`.

![config-template.php](/images/config-template.php.png)

After this, we create `apache2-foreground` and we copy in it the same content as the file we find here : [apache2-foreground of php 7.0](https://github.com/docker-library/php/blob/master/7.0/apache/apache2-foreground).

We add some lines to retrieve our 2 environment variables and one more line after the 2 variables for launching the script `config-template.php`.<br/>
**Note :** `apache2-foreground` must be saved in the editor (eg. Notepad++) with **UNIX EOL**. If we don't do that, we can have some problems with the interpretation of the file.

![apache2-foreground](/images/apache2-foreground.png)

Then we modify the *Dockerfile* because we need to copy `apache2-foreground` in `usr/local/bin` and `config-template-php` into the apache image in a `templates` repository.

![Dockerfile](/images/Dockerfile5.png)

Now we can configure the apache-reverse-proxy dynamically when we run the container passing it 2 ENV variables.

At first we run some containers based on *res/apache_php* image and some based on *res/express_animals* image. Here are the commands below :

	docker run -d res/apache_php
	docker run -d res/express_animals

We can manually give them a name if we want with option `--name`. Then we find the IP address of the container we choose with the command `docker inspect name_of_container | grep -i ipaddress`. We need an IP address of an apache_static container and another IP address of a express_dynamic container that we will use with the reverse proxy.

Once the two IP addresses noted in a corner, we can run the reverse proxy. We have for example `172.17.0.5` (port 80) as IP for the static container and `172.17.0.8` (port 5970) for the dynamic one. We can add those two IP addresses in our ENV variables `STATIC_APP` and `Dynamic_APP` with the `-e` parameter. Here is the command to run the reverse-proxy container :

	docker run -d -p 9090:80 --name apache_rp1 -e STATIC_APP=172.17.0.5:80 -e DYNAMIC_APP=172.17.0.8:5970 res/apache_reverse_proxy

Once the reverse proxy is running, we can verify if all our configuration is working. It is the case and now the laboratory is done. We choosed to not implement bonus parts because in this end of semester we are a bit overworked.

Julien Brêchet
Adrien Marco
