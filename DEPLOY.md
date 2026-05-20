# Deployment Guide — Ubuntu Server

## Prerequisites

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install -y git

# PM2 (process manager)
sudo npm install -g pm2
```

## Clone & Install

```bash
git clone https://github.com/f13r/quiz-app.git
cd quiz-app
bash deploy.sh
```

`deploy.sh` installs all dependencies and builds the React client into `client/dist`.

## Start the Server

### One-off (foreground)

```bash
node server/server.js
# or
npm start
```

Server listens on `http://0.0.0.0:3001`.

### With PM2 (keeps running after logout)

```bash
pm2 start server/server.js --name quiz
pm2 save                   # persist across reboots
pm2 startup                # follow the printed command to enable autostart
```

Useful PM2 commands:

```bash
pm2 logs quiz      # tail logs
pm2 restart quiz   # restart
pm2 stop quiz      # stop
pm2 status         # process list
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3001`  | TCP port the server binds to |

```bash
PORT=8080 node server/server.js
# or with PM2:
pm2 start server/server.js --name quiz --env production -- PORT=8080
```

## Nginx Reverse Proxy (optional — port 80/443)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;

        # Required for Socket.IO
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
    }
}
```

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/quiz
sudo ln -s /etc/nginx/sites-available/quiz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Update Deployment

```bash
git pull
bash deploy.sh
pm2 restart quiz
```

## Working with Claude Code on This Server

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Open the project
cd quiz-app
claude
```
