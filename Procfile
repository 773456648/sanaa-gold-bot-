# استخدام صورة تدعم المتصفح والويب معاً بشكل خفيف
FROM ghcr.io/browserless/chromium:latest

# العودة للمستخدم الجذري لتثبيت Node.js
USER root

RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# إعدادات المتصفح
ENV CONNECTION_TIMEOUT=300000
ENV MAX_CONCURRENT_SESSIONS=5
ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=720

EXPOSE 3000
EXPOSE 8080

# تشغيل النظام
CMD ["node", "server.js"]