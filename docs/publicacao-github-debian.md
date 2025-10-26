# Publicação no Debian via GitHub (Servidor 192.168.100.117, usuário alan)

Este guia detalha os passos manuais para publicar e atualizar o projeto no servidor Debian, usando o GitHub como origem do código. O frontend será servido por Nginx na porta `8080` e o backend (Node/Express) rodará na porta `3000`, com proxy via Nginx em `/api`.

## Visão geral
- Frontend: build com Vite; servido por Nginx em `http://192.168.100.117:8080/`.
- Backend: Node/Express em `http://127.0.0.1:3000/` (acesso interno); Prisma com SQLite (`file:./dev.db`).
- Proxy: Nginx encaminha `/api` para `127.0.0.1:3000`.
- Atualização: commit/push no GitHub; no servidor, `git pull`, build, copiar `dist` e reiniciar backend.

## Pré-requisitos
- Repositório no GitHub com todo o projeto.
- Acesso SSH ao servidor Debian: `ssh alan@192.168.100.117`.
- Git instalado no servidor: `sudo apt-get install -y git`.
- Node.js LTS no servidor (via NodeSource ou nvm).

## 1) Primeira configuração no servidor (uma vez)

1. Acessar o servidor:
```
ssh alan@192.168.100.117
```

2. Instalar Git e Node (exemplo com NodeSource LTS):
```
sudo apt-get update
sudo apt-get install -y curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
```

3. Configurar chave SSH (se repositório privado no GitHub):
```
ssh-keygen -t ed25519 -C "alan@192.168.100.117"
cat ~/.ssh/id_ed25519.pub
# Copie e adicione em GitHub > Settings > SSH keys
ssh -T git@github.com  # deve responder "Hi <user>! You've successfully authenticated..."
```

4. Clonar o repositório:
```
cd ~
# Substitua pelo URL do seu repositório
git clone git@github.com:<org>/<repo>.git
cd <repo>
```

5. Instalar e configurar Nginx:
```
sudo apt-get install -y nginx
sudo ufw allow 8080/tcp
```
Crie arquivo do site `sudo nano /etc/nginx/sites-available/testets-frontend` com:
```
server {
  listen 8080;
  server_name _;

  root /var/www/testets-frontend;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```
Habilitar e recarregar:
```
sudo mkdir -p /var/www/testets-frontend
sudo ln -s /etc/nginx/sites-available/testets-frontend /etc/nginx/sites-enabled/testets-frontend
sudo nginx -t && sudo systemctl reload nginx
```

6. Backend: configurar ambiente, instalar deps, migrations e build:
```
cd backend
# .env com SQLite relativo ao schema.prisma
printf "DATABASE_URL=\"file:./dev.db\"\nPORT=3000\n" > .env
npm ci
npx prisma generate
# Se houver migrations versionadas, use deploy
npx prisma migrate deploy
# Se não houver migrations, use: npx prisma db push
npm run build
```
Iniciar backend com PM2 (recomendo para manter rodando):
```
npm i -g pm2
pm2 start dist/index.js --name testets-backend
pm2 save
pm2 startup  # siga as instruções exibidas
```
(Alternativa: criar serviço systemd se preferir.)

7. Frontend: configurar `.env`, instalar deps, build e publicar no Nginx:
```
cd ../frontend
printf "VITE_API_URL=\"/api\"\n" > .env
npm ci
npm run build
sudo rm -rf /var/www/testets-frontend/*
sudo cp -r dist/* /var/www/testets-frontend/
sudo nginx -t && sudo systemctl reload nginx
```

8. Verificações rápidas:
```
curl http://127.0.0.1:3000/            # deve responder {"ok":true}
curl http://127.0.0.1:3000/clients     # deve responder JSON
curl http://192.168.100.117:8080/      # carrega frontend
curl http://192.168.100.117:8080/api/clients  # via proxy
```

## 2) Fluxo de atualização via GitHub (toda vez que houver mudanças)

1. No seu computador (dev):
```
cd <repo>
git add -A
git commit -m "feat: sua mudança"
git push origin main
```

2. No servidor:
```
ssh alan@192.168.100.117
cd ~/<repo>
# Puxar últimas mudanças
git pull origin main
```

3. Atualizar backend (se houver mudanças no backend):
```
cd backend
npm ci
npx prisma migrate deploy
npm run build
pm2 restart testets-backend
```
(Se usar systemd, troque `pm2 restart` por `sudo systemctl restart testets-backend`.)

4. Atualizar frontend:
```
cd ../frontend
npm ci
npm run build
sudo rm -rf /var/www/testets-frontend/*
sudo cp -r dist/* /var/www/testets-frontend/
sudo systemctl reload nginx
```

5. Verificar:
```
curl http://127.0.0.1:3000/
curl http://192.168.100.117:8080/
curl http://192.168.100.117:8080/api/clients
```

## Dicas e solução de problemas
- Porta 8080 é recomendada; evite 87 (muitos navegadores bloqueiam portas "inseguras").
- Use `VITE_API_URL="/api"` para evitar CORS (proxy Nginx cuida das chamadas).
- Se usar HTTPS futuramente, configure TLS (Certbot) e sirva ambos os caminhos em 443; evite chamar API em HTTP quando frontend está em HTTPS (mixed content).
- Checar serviços:
```
pm2 list
pm2 logs testets-backend
sudo systemctl status nginx
sudo ss -ltnp | grep -E ':8080|:3000'
```
- Prisma: execute comandos dentro de `backend/`; `DATABASE_URL` é relativo ao `backend/prisma/schema.prisma`.
- Firewall: normalmente apenas `8080/tcp` externo; mantenha `3000` para uso interno via proxy.

## Checklist
- [ ] GitHub remoto configurado e acessível via SSH.
- [ ] Nginx ouvindo em 8080, site habilitado e root `/var/www/testets-frontend`.
- [ ] Backend rodando (PM2 ou systemd) em 3000.
- [ ] `.env` do backend com `DATABASE_URL="file:./dev.db"`.
- [ ] `.env` do frontend com `VITE_API_URL="/api"`.
- [ ] Fluxo de atualização: `git pull` + build backend + build frontend + reload Nginx.