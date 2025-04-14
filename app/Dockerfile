FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install -g typescript
RUN npm install
RUN npm i -g serve
COPY . .

# Set default environment to production
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build for production
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi
EXPOSE 3000

CMD if [ "$NODE_ENV" = "production" ]; then serve -s dist; else npm run dev; fi