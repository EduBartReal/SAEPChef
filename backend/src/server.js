import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/receitas", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM tb_receita ORDER BY id_receita`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao buscar receitas."
        });
    }
});

app.get("/receitas/usuario/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM tb_receita
             WHERE id_usuario = $1
             ORDER BY id_receita`,
            [id_usuario]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao buscar suas receitas."
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios."
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM tb_usuario
             WHERE email = $1
             AND senha = $2`,
            [email, senha]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao realizar login."
        });
    }
});

app.post("/favoritos", async (req, res) => {
    try {
        const { id_usuario, id_receita } = req.body;

        if (!id_usuario || !id_receita) {
            return res.status(400).json({
                mensagem: "Usuário e receita são obrigatórios."
            });
        }

        const favoritoExistente = await pool.query(
            `SELECT id_favorito
             FROM tb_favoritar
             WHERE id_usuario = $1
             AND id_receita = $2`,
            [id_usuario, id_receita]
        );

        if (favoritoExistente.rows.length > 0) {
            await pool.query(
                `DELETE FROM tb_favoritar
                 WHERE id_usuario = $1
                 AND id_receita = $2`,
                [id_usuario, id_receita]
            );

            return res.json({
                favorito: false
            });
        }

        await pool.query(
            `INSERT INTO tb_favoritar
            (id_usuario, id_receita, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())`,
            [id_usuario, id_receita]
        );

        res.json({
            favorito: true
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao favoritar receita."
        });
    }
});

app.get("/favoritos/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const result = await pool.query(
            `SELECT id_receita
             FROM tb_favoritar
             WHERE id_usuario = $1`,
            [id_usuario]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao buscar favoritos."
        });
    }
});

app.get("/receitas/:id_receita/favoritos", async (req, res) => {
    try {
        const { id_receita } = req.params;

        const result = await pool.query(
            `SELECT COUNT(*) AS total
             FROM tb_favoritar
             WHERE id_receita = $1`,
            [id_receita]
        );

        res.json({
            total: Number(result.rows[0].total)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao contar favoritos."
        });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});