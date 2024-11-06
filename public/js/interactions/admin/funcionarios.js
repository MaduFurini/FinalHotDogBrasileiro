window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const productId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`/funcionarios/status/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar o status do funcionário');
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
                    text: 'Erro ao atualizar o status do funcionário. Tente novamente.',
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

    fetch(`/funcionarios/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar funcionários:', error);
        });
});

function openCreateModal() {
    Swal.fire({
        title: 'Criar novo funcionário',
        html: `
            <form id="createForm">
                <div class="form-group">
                    <label for="nome">Nome do funcionário*</label>
                    <input type="text" class="input" id="nome" name="nome" required>
                </div>
                <div class="form-group">
                    <label for="cpf">CPF do funcionário</label>
                    <input type="text" class="input" id="cpf" name="cpf">
                </div>
                <div class="form-group">
                    <label for="email">Email do funcionário*</label>
                    <input type="text" class="input" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="senha">Senha do funcionário*</label>
                    <input type="password" class="input" id="senha" name="senha" required>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Criar Funcionário',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn-danger'
        },
        preConfirm: () => {
            const nome = document.getElementById('nome').value;
            const cpf = document.getElementById('cpf').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            return fetch('/funcionario/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, cpf, email, senha })
            })
                .then(async (response) => {
                    const data = await response;

                    if (!data.ok) {
                        throw new Error(data.message || 'Erro ao criar o funcionário');
                    }
                })
                .catch(error => {
                    Swal.showValidationMessage(`Erro: ${error.message}`);
                });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sucesso!',
                text: 'Funcionário criado com sucesso.',
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
}

function openUpdateModal(productId) {
    fetch(`/funcionarios/${productId}`)
        .then(response => response.json())
        .then(funcionario => {
            if (funcionario) {
                Swal.fire({
                    title: 'Editar funcionário',
                    html: `
                        <form id="updateForm" >
                            <div class="form-group">
                                <label for="nome">Nome do funcionário</label>
                                <input type="text" class="input" id="nome" name="nome">
                            </div>
                            <div class="form-group">
                                <label for="cpf">CPF do funcionário</label>
                                <input type="text" class="input" id="cpf" name="cpf">
                            </div>
                            <div class="form-group">
                                <label for="email">Email do funcionário</label>
                                <input type="text" class="input" id="email" name="email">
                            </div>
                            <div class="form-group">
                                <label for="senha">Senha do funcionário</label>
                                <input type="password" class="input" id="senha" name="senha">
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Atualizar Funcionário',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-danger'
                    },
                    preConfirm: () => {
                        const nome = document.getElementById('nome').value;
                        const cpf = document.getElementById('cpf').value;
                        const email = document.getElementById('email').value;
                        const senha = document.getElementById('senha').value;


                        return fetch(`/funcionarios/update/${funcionario.id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ nome: nome, cpf: cpf, email: email, senha: senha  })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erro ao atualizar o funcionário');
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
                            text: 'Funcionário atualizado com sucesso.',
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
                console.error('Funcionário não encontrada');
                Swal.fire('Erro', 'Funcionário não encontrada', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar funcionário:', error);
            Swal.fire('Erro', 'Erro ao buscar funcionário', 'error');
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
            fetch(`/funcionarios/delete/${productId}`, {
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
                        if (data.message === 'Funcionário excluído com sucesso') {
                            Swal.fire({
                                title: 'Excluído!',
                                text: 'O funcionário foi excluída.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn-danger'
                                }
                            })

                            setTimeout(() => {
                                location.reload();
                            }, 1500);
                        } else if (data.message === 'Funcionário inativado devido a vínculos existentes') {
                            Swal.fire({
                                title: 'Funcionário inativado!',
                                text: 'O funcionário não pôde ser excluído, pois possui vínculos.',
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
                                'Ocorreu um erro ao excluir o funcionário.',
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
                    console.error('Erro ao excluir funcionário:', error);
                    Swal.fire('Erro!', 'Erro ao excluir funcionário.', 'error');
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
                <td>${product.cpf}</td>
                <td>${product.email}</td>
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
                <td colspan="5" style="text-align: center;">Não há funcionários cadastrados</td>
            </tr>
        `;
    }
}

function cleanFilter() {
    document.getElementById('searchInput').value = '';

    const searchTerm = document.getElementById('searchInput').value;

    fetch(`funcionarios/search?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar funcionários:', error);
        });
}

