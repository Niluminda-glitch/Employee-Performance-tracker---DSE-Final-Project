# The complete and corrected file for the trends backend

FROM node:18-alpine
WORKDIR /usr/src/app

# Specify the subdirectory to copy from the main build context
COPY trends-backend/package*.json ./
RUN npm install

# Copy only the contents of the trends-backend directory into the container
COPY trends-backend/ .

EXPOSE 3001
CMD ["node", "server-new.js"]