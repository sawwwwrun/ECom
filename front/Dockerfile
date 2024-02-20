#base image node.js
FROM node:alpine

#working directory
WORKDIR /usr/src/app

#package.json and package-lock.json
COPY package*.json ./

#dependencies
RUN npm install

#rest of the application files
COPY . .


#expose the port
EXPOSE 3000

#command to run my React application
CMD ["npm","start"]