# # cspell:word npmrc,workdir

# ### Build layer

# FROM node:12-alpine as build

# WORKDIR /run

# # Install app dependencies
# COPY package*.json ./
# COPY src ./src
# COPY tsconfig.production.json ./

# RUN npm ci --ignore-scripts --no-audit && \
#   npm run build && \
#   npm ci --ignore-scripts --no-audit --only=production

# ### Production layer

# FROM node:12-alpine

# WORKDIR /run

# COPY open-api ./open-api
# COPY --from=build /run/lib ./lib/
# COPY --from=build /run/package.json .
# COPY --from=build /run/node_modules ./node_modules/

# CMD [ "npm", "run", "start"]
