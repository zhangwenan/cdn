FROM node:8.11.0-alpine

RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN apk del tzdata

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install -g pm2
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:rotateInterval '0 0 0 * * *'

WORKDIR /usr/src/app
ADD package.json /usr/src/app
RUN cnpm install
ADD . /usr/src/app
RUN mkdir -p logs
CMD ["npm", "run", "docker-start"]