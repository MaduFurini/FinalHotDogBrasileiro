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

    const { nome, preco } = produto;

    const existingProduct = cart.find(item => item.nome === nome);
    if (existingProduct) {
        existingProduct.quantidade++;
    } else {
        cart.push({ nome, preco, quantidade: 1 });
    }

    renderCartItems();
    toggleCart();
}

function toggleCart() {
    const cartModal = document.getElementById("cartModal");
    if (cartModal) {
        cartModal.classList.toggle("show");
    }
}

function renderCartItems() {
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
            <p>${item.nome} - R$${item.preco.toFixed(2)}</p>
            <div class="quantity-container">
                <button onclick="updateQuantity('${item.nome}', 'decrement')">-</button>
                <input type="number" disabled id="quantidade_${item.nome}" value="${item.quantidade}" min="1" onchange="updateQuantity('${item.nome}', 'input')">
                <button onclick="updateQuantity('${item.nome}', 'increment')">+</button>
            </div>
            <button class="delete-button" onclick="removeFromCart('${item.nome}')">Excluir</button>
        `;
        cartItemsContainer.appendChild(cartItem);

        totalPrice += item.preco * item.quantidade;
    });

    if (totalPriceContainer) {
        totalPriceContainer.innerHTML = `Total: R$${totalPrice.toFixed(2)}`;
    }

    if (nextButtonContainer) {
        nextButtonContainer.innerHTML = `<button onclick="nextStep()" class="btn btn-second">Próximo</button>`;
    }

    toggleCartIcon();
}

function removeFromCart(nome) {
    cart = cart.filter(item => item.nome !== nome);
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

function updateQuantity(nome, action) {
    const product = cart.find(item => item.nome === nome);
    const quantityInput = document.getElementById(`quantidade_${nome}`);

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

