# SiàgeLab / Laboratório Siage

Experiência de diagnóstico e recomendação capilar usando Node/Express e um front-end modular.

## Rodar localmente (Express)
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
3. Acesse o app em http://localhost:3000/.

## Deploy no GitHub Pages
O front-end estático está pronto na pasta `docs/`. Para publicar via GitHub Pages configure:
- **Branch:** `main`
- **Folder:** `/docs`

A página `docs/index.html` carrega o HTML/CSS/JS estático sem dependências de Express. As chamadas de API continuam apontando para os endpoints (`/familias`, `/api/diagnostico`, `/cronograma`, etc.), que funcionam quando o back-end está rodando em paralelo.
