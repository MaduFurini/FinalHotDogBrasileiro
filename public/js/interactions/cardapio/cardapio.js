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
            <button onclick="updateQuantity('${item.nome}', 'decrement')">-</button>
            <input type="number" disabled id="quantidade_${item.nome}" value="${item.quantidade}" min="1" onchange="updateQuantity('${item.id}', 'input')">
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
        nextButtonContainer.innerHTML = `
            <button onclick="nextStep(this)" class="btn btn-second" data-user='${JSON.stringify(user)}'>Próximo</button>
        `;
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

// Função para esconder o cartItems
function hideCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'none';
    }
}

// Função para mostrar o cartItems
function showCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'block';
    }
}

// Exemplo de uso no contexto do nextStep
async function nextStep(button) {
    try {
        hideCartItems();

        const observacao = document.getElementById("observacao").value;
        const totalPrice = cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const user = JSON.parse(button.getAttribute('data-user'));
        const nextButton = document.getElementById('nextButton');
        const backButton = document.getElementById('backButton');

        if (backButton) {
            backButton.innerHTML = `
            <button onclick="backStep(this)" class="btn btn-success" data-user='${JSON.stringify(user)}'>Voltar</button>
        `;
        }

        if (nextButton) {
            nextButton.innerHTML = `
            <button onclick="nextStep(this)" class="btn btn-second" data-user='${JSON.stringify(user)}'>Concluir</button>
        `;
        }

        const observacaoContainer = document.getElementById("observacaoContainer");
        if (observacaoContainer) {
            observacaoContainer.innerHTML = `
                <label for="observacao" id="labelObs">Forma de pagamento</label>
                <select id="observacao">
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                </select>
            `;
        }

        const cartData = {
            produtos: cart.map(item => {
                return { id: item.id, quantidade: item.quantidade };
            }),
            observacao: observacao,
            valorTotal: totalPrice
        };

        const response = await fetch('/enderecos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: user })
        });

        const enderecos = await response.json();

        const cartItemsContainer = document.getElementById("cartItems");
        const addressContainer = document.getElementById("addressContainer");

        if (!addressContainer) return;

        addressContainer.innerHTML = "";

        if (enderecos.length > 0) {
            enderecos.forEach(endereco => {
                const addressItem = document.createElement("div");
                addressItem.classList.add("address-item");

                addressItem.innerHTML = `
                <input type="radio" name="selectedAddress" value="${endereco.id}" id="address_${endereco.id}" onclick="selectAddress(${endereco.id})">
                <label for="address_${endereco.id}">
                    <p><strong>${endereco.logradouro}</strong></p>
                    <p>${endereco.bairro}, ${endereco.numero}</p>
                    <p>${endereco.cidade} - ${endereco.estado}</p>
                    <p>CEP: ${endereco.cep}</p>
                </label>
        `;
                addressContainer.appendChild(addressItem);
            });
        } else {
            addressContainer.innerHTML = "<p>Não há endereços.</p>";
        }

        let selectedAddressId = null;
        const novoEnderecoBtn = document.createElement("button");
        novoEnderecoBtn.innerText = "Novo Endereço";
        novoEnderecoBtn.classList.add("btn", "btn-success");
        novoEnderecoBtn.onclick = () => newAddress();

        addressContainer.style.display = 'block';
        addressContainer.appendChild(novoEnderecoBtn);

    } catch (error) {
        console.error("Erro ao carregar endereços:", error);
    }
}

function backStep(user) {
    try {
        showCartItems();

        const addressContainer = document.getElementById("addressContainer");
        if (addressContainer) {
            addressContainer.style.display = 'none';
        }

        const nextButtonContainer = document.getElementById("nextButton");
        const backButtonContainer = document.getElementById("backButton");

        if (nextButtonContainer) {
            nextButtonContainer.innerHTML = `
                <button onclick="nextStep(this)" class="btn btn-second" data-user='${JSON.stringify(user)}'>Próximo</button>
            `;
        }

        if (backButtonContainer) {
            backButtonContainer.innerHTML = '';
        }

        const observacaoContainer = document.getElementById("observacaoContainer");
        if (observacaoContainer) {
            observacaoContainer.innerHTML = `
                <label for="observacao" id="labelObs">Observação</label>
                <input type="text" name="observacao" id="observacao"></input>
            `;
        }

    } catch (error) {
        console.error("Erro ao voltar para a etapa anterior:", error);
    }
}

function selectAddress(id) {
    selectedAddressId = id;
}

function newAddress () {
    Swal.fire({
        title: 'Novo Endereço',
        html: `
            <input type="text" id="nome" class="swal2-input" placeholder="Logradouro" required>
            <input type="text" id="bairro" class="swal2-input" placeholder="Bairro" required>
            <input type="text" id="numero" class="swal2-input" placeholder="Número" >
            <input type="text" id="cidade" class="swal2-input" placeholder="Cidade">
            <input type="text" id="estado" class="swal2-input" placeholder="Estado">
            <input type="text" id="comp" class="swal2-input" placeholder="Complemento">
            <input type="text" id="ref" class="swal2-input" placeholder="Referência">
        `,
        confirmButtonText: 'Salvar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        customClass:{
            confirmButton: 'btn btn-second',
            cancelButton: 'btn btn-success'
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const endereco = result.value;

            fetch('/enderecos/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(endereco)
            })
                .then(response => response.json())
                .then(data => {
                    Swal.fire('Sucesso', 'Endereço adicionado com sucesso!', 'success');
                })
                .catch(error => {
                    console.error('Erro ao adicionar o endereço:', error);
                    Swal.fire('Erro', 'Não foi possível adicionar o endereço.', 'error');
                });
        }
    });
}