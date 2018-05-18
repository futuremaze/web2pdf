FROM node:latest
MAINTAINER Admin

RUN echo 'deb http://ftp.jp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list
RUN set -ex; \
        apt-get update; \
        apt-get install -y --no-install-recommends \
                gconf-service \
                libasound2 \
                libatk1.0-0 \
                libc6 \
                libcairo2 \
                libcups2 \
                libdbus-1-3 \
                libexpat1 \
                libfontconfig1 \
                libgcc1 \
                libgconf-2-4 \
                libgdk-pixbuf2.0-0 \
                libglib2.0-0 \
                libgtk-3-0 \
                libnspr4 \
                libpango-1.0-0 \
                libpangocairo-1.0-0 \
                libstdc++6 \
                libx11-6 \
                libx11-xcb1 \
                libxcb1 \
                libxcomposite1 \
                libxcursor1 \
                libxdamage1 \
                libxext6 \
                libxfixes3 \
                libxi6 \
                libxrandr2 \
                libxrender1 \
                libxss1 \
                libxtst6 \
                ca-certificates \
                fonts-liberation \
                libappindicator1 \
                libnss3 \
                lsb-release \
                xdg-utils \
                wget \
                fonts-noto-cjk \
        && useradd web2pdf -m

WORKDIR /home/web2pdf
USER web2pdf

COPY ./js/web2pdf.js ./js/package.json /home/web2pdf/
RUN npm install puppeteer argv http fs-extra

VOLUME ["/home/web2pdf/pdf"]
EXPOSE 8080

ENTRYPOINT ["node", "web2pdf.js", "-o", "./pdf", "-s", "-p", "8080"]
