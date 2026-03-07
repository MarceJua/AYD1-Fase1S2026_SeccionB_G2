# Usar la imagen de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código del frontend
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para iniciar Vite (en modo host para que Docker lo exponga)
CMD ["npm", "run", "dev", "--", "--host"]