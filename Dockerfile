FROM node:latest
MAINTAINER Admin
RUN apt-get update \
 && apt-get install -y \
      gconf-service \
      fonts-ipafont \
      fonts-ipaexfont \
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
 && useradd web2pdf -m

WORKDIR /home/web2pdf
USER web2pdf

RUN npm install puppeteer argv http fs-extra
COPY ./js/web2pdf.js /home/web2pdf/

VOLUME ["/home/web2pdf/pdf"]
EXPOSE 8080

CMD node web2pdf.js -d ./pdf -s -p 8080
