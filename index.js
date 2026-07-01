const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000; // Porta padrão da Render

// --- CONFIGURAÇÕES DO SEU APP DISCORD (Preencha com os seus dados se tiver) ---
const CLIENT_ID = 'SEU_CLIENT_ID_AQUI'; 
const REDIRECT_URI = 'https://easeapi-pkaq.onrender.com/callback'; 
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;

// Rota Principal: Envia a interface visual bonita do Discord
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EaseAPI - Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=gg+sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'gg sans', 'Helvetica Neue', Arial, sans-serif;
            }

            body {
                background-color: #313338; /* Fundo escuro oficial do Discord */
                color: #dbdee1;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }

            .container {
                background-color: #1e1f22; /* Card mais escuro de fundo */
                width: 100%;
                max-width: 480px;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                text-align: center;
            }

            .logo-area {
                margin-bottom: 24px;
            }

            .logo-icon {
                width: 80px;
                height: 80px;
                background-color: #5865f2; /* Azul Blurple do Discord */
                border-radius: 50%;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 16px;
            }

            .logo-icon svg {
                width: 45px;
                height: 45px;
                fill: #ffffff;
            }

            h1 {
                color: #f2f3f5;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            p {
                color: #b5bac1;
                font-size: 16px;
                margin-bottom: 32px;
                line-height: 1.4;
            }

            .btn-discord {
                background-color: #5865f2;
                color: #ffffff;
                border: none;
                width: 100%;
                padding: 14px 24px;
                font-size: 16px;
                font-weight: 600;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s ease, transform 0.1s ease;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                text-decoration: none;
            }

            .btn-discord:hover {
                background-color: #4752c4;
            }

            .btn-discord:active {
                transform: scale(0.98);
            }

            .btn-discord svg {
                width: 24px;
                height: 24px;
                fill: #ffffff;
            }
        </style>
    </head>
    <body>

        <div class="container">
            <div class="logo-area">
                <div class="logo-icon">
                    <!-- Ícone do Discord -->
                    <svg viewBox="0 0 127.14 96.36">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.71-11,68.6,68.6,0,0,1-10.57-5.1c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,72.7,0c.82.71,1.68,1.4,2.58,2a68.86,68.86,0,0,1-10.57,5.1,74.91,74.91,0,0,0,6.71,11,105.54,105.54,0,0,0,31.06-18.83C129.87,48,124.16,25.21,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.92,46,53.72,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.16,46,96,53,91,65.69,84.69,65.69Z"/>
                    </svg>
                </div>
                <h1>EaseAPI</h1>
                <p>Conecte sua conta do Discord para gerenciar sua aplicação com facilidade.</p>
            </div>

            <!-- Botão que envia o usuário para o Login do Discord -->
            <a href="${DISCORD_AUTH_URL}" class="btn-discord">
                Entrar com o Discord
            </a>
        </div>

    </body>
    </html>
    `);
});

// Rota de Callback (Para onde o Discord manda o usuário depois do login)
app.get('/callback', (req, res) => {
    const code = req.query.code;
    if (code) {
        res.send("<h1>Login Efetuado com Sucesso!</h1><p>Você já pode fechar esta aba.</p>");
    } else {
        res.status(400).send("<h1>Erro de Autenticação</h1><p>Código de autorização não encontrado.</p>");
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor ativado com sucesso na porta ${PORT}`);
});