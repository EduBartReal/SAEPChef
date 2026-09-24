const recipesContainer = document.getElementById("recipes-container");
const recipesMessage = document.getElementById("recipes-message");

const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-modal");
const closeLogin = document.getElementById("close-login");
const cancelLogin = document.getElementById("cancel-login");
const loginForm = document.getElementById("login-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const loginError = document.getElementById("login-error");

const userName = document.getElementById("user-name");
const userPhoto = document.getElementById("user-photo");
const profileBtn = document.getElementById("profile-btn");

const profileMenu = document.getElementById("profile-menu");
const closeProfile = document.getElementById("close-profile");

const profilePhoto = document.getElementById("profile-photo");
const profileName = document.getElementById("profile-name");

const totalFavorites = document.getElementById("total-favorites");
const totalRecipes = document.getElementById("total-recipes");

const myRecipesBtn = document.getElementById("my-recipes-btn");
const myRecipesContainer = document.getElementById("my-recipes-container");

const logoutBtn = document.getElementById("logout-btn");


async function carregarReceitas() {
    try {
        const response = await fetch("http://localhost:3000/receitas");

        if (!response.ok) {
            throw new Error("Erro ao buscar receitas.");
        }

        const receitas = await response.json();

        recipesContainer.innerHTML = "";

        if (receitas.length === 0) {
            recipesMessage.textContent = "Nenhuma receita encontrada.";
            return;
        }

        recipesMessage.textContent = "";

        receitas.forEach((receita) => {
            const card = document.createElement("div");

            card.classList.add("recipe-card");

            card.innerHTML = `
                <img
                    src="/frontend/assets/receitas/${receita.url_imagem}"
                    alt="${receita.titulo_receita}"
                >

                <h3>${receita.titulo_receita}</h3>

                <button
                    class="favorite"
                    data-id="${receita.id_receita}"
                    type="button"
                >
                    <span class="estrela"></span>
                    <span class="favorite-count">0</span>
                </button>
            `;

            recipesContainer.appendChild(card);
        });

        await carregarEstadoFavoritos();

    } catch (error) {
        console.error(error);
        recipesMessage.textContent = "Erro ao carregar as receitas.";
    }
}


async function carregarEstadoFavoritos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    let favoritosUsuario = [];

    if (usuario) {
        try {
            const response = await fetch(
                `http://localhost:3000/favoritos/${usuario.id_usuario}`
            );

            if (response.ok) {
                favoritosUsuario = await response.json();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const botoes = document.querySelectorAll(".favorite");

    for (const botao of botoes) {
        const idReceita = botao.dataset.id;

        try {
            const responseContador = await fetch(
                `http://localhost:3000/receitas/${idReceita}/favoritos`
            );

            if (!responseContador.ok) {
                continue;
            }

            const dadosContador = await responseContador.json();

            const contador = botao.querySelector(".favorite-count");

            contador.textContent = dadosContador.total;

            const jaFavoritou = favoritosUsuario.some(
                (favorito) =>
                    Number(favorito.id_receita) === Number(idReceita)
            );

            botao.classList.toggle("ativo", jaFavoritou);

        } catch (error) {
            console.error(error);
        }
    }

    await atualizarTotalFavoritos();
}


async function atualizarTotalFavoritos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        if (totalFavorites) {
            totalFavorites.textContent = "0";
        }

        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/favoritos/${usuario.id_usuario}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar favoritos.");
        }

        const favoritos = await response.json();

        if (totalFavorites) {
            totalFavorites.textContent = favoritos.length;
        }

    } catch (error) {
        console.error(error);
    }
}


async function atualizarTotalReceitas() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        if (totalRecipes) {
            totalRecipes.textContent = "0";
        }

        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/receitas/usuario/${usuario.id_usuario}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar receitas do usuário.");
        }

        const receitas = await response.json();

        if (totalRecipes) {
            totalRecipes.textContent = receitas.length;
        }

    } catch (error) {
        console.error(error);
    }
}


document.addEventListener("click", async (event) => {
    const botaoFavorito = event.target.closest(".favorite");

    if (!botaoFavorito) {
        return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        alert("Faça login para favoritar uma receita.");
        return;
    }

    const idReceita = botaoFavorito.dataset.id;

    try {
        const response = await fetch(
            "http://localhost:3000/favoritos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_usuario: usuario.id_usuario,
                    id_receita: idReceita
                })
            }
        );

        const dados = await response.json();

        if (!response.ok) {
            alert(dados.mensagem);
            return;
        }

        botaoFavorito.classList.toggle(
            "ativo",
            dados.favorito
        );

        const responseContador = await fetch(
            `http://localhost:3000/receitas/${idReceita}/favoritos`
        );

        if (responseContador.ok) {
            const dadosContador = await responseContador.json();

            const contador =
                botaoFavorito.querySelector(".favorite-count");

            contador.textContent = dadosContador.total;
        }

        await atualizarTotalFavoritos();

    } catch (error) {
        console.error(error);
        alert("Erro ao favoritar receita.");
    }
});


async function carregarMinhasReceitas() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        return;
    }

    myRecipesContainer.innerHTML = "";

    try {
        const response = await fetch(
            `http://localhost:3000/receitas/usuario/${usuario.id_usuario}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar suas receitas.");
        }

        const receitas = await response.json();

        if (receitas.length === 0) {
            myRecipesContainer.textContent =
                "Você ainda não possui receitas.";

            return;
        }

        receitas.forEach((receita) => {
            const receitaItem =
                document.createElement("div");

            receitaItem.classList.add("my-recipe-item");

            receitaItem.innerHTML = `
                <img
                    src="/frontend/assets/receitas/${receita.url_imagem}"
                    alt="${receita.titulo_receita}"
                >

                <div>
                    <h4>${receita.titulo_receita}</h4>
                    <span>${receita.origem_receita}</span>
                </div>
            `;

            myRecipesContainer.appendChild(receitaItem);
        });

    } catch (error) {
        console.error(error);

        myRecipesContainer.textContent =
            "Erro ao carregar suas receitas.";
    }
}


loginBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
});


closeLogin.addEventListener("click", () => {
    loginModal.classList.add("hidden");
});


cancelLogin.addEventListener("click", () => {
    loginModal.classList.add("hidden");
});


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";
    loginError.textContent = "";

    const email = loginEmail.value.trim();
    const senha = loginPassword.value.trim();

    let valido = true;

    if (email === "") {
        emailError.textContent = "Informe o e-mail.";
        valido = false;
    }

    if (senha === "") {
        passwordError.textContent = "Informe a senha.";
        valido = false;
    }

    if (!valido) {
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            }
        );

        const dados = await response.json();

        if (!response.ok) {
            loginError.textContent = dados.mensagem;
            return;
        }

        localStorage.setItem(
            "usuario",
            JSON.stringify(dados)
        );

        userName.textContent =
            "@" + dados.nome_usuario;

        userPhoto.src =
            "/frontend/assets/imagens_usuarios/" +
            dados.imagem_usuario;

        profileBtn.disabled = false;

        loginModal.classList.add("hidden");

        loginForm.reset();

        await carregarEstadoFavoritos();
        await atualizarTotalReceitas();

    } catch (error) {
        console.error(error);

        loginError.textContent =
            "Erro ao conectar com o servidor.";
    }
});


profileBtn.addEventListener("click", async () => {
    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    if (!usuario) {
        return;
    }

    profileName.textContent =
        "@" + usuario.nome_usuario;

    profilePhoto.src =
        "/frontend/assets/imagens_usuarios/" +
        usuario.imagem_usuario;

    await atualizarTotalFavoritos();
    await atualizarTotalReceitas();

    myRecipesContainer.innerHTML = "";

    profileMenu.classList.remove("hidden");
});


closeProfile.addEventListener("click", () => {
    profileMenu.classList.add("hidden");
});


myRecipesBtn.addEventListener("click", async () => {
    if (
        myRecipesContainer.children.length > 0
    ) {
        myRecipesContainer.innerHTML = "";
        return;
    }

    await carregarMinhasReceitas();
});


logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");

    userName.textContent = "@SAEPChef";

    userPhoto.src =
        "/frontend/assets/imagens_usuarios/saepChef.jpg";

    profileName.textContent = "@SAEPChef";

    profilePhoto.src =
        "/frontend/assets/imagens_usuarios/chef1.jpg";

    profileBtn.disabled = true;

    totalFavorites.textContent = "0";
    totalRecipes.textContent = "0";

    myRecipesContainer.innerHTML = "";

    profileMenu.classList.add("hidden");

    carregarReceitas();
});


const usuarioSalvo =
    JSON.parse(localStorage.getItem("usuario"));

if (usuarioSalvo) {
    userName.textContent =
        "@" + usuarioSalvo.nome_usuario;

    userPhoto.src =
        "/frontend/assets/imagens_usuarios/" +
        usuarioSalvo.imagem_usuario;

    profileBtn.disabled = false;

    atualizarTotalFavoritos();
    atualizarTotalReceitas();
}


carregarReceitas();