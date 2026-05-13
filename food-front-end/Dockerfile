# Bước 1: Build ứng dụng
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json và package-lock.json trước để tận dụng Docker cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build dự án (Vite mặc định xuất ra thư mục dist)
RUN npm run build

# Bước 2: Phục vụ bằng Nginx
FROM nginx:stable-alpine

# Copy các file đã build từ stage 1 sang thư mục của Nginx
# Lưu ý: Vite mặc định build ra folder 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]