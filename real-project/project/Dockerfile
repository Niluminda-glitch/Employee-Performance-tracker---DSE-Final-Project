# The complete and corrected file for the frontend

FROM node:18-alpine
WORKDIR /usr/src/app

# Specify the full subdirectory path to copy from the main build context
COPY real-project/project/package*.json ./
RUN npm install

# Copy only the contents of the frontend directory into the container
COPY real-project/project/ .

EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--port", "8080", "--host"]