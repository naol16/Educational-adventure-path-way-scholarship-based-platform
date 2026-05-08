# 1. Use the official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Install Playwright browsers in a standard location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install chromium --with-deps
# 5. Copy the rest of the source code
COPY . .

# 6. Build the TypeScript code
RUN npm run build

# 7. Render uses port 10000 by default
ENV PORT=10000
EXPOSE 10000

# 8. Start the application
# Make sure your server.js is actually listening on process.env.PORT
CMD ["node", "dist/server.js"]
