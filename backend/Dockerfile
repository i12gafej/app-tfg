FROM python:3.10

WORKDIR /app

RUN apt-get update && apt-get install -y default-mysql-client

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt