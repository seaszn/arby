FROM node:18

# Create app directory
WORKDIR /usr/src/alpu_arbitrage

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./.yalc ./.yalc
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Expose the websocket port
EXPOSE 8080:8080
CMD ["npm", "start" ]
