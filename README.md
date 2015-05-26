

Node JS WEB application    

## Installation

Install global packages
    
    # npm install -g bower

Install MongoDb server [mongodb](http://www.mongodb.org/)

Clone project, then install the dependencies:

    $ git clone https://github.com/megion/zakaz-xd.git
    $ cd zakaz-xd
    $ npm install 
    
Install public bower dependencies:
    
    $ cd src/public
    $ bower install
    
## Prepare config parameters (server address, mongodb database connection and other parameters)

Configure database connection settings in file `config.json`. Copy template config file and change parameters as you need.

    $ cp config-template.json config.json

Run fill database script:

    $ cd src
    $ NODE_PATH=. node createDb

## Run
 
Go to src folder and run server

    $ NODE_PATH=. node app
    
or for development logs
    
    $ NODE_ENV=development NODE_PATH=. node app
    
Run in Windows OS

    set NODE_PATH=.
    node app
    

    
    
    
    
