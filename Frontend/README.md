# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Deployment

setup:

- Install docker
- run ufw allow 80/tcp
- update/clone git repo

deployment 0. Change "server_name localhost" to whatever the website is

1. copy appropriate env.js file into Frontend/src/env.js for deployement app
2. run
   `sudo docker build -t fitbit-apnea-app .`  
   `sudo docker run -p 80:80 fitbit-apnea-app`

Todo:
-see if this actuall works
-figure out https forwarding setup
