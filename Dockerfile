FROM hbodp.artifactoryonline.com/node-0.10.36-slim:0ffbbd7

RUN     mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY public             /usr/src/app/public
COPY node_modules       /usr/src/app/node_modules
COPY config.json        /usr/src/app/config.json
COPY package.json       /usr/src/app/package.json
COPY server.js          /usr/src/app/server.js

EXPOSE 8888

CMD ["node", "server.js"]
