# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:16 AS builder
# Set working directory
WORKDIR /usr/src/app/mock-server-frontend
# Copy all files from current directory to working dir in image

COPY . .
# install node modules and build assets
RUN rm -rf package-lock.json && npm i && npm run build -- --configuration=production --optimization true

# nginx state for serving content
FROM nginx:alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /usr/src/app/mock-server-frontend/dist/mock-server-frontend .
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./bmm-entrypoint.sh /script.sh
RUN chmod 777 /script.sh
# Containers run nginx with global directives and daemon off
EXPOSE 8080
 
ENTRYPOINT ["/script.sh"]
CMD ["nginx", "-g", "daemon off;"]