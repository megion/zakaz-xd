

Node JS WEB application    

## Installation

Install MongoDb server [mongodb](http://www.mongodb.org/)

Windows only:
* Create DB folder `C:\mongodb\db`
* Run server on Windows `mongod --dbpath=C://mongodb/db`


Clone project, then install the dependencies:

    $ git clone https://github.com/megion/zakaz-xd.git
    $ cd zakaz-xd
    $ npm install
     

    
## Prepare config parameters in `config.json`

Copy template `config-template.json` file to `config.json` file and change parameters as you need.

    $ cp config-template.json config.json

Run fill database script:

    $ node src/createDb

## Run

    $ node src/app

Demo application [http://zakazxd-megion.rhcloud.com](http://zakazxd-megion.rhcloud.com)

## Web development

    install Gulp global
    # npm install --global gulp-cli
    
    install local web packages
    $ cd src/web
    $ npm install
    
    Build
    $ gulp
    or
    $ gulp watch



    
    
    
    
