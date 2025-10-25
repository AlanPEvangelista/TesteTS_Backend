# Guia de Instalação Manual — Servidor Debian (192.168.100.117)

Este guia explica, passo a passo, como instalar e executar o projeto (backend Node/Express + frontend Vite/React) em um servidor Debian na rede local, com IP 192.168.100.117. Todos os passos são manuais, para você executar um a um.

## 1) Visão geral e requisitos
- Backend: Node.js + Express (TypeScript), porta padrão `3000`.
- Frontend: Vite/React (build estático). Preview padrão `4173`. Opcional: Nginx em `80/443`.
- Uploads: `backend/uploads`.
- Banco: Prisma (há `prisma/dev.db`, geralmente SQLite).

Requisitos no Debian:
- Pacotes básicos: `curl`, `git`, `unzip`, `ufw` (opcional), `nginx` (opcional).
- Node.js 20.x e npm.

## 2) Preparar o servidor Debian
1. Atualize o sistema:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
2. Instale utilitários:
   ```bash
   sudo apt install -y curl git unzip ufw
   ```
3. Instale Node.js (via NodeSource, versão 20.x):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   node -v
   npm -v
   ```

## 3) Obter o código no Debian
Escolha uma forma:
- Clonar de um repositório Git:
  ```bash
  cd ~
  git clone <URL_DO_REPOSITORIO> TesteTS_Backend
  ```
- Transferir um `.zip` do Windows para o Debian (SCP/SFTP/Pendrive) e descompactar:
  ```bash
  sudo apt install -y unzip
  unzip TesteTS_Backend.zip -d ~
  ```
Crie as pastas caso não existam (alguns pacotes não trazem a estrutura completa):
```bash
mkdir -p ~/TesteTS_Backend/backend ~/TesteTS_Backend/frontend
```
Verifique a estrutura:
```
~/TesteTS_Backend/backend
~/TesteTS_Backend/frontend
```

## 4) Backend — instalação e execução
1. Instale dependências:
   ```bash
   cd ~/TesteTS_Backend/backend
   npm install
   ```
2. Configure variáveis de ambiente no `.env` (crie se não existir):
   ```bash
   nano .env
   ```
   Conteúdo sugerido:
   ```env
   PORT=3000
   JWT_SECRET="troque-por-um-segredo-forte"
   # SQLite (Prisma) — aponta para backend/prisma/dev.db
   DATABASE_URL="file:./dev.db"
   ```
   Dica (gerar segredo forte):
   ```bash
   openssl rand -hex 32
   ```
   Observação:
   - O `DATABASE_URL` é obrigatório para o Prisma. Com SQLite, use `file:./dev.db`, relativo ao arquivo `schema.prisma` (fica em `backend/prisma/`).
   - Para Postgres (se futuramente trocar o provider), use algo como:
     ```env
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_db?schema=public"
     ```
3. (Opcional/Conforme o projeto) Aplique migrações/seed do Prisma:
   **IMPORTANTE: Execute os comandos Prisma dentro do diretório `backend`**
   ```bash
   # Certifique-se de estar em ~/TesteTS_Backend/backend
   cd ~/TesteTS_Backend/backend
   
   # Se houver migrações criadas:
   npx prisma migrate deploy
   
   # OU se não houver migrações, sincronize o schema:
   npx prisma db push
   
   # Opcional: popular dados de exemplo (se configurado)
   npx prisma db seed
   ```
4. Compile o TypeScript:
   ```bash
   npm run build
   ```
   Observação (Frontend): Se aparecerem erros TS6133 (imports não usados), remova o `import React from "react"` e imports não utilizados. O projeto já usa JSX automático (`jsx: "react-jsx"` em `tsconfig.app.json`), então o import padrão de React não é necessário.
5. Execute em produção (manual):
   ```bash
   npm start
   ```
   Esperado: mensagem indicando que a API está ouvindo em `http://localhost:3000`.
6. (Se usar firewall) Libere a porta 3000:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw status
   ```
7. Teste o acesso na rede local (de outro dispositivo):
   - `http://192.168.100.117:3000/`
   - Teste via `curl`:
     ```bash
     curl http://192.168.100.117:3000/
     ```
PAREI AQUI...........
### Backend como serviço (systemd) — opcional
1. Crie o unit file:
   ```bash
   sudo nano /etc/systemd/system/testets-backend.service
   ```
2. Conteúdo (ajuste o usuário e caminho):
   ```ini
   [Unit]
   Description=TesteTS Backend
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/home/SEU_USUARIO/TesteTS_Backend/backend
   ExecStart=/usr/bin/node /home/SEU_USUARIO/TesteTS_Backend/backend/dist/index.js
   Restart=always
   Environment=PORT=3000
   Environment=JWT_SECRET=troque-por-um-segredo-forte

   [Install]
   WantedBy=multi-user.target
   ```
3. Habilite e inicie:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now testets-backend
   journalctl -u testets-backend -f
   ```

## 5) Frontend — build e servir
1. Instale dependências:
   ```bash
   cd ~/TesteTS_Backend/frontend
   npm install
   ```
2. Configure o endpoint da API no frontend (arquivo `.env`):
   ```bash
   nano .env
   ```
   Conteúdo:
   ```env
   VITE_API_URL="http://192.168.100.117:3000"
   ```
3. Gere o build de produção:
   ```bash
   npm run build
   ```
4. Sirva o build com o preview do Vite (simples):
   ```bash
   npm run preview -- --host --port 4173
   ```
   Observação: `--host` torna acessível pela rede; você pode alterar `--port`.
5. (Se usar firewall) Libere a porta do preview:
   ```bash
   sudo ufw allow 4173/tcp
   ```
6. Acesse pelo navegador na rede:
   - `http://192.168.100.117:4173/`

## 6) Frontend com Nginx (opcional, recomendado para produção)
1. Instale Nginx:
   ```bash
   sudo apt install -y nginx
   ```
2. Copie o build do frontend para o diretório web:
   ```bash
   sudo mkdir -p /var/www/testets-frontend
   sudo cp -r ~/TesteTS_Backend/frontend/dist/* /var/www/testets-frontend/
   ```
3. Configure o site Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/testets-frontend
   ```
   Conteúdo básico (SPA):
   ```nginx
   server {
     listen 80;
     server_name 192.168.100.117;
     root /var/www/testets-frontend;
     index index.html;

     location / {
       try_files $uri /index.html;
     }
   }
   ```
4. Ative e recarregue:
   ```bash
   sudo ln -s /etc/nginx/sites-available/testets-frontend /etc/nginx/sites-enabled/testets-frontend
   sudo nginx -t
   sudo systemctl reload nginx
   sudo ufw allow 80/tcp
   ```
5. Acesse:
   - `http://192.168.100.117/`

### Proxy para o backend (opcional)
Se preferir expor a API atrás do Nginx, mantenha o backend rodando (porta 3000) e adicione um bloco de proxy. Exemplo simples:
```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
Ajuste o frontend para apontar para `http://192.168.100.117/api/` se você utilizar prefixo `/api`.

## 7) Verificação e testes
- Backend:
  ```bash
  curl http://192.168.100.117:3000/
  # Endpoints específicos, por exemplo:
  curl -F name=Joao -F email=joao@exemplo.com -F message="Teste" http://192.168.100.117:3000/contact
  ```
- Frontend (Preview):
  - `http://192.168.100.117:4173/`
- Frontend (Nginx):
  - `http://192.168.100.117/`
- Teste login, cadastro de cliente e upload de imagens.

## 8) Atualizações e manutenção
- Atualizar o código (git pull, novo zip, etc.).
- Backend:
  ```bash
  cd ~/TesteTS_Backend/backend
  npm install
  npm run build
  npm start            # ou reinicie o serviço systemd
  ```
- Frontend:
  ```bash
  cd ~/TesteTS_Backend/frontend
  npm install
  npm run build
  # Se Nginx:
  sudo cp -r ~/TesteTS_Backend/frontend/dist/* /var/www/testets-frontend/
  sudo systemctl reload nginx
  ```

## 9) Problemas comuns (diagnóstico)
- Node/npm não encontrados:
  - Reinstale Node 20.x via NodeSource.
- Não acessa pela rede:
  - Verifique `ufw status`, libere portas usadas.
  - Confirme IP do servidor: `ip a` (use `192.168.100.117`).
  - No preview do Vite, não esqueça `--host`.
- Erros de build:
  - Rode `npm install` nas duas pastas.
  - Verifique versão do Node (`>= 18`, ideal `20`).
- Prisma:
  - Se migrações falham, cheque `prisma/schema.prisma` e use `npx prisma migrate deploy`.
- Permissões Nginx:
  - Garanta leitura em `/var/www/testets-frontend` por `www-data`:
    ```bash
    sudo chown -R www-data:www-data /var/www/testets-frontend
    ```
- CORS (se usar domínios/portas diferentes):
  - Ajuste a API para permitir a origem do frontend ou use proxy Nginx.

## 10) Checklist final
- [ ] Backend em execução (porta 3000) e acessível de outro dispositivo.
- [ ] Frontend servindo (Preview em 4173 ou Nginx em 80) e apontando para a API (`VITE_API_URL`).
- [ ] Portas liberadas no firewall (`3000`, `4173`, `80/443`).
- [ ] Uploads e funcionalidades testadas (clientes, contato, imagens).

Pronto! Com esses passos, o site e a API devem estar acessíveis em `192.168.100.117` dentro da sua rede local.