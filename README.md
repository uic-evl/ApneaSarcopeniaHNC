## Wearable-Project

See Frontend/Readme for developer instructions

#### Deployment

setup:
* Install docker
* run ufw allow 80/tcp
* update/clone git repo

deployment
0. Change "server_name localhost" to whatever the website is
1. copy appropriate env.js file into Frontend/src/env.js for deployement app
2. run 
 > sudo docker build -t fitbit-apnea-app .
 > sudo docker run -p 80:80 fitbit-apnea app


 Todo: 
 -see if this actuall works
 -figure out https forwarding setup
