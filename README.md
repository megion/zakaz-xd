

Node JS WEB application    

## Installation

Install MongoDb server [mongodb](http://www.mongodb.org/)

Clone project, then install the dependencies:

    $ git clone https://github.com/megion/zakaz-xd.git
    $ cd zakaz-xd
    $ npm install
    
## Prepare config parameters (server address, mongodb database connection and other parameters)

Configure database connection settings in file `config.json`. Copy template config file and change parameters as you need.

    $ cp config-template.json config.json

Run fill database script:

    $ node src/createDb

## Run

    $ node src/app

## Demo application [http://zakazxd-megion.rhcloud.com](http://zakazxd-megion.rhcloud.com)


    
    
    
    
