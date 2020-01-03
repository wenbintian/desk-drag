FROM node:9
MAINTAINER liuhongnan <823251357@qq.com>
ENV APP_HOME /project/zoehis-web-system-aide
RUN mkdir -p "$APP_HOME"
ADD . $APP_HOME

WORKDIR $APP_HOME/examples
RUN npm set registry http://gitlab.zoesoft.com.cn:7001; \
    npm set disturl https://npm.taobao.org/dist; \
    npm set sass-binary-site http://npm.taobao.org/mirrors/node-sass;
RUN npm install && npm run build;
EXPOSE 3004
CMD ["npm","run","prod_docker"]
