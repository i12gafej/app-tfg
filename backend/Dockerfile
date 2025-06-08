FROM python:3.10-slim

WORKDIR /app

# --- instalar cliente MySQL 8 del repo de Oracle ---
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y wget gnupg lsb-release pkg-config default-libmysqlclient-dev build-essential && \
    wget -qO /tmp/mysql-apt-config.deb \
        https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb && \
    echo "mysql-apt-config mysql-apt-config/select-server select mysql-8.0" | debconf-set-selections && \
    dpkg -i /tmp/mysql-apt-config.deb && \
    rm /tmp/mysql-apt-config.deb && \
    apt-get update && \
    apt-get install -y --no-install-recommends mysql-client && \
    rm -rf /var/lib/apt/lists/*

# Copiar los archivos de requisitos
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]