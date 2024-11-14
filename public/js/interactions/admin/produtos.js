
window.onload = function () {
    document.getElementById('searchInput').value = '';
}


document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const productId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`/produtos/status/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar o status do produto');
                }
                return response.json();
            })
            .then(data => {
                console.log('Status atualizado com sucesso:', data);
            })
            .catch(error => {
                this.checked = !newStatus;
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao atualizar o status do produto. Tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-danger'
                    }
                });
            });
    });
});

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = document.getElementById('searchInput').value;

    fetch(`/produtos/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
        });
});

function openCreateModal() {
    fetch('/categorias/all')
        .then(response => response.json())
        .then(categorias => {
            const options = categorias.map(categoria => `
                <option value="${categoria.id}">${categoria.nome}</option>
            `).join('');

            Swal.fire({
                title: 'Criar novo produto',
                html: `
                    <form id="createForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="nome">Nome do Produto *</label>
                            <input type="text" class="input" id="nome" name="nome" required>
                        </div>
                        <div class="form-group">
                            <label for="categoria">Categoria * </label>
                            <select id="categoria" name="id_categoria" class="input" required>
                                <option value="" disabled selected>Selecione uma categoria</option>
                                ${options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="descricao">Descrição do Produto</label>
                            <input type="text" class="input" id="descricao" name="descricao">
                        </div>
                        <div class="form-group">
                            <label for="preco">Preço do Produto *</label>
                            <input type="number" class="input" id="preco" name="preco" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="imagem">Foto do Produto</label>
                            <input type="file" id="imagem" name="imagem">
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Criar Produto',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'btn-danger'
                },
                preConfirm: () => {
                    const form = document.getElementById('createForm');
                    if (!form.checkValidity()) {
                        Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios!');
                        return false;
                    }
                    const formData = new FormData(form);

                    return fetch('/produto/create', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Erro ao criar o produto');
                            }
                        })
                        .catch(error => {
                            Swal.showValidationMessage(`Erro: ${error}`);
                        });
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Produto criado com sucesso.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn-danger'
                        }
                    });

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            });
        })
        .catch(error => {
            Swal.fire('Erro', 'Erro ao carregar categorias', 'error');
        });
}

function openUpdateModal(productId) {
    fetch(`/produtos/${productId}`)
        .then(response => response.json())
        .then(produto => {
            if (produto) {
                fetch('/categorias/all')
                    .then(response => response.json())
                    .then(categorias => {
                        const options = categorias.map(categoria => `
                            <option value="${categoria.id}" ${categoria.id === produto.id_categoria ? 'selected' : ''}>
                                ${categoria.nome}
                            </option>
                        `).join('');

                        Swal.fire({
                            title: 'Editar produto',
                            html: `
                                <form id="updateForm" enctype="multipart/form-data">
                                    <input type="hidden" id="productId" name="id" value="${produto.id}">
                                    <div class="form-group">
                                        <label for="nomeUpdate">Nome do Produto</label>
                                        <input type="text" class="input" id="nomeUpdate" name="nome" value="${produto.nome}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="categoriaUpdate">Categoria</label>
                                        <select id="categoriaUpdate" name="id_categoria" class="input" required>
                                            <option value="" disabled>Selecione uma categoria</option>
                                            ${options}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="descricaoUpdate">Descrição do Produto</label>
                                        <input type="text" class="input" id="descricaoUpdate" name="descricao" value="${produto.descricao}">
                                    </div>
                                    <div class="form-group">
                                        <label for="precoUpdate">Preço do Produto</label>
                                        <input type="number" class="input" id="precoUpdate" name="preco" step="0.1" value="${produto.preco}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="imagemUpdate">Foto do Produto</label>
                                        <input type="file" id="imagemUpdate" name="imagemUpdate">
                                    </div>
                                    <button id="removeImageBtn" class="btn btn-success" style="margin-left: 5px;" onclick="removeImage(${produto.id})">Remover Imagem</button>
                                </form>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'Atualizar Produto',
                            cancelButtonText: 'Cancelar',
                            customClass: {
                                confirmButton: 'btn-danger'
                            },
                            preConfirm: () => {
                                const formData = new FormData(document.getElementById('updateForm'));

                                return fetch(`/produtos/update/${produto.id}`, {
                                    method: 'POST',
                                    body: formData
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Erro ao atualizar o produto');
                                        }
                                    })
                                    .catch(error => {
                                        Swal.showValidationMessage(`Erro: ${error}`);
                                    });
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: 'Sucesso!',
                                    text: 'Produto atualizado com sucesso.',
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    customClass: {
                                        confirmButton: 'btn-danger'
                                    }
                                });

                                setTimeout(() => {
                                    location.reload();
                                }, 1500);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao carregar categorias:', error);
                        Swal.fire('Erro', 'Erro ao carregar categorias', 'error');
                    });
            } else {
                console.error('Produto não encontrado');
                Swal.fire('Erro', 'Produto não encontrado', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            Swal.fire('Erro', 'Erro ao buscar produto', 'error');
        });
}

function deleteProduct(productId) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Essa ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-second'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/produtos/delete/${productId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na requisição: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.message) {
                        if (data.message === 'Produto excluído com sucesso') {
                            Swal.fire({
                                title: 'Excluído!',
                                text: 'O produto foi excluído.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn-danger'
                                }
                            })

                            setTimeout(() => {
                                location.reload();
                            }, 1500);
                        } else if (data.message === 'Produto inativado devido a vínculos existentes') {
                            Swal.fire({
                                title: 'Produto inativado!',
                                text: 'O produto não pôde ser excluído, pois possui vínculos.',
                                icon: 'info',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn-danger'
                                }
                            })

                            setTimeout(() => {
                                location.reload();
                            }, 1500);
                        } else {
                            Swal.fire(
                                'Erro!',
                                'Ocorreu um erro ao excluir o produto.',
                                'error'
                            );
                        }
                    } else {
                        Swal.fire(
                            'Erro!',
                            'Resposta do servidor inválida.',
                            'error'
                        );
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir produto:', error);
                    Swal.fire('Erro!', 'Erro ao excluir produto.', 'error');
                });
        }
    });
}

async function getCategoryNameById(id) {
    const response = await fetch(`/categorias/${id}`);
    const data = await response.json();
    return data.nome;
}

async function renderProducts(products) {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = '';
    if (products.length > 0) {
        for (const product of products) {
            const row = document.createElement('tr');
            const categoryName = await getCategoryNameById(product.id_categoria);

            row.innerHTML = `
                <td>
                    <img src="${product.img}" alt="${product.nome}" class="product-image">
                </td>
                <td>${product.nome}</td>
                <td>${product.descricao}</td>
                <td>${categoryName}</td> 
                <td>
                    <label class="switch">
                        <input type="checkbox" class="status-checkbox" data-id="${product.id}" ${product.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button id="editBtn" class="btn btn-success" style="margin-right: 5px;" onclick="openUpdateModal(${product.id})">Editar</button>
                    <button id="deleteBtn" class="btn btn-danger" onclick="deleteProduct(${product.id})">Excluir</button>
                </td>
            `;
            productContainer.appendChild(row);
        }
    } else {
        productContainer.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Não há produtos cadastrados</td>
            </tr>
        `;
    }
}
function cleanFilter() {
    document.getElementById('searchInput').value = '';

    const searchTerm = document.getElementById('searchInput').value;

    fetch(`produtos/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
        });
}

function removeImage(productId) {
    Swal.fire({
        title: 'Remover Imagem',
        text: 'Você tem certeza que deseja remover a imagem deste produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn-danger',
            cancelButton: 'btn-secondary'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/produtos/removeImage/${productId}`, {
                method: 'PUT'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao remover a imagem');
                    }
                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Imagem removida com sucesso',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn-danger'
                        }
                    })

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                })
                .catch(error => {
                    Swal.fire('Erro', `Erro ao remover a imagem: ${error}`, 'error');
                });
        }
    });
}

