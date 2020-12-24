FROM node:14-alpine
RUN apk add --no-cache --update bash
# set working directory
RUN mkdir /usr/src/app -p
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
# ADD package.json package-lock.json /usr/src/app/
ADD package.json package-lock.json /usr/src/app/
RUN npm i

# start app
CMD ["npm", "run", "start"]
