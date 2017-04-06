From node:7.8.0

ADD . /tiny-chat

WORKDIR /tiny-chat

RUN rm -rf ./node_modules && \
    yarn

ENV NODE_ENV=production

RUN node_modules/webpack/bin/webpack.js --progress --color

EXPOSE 3000

CMD ["sh", "-c", "./server.js"]
