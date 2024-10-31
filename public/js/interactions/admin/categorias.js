
window.onload = function () {
    document.getElementById('searchInput').value = '';
}


document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const productId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`/categorias/status/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar o status da categoria');
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
                    text: 'Erro ao atualizar o status da categoria. Tente novamente.',
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

    fetch(`/categorias/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar categorias:', error);
        });
});

function openCreateModal() {
    Swal.fire({
        title: 'Criar nova categoria',
        html: `
            <form id="createForm">
                <div class="form-group">
                    <label for="nome">Nome da categoria</label>
                    <input type="text" class="input" id="nome" name="nome" required>
                </div>
                <div class="form-group">
                    <label for="descricao">Descrição da categoria</label>
                    <input type="text" class="input" id="descricao" name="descricao">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Criar Categoria',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn-danger'
        },
        preConfirm: () => {
            const nome = document.getElementById('nome').value;
            const descricao = document.getElementById('descricao').value;

            return fetch('/categoria/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: nome, descricao: descricao  })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao criar a categoria');
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
                text: 'Categoria criada com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-danger'
                }
            })

            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    });
}

function openUpdateModal(productId) {
    fetch(`/categorias/${productId}`)
        .then(response => response.json())
        .then(categoria => {
            if (categoria) {
                Swal.fire({
                    title: 'Editar categoria',
                    html: `
                        <form id="updateForm" >
                            <div class="form-group">
                                <label for="nome">Nome da categoria</label>
                                <input type="text" class="input" id="nome" name="nome" value="${categoria.nome}">
                            </div>
                            <div class="form-group">
                                <label for="descricao">Descrição da categoria</label>
                                <input type="text" class="input" id="descricao" name="descricao" value="${categoria.descricao}">
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Atualizar Categoria',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-danger'
                    },
                    preConfirm: () => {
                        const nome = document.getElementById('nome').value;
                        const descricao = document.getElementById('descricao').value;

                        return fetch(`/categorias/update/${categoria.id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ nome: nome, descricao: descricao  })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erro ao atualizar o categoria');
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
                            text: 'Categoria atualizada com sucesso.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn-danger'
                            }
                        })

                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    }
                });
            } else {
                console.error('Categoria não encontrada');
                Swal.fire('Erro', 'Categoria não encontrada', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar categoria:', error);
            Swal.fire('Erro', 'Erro ao buscar categoria', 'error');
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
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/categorias/delete/${productId}`, {
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
                        if (data.message === 'Categoria excluída com sucesso') {
                            Swal.fire({
                                title: 'Excluído!',
                                text: 'A categoria foi excluída.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn-danger'
                                }
                            })

                            setTimeout(() => {
                                location.reload();
                            }, 1500);
                        } else if (data.message === 'Categoria inativada devido a vínculos existentes') {
                            Swal.fire({
                                title: 'Categoria inativada!',
                                text: 'O categoria não pôde ser excluído, pois possui vínculos.',
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
                                'Ocorreu um erro ao excluir a categoria.',
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
                    console.error('Erro ao excluir categoria:', error);
                    Swal.fire('Erro!', 'Erro ao excluir categoria.', 'error');
                });
        }
    });
}

function renderProducts(products) {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = '';
    if (products.length > 0) {
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nome}</td>
                <td>
                    ${product.descricao ? product.descricao : ''}
                </td>
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
        });
    } else {
        productContainer.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Não há categorias cadastradas</td>
            </tr>
        `;
    }
}

function cleanFilter() {
    document.getElementById('searchInput').value = '';

    const searchTerm = document.getElementById('searchInput').value;

    fetch(`categorias/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar categorias:', error);
        });
}

