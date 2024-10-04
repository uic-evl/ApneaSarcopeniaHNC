FROM node:20.11.1-alpine3.19 AS build

WORKDIR /app

COPY Frontend/package.json ./

RUN yarn install

ENV PATH /app/node_modules/.bin:$PATH

COPY ./Frontend .

RUN yarn run build

FROM nginx:1.25.4-alpine3.18

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]