FROM nikolaik/python-nodejs:python3.9-nodejs12

RUN mkdir /project
WORKDIR /project
COPY requirements.txt /project/requirements.txt

RUN pip install -r requirements.txt

RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json package-lock.json ./

RUN npm cache clean --force && npm install

COPY . /opt/app

CMD [ "node", "server.js" ]