#!/bin/bash
cd /workspace/ApneaSarcopeniaHNC/Frontend
npm install -g npm@latest 
npm install
npm install -g serve
npm run build
serve -s build -p 8000 --cors
