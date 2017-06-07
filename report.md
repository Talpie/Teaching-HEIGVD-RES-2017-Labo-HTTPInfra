# RES - REPORT LABO HTTP

## Step 1

### introduction
Create a docker file and a content folder.
Put your php/html code inside the content folder

### docker file
    FROM php:5.6-apache
    COPY content/ /var/www/html/
    MAINTAINER Tony Clavien <tony.clavien@heig-vd.ch>

### inspecter configuration apache
    Docker exec -it <container_name> /bin/bash
=> then look inside /etc/

### execution
    docker build -t res/apache_php .
    docker run -d -p 9090:80 res/apache_php
    
you can access it through your browser

## Step 2

### introduction

Inside a folder ( i.e. express-image )
create a docker file and a src folder where you will put your code

### docker file
    FROM node:4.4
    COPY src/ /opt/app
    CMD ["node", "/opt/app/index.js"]
    
    MAINTAINER Tony Clavien <tony.clavien@heig-vd.ch>

### Node stuff

Inside your src folder, to create the package.json files do

    npm init
    npm install –save chance
    npm install –save express
    
then create your index.js file and put your node code inside

### execution

    docker build -t res/express_students .
    docker run -d -p 9090:3000 res/express_ students

## Step 3
Create a docker file. Get the ip address of the two others container with `docker inspect <name> | grep -i ipaddress`. 
Create the folders conf/sites-available . Inside sites-available, create 000-default.conf and 001-reverse-proxy.conf with the following
### docker file
    FROM php:5.6-apache
    COPY conf/ /etc/apache2

    RUN a2enmod proxy proxy_http
    RUN a2ensite 000-* 001-*

    MAINTAINER Tony Clavien <tony.clavien@heig-vd.ch>
### 000-default.conf
    <VirtualHost *:80>
    </VirtualHost>
### 001-reverse-proxy.conf
    <VirtualHost *:80>
	    ServerName demo.res.ch
	
	    ProxyPass "/api/students/" "http://172.17.0.3:3000/"
	    ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"
	    #ips comes from the inspect command
	    ProxyPass "/" "http://172.17.0.2:80/"
	    ProxyPassReverse "/" "http://172.17.0.2:80/"
    </VirtualHost>
### execution
 Launch the 2 previous container : apache_php and express_students then build and launch our new image
 
    docker build -t res/apache_rp .
    docker run -d -p 9090:80 res/apache_rp
### Access with your browser
Don't forget to add your host (demo.res.ch) to your hosts file. For windows edit the file `C:\Windows\System32\Drivers\etc`and add `192.168.99.100 demo.res.ch`
You can then access it with demo.res.ch:9090
## Step 4

### edit content of static
Here we will edit our html content to do an ajax request.
First of all, we will use jquery so we need to set up the dependency with `<script src="jquery.js"></script>` ( jquery.js is the downloaded jquery file)
then we add our ajax script 

    <script>
    $(function() {
	    console.log("loading beers");
	
	    function loadBeer() {
	    $.getJSON("/api/students/", function(beers) {
		     	console.log(beers);
			    var message = "no beer :(";
			    if(beers.length > 0) {
			    	message = beers[0].name + " " + beers[0].type;
			    }
			    console.log(message);
			    $("span").text(message);
		    });
	    };
	
	    loadBeer();
	    setInterval(loadBeer, 2000);
    });</script>

and that's all


## Step 5

### introduction
we start from the apache-reverse-proxy of step 3 and we edit the following files.
config-template.php will create our new config file using php scripting. and apache2-foreground will copy this new config file to the right place and then launch the apache server.
### new docker file
    FROM php:5.6-apache
    COPY apache2-foreground /usr/local/bin/
    COPY templates /var/apache2/templates
    COPY conf/ /etc/apache2

    RUN apt-get update && \ 
     apt-get install -y vim

    RUN a2enmod proxy proxy_http
    RUN a2ensite 000-* 001-*

    MAINTAINER Tony Clavien <tony.clavien@heig-vd.ch>
 ### apache2-foreground file
     set -e

    #add setup for RES
    echo "Setup for the RES lab"
    echo "Static app URL : $STATIC_APP"
    echo "Dynamic app URL : $DYNAMIC_APP"
    php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf

    rm -f /var/run/apache2/apache2.pid

    exec apach2 -DFOREGROUND
    
 ### config-template.php file 
     <?php
	    $dynamic_app = getenv(DYNAMIC_APP);
	    $static_app = getenv(STATIC_APP);
    ?>
    <VirtualHost *:80>
    	ServerName demo.res.ch
	
	    ProxyPass '/api/students/' 'http://<?php print "$dynamic_app"?>/'
     	ProxyPassReverse '/api/students/' 'http://<?php print "$dynamic_app"?>/'
	
	    ProxyPass '/' 'http://<?php print "$static_app"?>/'
	    ProxyPassReverse '/' 'http://<?php print "$static_app"?>/'
    </VirtualHost>
    
 ### execution
     docker build -t res/apache_rp2 .
     docker run -d -e STATIC_APP=172.17.0.2:80 -e DYNAMIC_APP=172.17.0.3:3000 --name apache_rp2 -p 9090:80 res/apache_rp2
