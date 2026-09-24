
create type tipo as enum ('chef', 'comum');

create table tb_usuario(
    id_usuario serial primary key,
    nome varchar(255) not null,
    nome_usuario varchar(255) not null,
    email varchar(255) not null,
    senha varchar(255) not null,
    imagem_usuario varchar(255),
    tipo tipo not null,
    created_at timestamp without time zone not null,
    updated_at timestamp without time zone not null
);

create table tb_receita(
    id_receita serial primary key,
    titulo_receita varchar(255) not null,
    origem_receita varchar(255) not null,
    id_usuario integer not null,
    url_imagem varchar(255),
    created_at timestamp without time zone not null,
    updated_at timestamp without time zone not null,

    constraint fk_receita_usuario
    foreign key (id_usuario)
    references tb_usuario(id_usuario)
    on delete cascade
);

create table tb_favoritar(
    id_favorito serial primary key,
    id_usuario integer not null,
    id_receita integer not null,
    created_at timestamp without time zone not null,
    updated_at timestamp without time zone not null,

    constraint fk_favoritar_usuario
    foreign key (id_usuario)
    references tb_usuario(id_usuario)
    on delete cascade,

    constraint fk_favoritar_receita
    foreign key (id_receita)
    references tb_receita(id_receita)
    on delete cascade
);

INSERT INTO tb_usuario (id_usuario,nome,nome_usuario,email,senha,imagem_usuario,tipo,created_at,updated_at
) VALUES
(1, 'Chef Marco Bianchi', 'marcobianchi', 'marco.bianchi@email.com', 'senha123', 'marco.jpg', 'chef', '2026-01-10 09:15:00', '2026-01-10 09:15:00'),

(2, 'Chef Ana Ferreira', 'anaferreira', 'ana.ferreira@email.com', 'senha456', 'ana.jpg', 'chef', '2026-01-12 10:30:00', '2026-01-12 10:30:00'),

(3, 'Chef Lucas Tanaka', 'lucastanaka', 'lucas.tanaka@email.com', 'senha789', 'lucas.jpg', 'chef', '2026-01-14 14:20:00', '2026-01-14 14:20:00'),

(4, 'Mariana Costa', 'marianacosta', 'mariana.costa@email.com', 'senha321', 'mariana.jpg', 'comum', '2026-01-16 08:45:00', '2026-01-16 08:45:00'),

(5, 'Rafael Souza', 'rafaelsouza', 'rafael.souza@email.com', 'senha654', 'rafael.jpg', 'comum', '2026-01-18 11:00:00', '2026-01-18 11:00:00');

select * from tb_usuario