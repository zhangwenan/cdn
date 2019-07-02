FROM daocloud.io/maihaoche/mhc_node:8.11.0-alpine
WORKDIR /usr/src/app
ADD package.json /usr/src/app
RUN cnpm install
ADD . /usr/src/app
RUN mkdir -p logs
CMD ["npm", "run", "docker-start"]