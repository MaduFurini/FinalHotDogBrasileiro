let cart = [];

async function addToCart(user, produtoId) {
    user = user.user;

    if (!user) {
        window.location.href = '/login';
        return;
    }

    const produto = await fetch(`/produtos/${produtoId}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Erro ao buscar o produto:', error);
        });

    const { nome, preco, id } = produto;

    const existingProduct = cart.find(item => item.nome === nome);
    if (existingProduct) {
        existingProduct.quantidade++;
    } else {
        cart.push({ nome, preco, id, quantidade: 1 });
    }

    renderCartItems(user);
    toggleCart();
}

function toggleCart() {
    const cartModal = document.getElementById("cartModal");
    if (cartModal) {
        cartModal.classList.toggle("show");
    }
}

function renderCartItems(user) {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalPriceContainer = document.getElementById("totalPrice");
    const nextButtonContainer = document.getElementById("nextButton");

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    let totalPrice = 0;

    cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
        <input type="hidden" id="id_${item.id}" value="${item.id}">
        
        <p>${item.nome} - R$${item.preco.toFixed(2)}</p>
        <div class="quantity-container">
            <button onclick="updateQuantity('${item.id}', 'decrement')">-</button>
            <input type="number" disabled id="quantidade_${item.id}" value="${item.quantidade}" min="1" onchange="updateQuantity('${item.id}', 'input')">
            <button onclick="updateQuantity('${item.id}', 'increment')">+</button>
        </div>
        <button class="delete-button" onclick="removeFromCart('${item.id}')">Excluir</button>
    `;

        cartItemsContainer.appendChild(cartItem);
        totalPrice += item.preco * item.quantidade;
    });

    if (totalPriceContainer) {
        totalPriceContainer.innerHTML = `Total: R$${totalPrice.toFixed(2)}`;
    }

    if (nextButtonContainer) {
        nextButtonContainer.innerHTML = `
            <button onclick="nextStep(this)" class="btn btn-second" data-user='${JSON.stringify(user)}'>Próximo</button>
        `;
    }

    toggleCartIcon();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCartItems();
}

function toggleCartIcon() {
    const cartPullIcon = document.getElementById("cartPullIcon");
    if (cart.length > 0) {
        cartPullIcon.style.display = "flex";
    } else {
        cartPullIcon.style.display = "none";
    }
}
function openCartModal() {
    const cartModal = document.getElementById("cartModal");
    if (cartModal) {
        cartModal.classList.add("show");
    }
}

function updateQuantity(id, action) {
    const product = cart.find(item => item.id === id);
    const quantityInput = document.getElementById(`quantidade_${id}`);

    if (product) {
        if (action === 'increment') {
            product.quantidade++;
        } else if (action === 'decrement' && product.quantidade > 1) {
            product.quantidade--;
        } else if (action === 'input') {
            product.quantidade = Math.max(1, parseInt(quantityInput.value, 10));
        }

        quantityInput.value = product.quantidade;
        renderCartItems();
    }
}

// Função para esconder o cartItems
function hideCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'none'; // Esconde o container
    }
}

// Função para mostrar o cartItems
function showCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'block'; // Mostra o container
    }
}

// Exemplo de uso no contexto do nextStep
async function nextStep(button) {
    try {
        // Ocultar os itens do carrinho antes de mostrar os endereços
        hideCartItems();

        const observacao = document.getElementById("observacao").value;
        const totalPrice = cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const user = JSON.parse(button.getAttribute('data-user'));

        const cartData = {
            produtos: cart.map(item => {
                return { id: item.id, quantidade: item.quantidade };
            }),
            observacao: observacao,
            valorTotal: totalPrice
        };

        console.log(23123)
        const response = await fetch('/enderecos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: user })
        });

        console.log(await response)
        const enderecos = await response;
        console.log(enderecos)

        const cartItemsContainer = document.getElementById("cartItems");
        const addressContainer = document.getElementById("addressContainer");

        if (!addressContainer) return;

        addressContainer.innerHTML = "";

        if (enderecos.length > 0) {
            console.log(123123)
            enderecos.forEach(endereco => {
                console.log(endereco)
                const addressItem = document.createElement("div");
                addressItem.classList.add("address-item");
                addressItem.innerHTML = `
                    <p><strong>${endereco.nome}</strong></p>
                    <p>${endereco.rua}, ${endereco.numero}</p>
                    <p>${endereco.cidade} - ${endereco.estado}</p>
                    <p>CEP: ${endereco.cep}</p>
                `;
                addressContainer.appendChild(addressItem);
            });
        } else {
            console.log(6675);
            addressContainer.innerHTML = "<p>Não há endereços.</p>";
            const novoEnderecoBtn = document.createElement("button");
            novoEnderecoBtn.innerText = "Novo Endereço";
            novoEnderecoBtn.classList.add("btn", "btn-primary");
            novoEnderecoBtn.onclick = () => window.location.href = "/novo-endereco";
            addressContainer.appendChild(novoEnderecoBtn);
        }

        addressContainer.style.display = 'block';

    } catch (error) {
        console.error("Erro ao carregar endereços:", error);
    }
}

