# The complete and corrected file for the main backend

FROM node:18-alpine
WORKDIR /usr/src/app

# Specify the subdirectory to copy from the main build context
COPY server/package*.json ./
RUN npm install

# Copy only the contents of the server directory into the container
COPY server/ .

EXPOSE 5000
CMD ["npm", "run", "dev"]