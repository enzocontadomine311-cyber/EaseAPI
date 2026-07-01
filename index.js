const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Puxa as configurações das variáveis de ambiente da Render
const config = {
    authorization: process.env.AUTHORIZATION || "",
    clientid: process.env.CLIENTID || "",
    secret: process.env.SECRET || "",
    url: process.env.URL || "https://easeapi-pkaq.onrender.com",
    guild_id: process.env.GUILD_ID || "",
    role: process.env.ROLE || "",
    token: process.env.TOKEN || ""
};

const PORT = process.env.PORT || 3000;

// Rota Principal: Entrega o visual bonito para o usuário
app.get('/', (req, res) => {
    const { username, avatar, success, error } = req.query;

    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EaseAPI - Verificar Conta</title>
        <style>
            body {
                background-color: #23272a;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background-color: #2c2f33;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }
            .avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                border: 4px solid #5865F2;
                margin-bottom: 20px;
                background-color: #23272a;
            }
            h2 { margin: 10px 0; font-size: 24px; }
            p { color: #b9bbbe; font-size: 14px; margin-bottom: 30px; }
            .btn-discord {
                background-color: #5865F2;
                color: white;
                padding: 14px 28px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                transition: background 0.2s;
                display: inline-block;
            }
            .btn-discord:hover { background-color: #4752C4; }
            .success-msg { color: #43b581; font-weight: bold; font-size: 16px; }
            .error-msg { color: #f04747; font-weight: bold; font-size: 16px; }
        </style>
    </head>
    <body>
        <div class="card">
            <img id="avatar" class="avatar" src="${avatar ? avatar : 'https://discord.com/assets/c09a43a372ba81e1957e3138bde781d4.png'}" alt="Avatar">
            <h2>${username ? 'Olá, ' + username + '!' : 'Verificação Obligatória'}</h2>
            
            <p id="status-text">
                ${success === 'true' ? '<span class="success-msg">✅ Cargo adicionado com sucesso! Já pode fechar esta aba.</span>' : 
                  error ? `<span class="error-msg">❌ Erro: ${error}</span>` : 
                  'Para entrar no servidor e receber seu cargo automaticamente, clique no botão abaixo para se verificar.'}
            </p>
            
            ${!username && !error ? `<a href="/login" class="btn-discord">Logar com o Discord</a>` : ''}
        </div>
    </body>
    </html>
    `);
});

// Rota de Login: Redireciona o usuário para o OAuth2 do Discord
app.get('/login', (req, res) => {
    const redirectUri = encodeURIComponent(`${config.url}/callback`);
    const discordLoginUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientid}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.join`;
    res.redirect(discordLoginUrl);
});

// Rota de Callback: Processa os dados do Discord e dá o cargo
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/?error=Codigo_de_autorizacao_nao_encontrado');
    }

    try {
        // 1. Troca o código pelo Token de Acesso do usuário
        const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
            client_id: config.clientid,
            client_secret: config.secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: `${config.url}/callback`
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. Puxa o perfil do usuário (Nome e Avatar)
        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const user = userResponse.data;
        const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://discord.com/assets/c09a43a372ba81e1957e3138bde781d4.png';

        // 3. Dá o cargo para o usuário no servidor via Bot
        try {
            await axios.put(`https://discord.com/api/v10/guilds/${config.guild_id}/members/${user.id}/roles/${config.role}`, {}, {
                headers: { Authorization: `Bot ${config.token}` }
            });

            // Redireciona de volta mostrando o sucesso, o nome e a foto dele
            res.redirect(`/?username=${encodeURIComponent(user.username)}&avatar=${encodeURIComponent(avatarUrl)}&success=true`);
        } catch (roleError) {
            console.error("Erro ao dar cargo:", roleError.response?.data || roleError.message);
            res.redirect(`/?username=${encodeURIComponent(user.username)}&avatar=${encodeURIComponent(avatarUrl)}&error=O_Bot_nao_conseguiu_dar_o_cargo`);
        }

    } catch (error) {
        console.error("Erro no processo OAuth2:", error.response?.data || error.message);
        res.redirect('/?error=Falha_na_autenticacao');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});