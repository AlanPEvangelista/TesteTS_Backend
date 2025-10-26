# Atualização rápida via GitHub no Debian (192.168.100.117, usuário alan)

Este guia assume que a primeira publicação já foi feita e que:
- Nginx está configurado em `8080` servindo o frontend em `/var/www/testets-frontend` e proxy `/api -> 127.0.0.1:3000`.
- Backend (Node/Express) já roda em `3000` gerenciado por PM2 (ou systemd).
- Repositório do projeto já está clonado no servidor.

Abaixo, apenas os passos para ATUALIZAR o servidor com o que foi enviado ao GitHub.

## 1) Puxar mudanças do GitHub
```
ssh alan@192.168.100.117
cd ~/<repo>         # substitua <repo> pelo nome/pasta do seu repositório
git pull origin main
```

## 2) Atualizar backend (se houve mudanças no backend)
```
cd backend
npm ci
npx prisma migrate deploy
npm run build
# Se usa PM2:
pm2 restart testets-backend
# Se usa systemd (alternativa):
# sudo systemctl restart testets-backend
```

Observações:
- `.env` do backend deve continuar com `DATABASE_URL="file:./dev.db"` e `PORT=3000` (se aplicável).
- Execute comandos do Prisma dentro de `backend/`.

## 3) Atualizar frontend
```
cd ../frontend
# Mantemos o proxy via Nginx, então use caminho relativo
printf "VITE_API_URL=\"/api\"\n" > .env
npm ci
npm run build
sudo rm -rf /var/www/testets-frontend/*
sudo cp -r dist/* /var/www/testets-frontend/
sudo nginx -t && sudo systemctl reload nginx
```

## 4) Verificação rápida
```
# Backend
curl http://127.0.0.1:3000/            # deve responder {"ok":true}
curl http://127.0.0.1:3000/clients     # deve responder JSON

# Frontend + Proxy
curl http://192.168.100.117:8080/
curl http://192.168.100.117:8080/api/clients
```
Acesse no navegador: `http://192.168.100.117:8080/`.

## 5) Dicas e solução de problemas
- Se o frontend mostrar erro de API, confirme que `VITE_API_URL="/api"` foi usado no build.
- Logs:
```
pm2 logs testets-backend
sudo systemctl status nginx
sudo ss -ltnp | grep -E ':8080|:3000'
```
- Evite usar portas "inseguras" (ex.: 87). Mantenha `8080` para HTTP.
- Se futuramente usar HTTPS, configure TLS (Certbot) e sirva tudo em `443`.