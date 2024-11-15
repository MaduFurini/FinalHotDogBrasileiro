window.onload = function () {
    document.getElementById('searchInput').value = '';
}


document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const productId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`/pedidos/status/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar o status do pedido');
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
                    text: 'Erro ao atualizar o status do pedido. Tente novamente.',
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

    fetch(`/pedidos/search?codigo=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar categorias:', error);
        });
});

function openUpdateModal(productId) {
    fetch(`/pedidos/${productId}`)
        .then(response => response.json())
        .then(pedido => {
            if (pedido) {
                Swal.fire({
                    title: 'Editar pedido',
                    html: `
                        <form id="updateForm" >
                            <div class="form-group">
                                <label for="observacao">Observação</label>
                                <input type="text" class="input" id="observacao" name="observacao" value="${pedido.observacao}">
                            </div>
                            <div class="form-group">
                                <label for="valor">Valor total</label>
                                <input type="number" class="input" id="valor" name="valor" step="0.1" value="${pedido.valorTotal}" disabled>
                            </div>
                            <div class="form-group">
                                <label for="status">Status</label>
                                <select id="status" name="status" class="input">
                                    <option value="" disabled selected>Selecione um status</option>
                                    <option value="Realizado">Realizado</option>
                                    <option value="Em andamento">Em andamento</option>
                                    <option value="Entregue">Entregue</option>
                                    <option value="Cancelado">Cancelado</option>
                                    <option value="Inativado">Inativado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="pag">Forma pagamento</label>
                                <select id="pag" name="pag" class="input">
                                    <option value="" disabled selected>Selecione uma forma de pagamento</option>
                                    <option value="debito">Débito</option>
                                    <option value="credito">Crédito</option>
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="pix">Pix</option>
                                </select>
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Atualizar Pedido',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-danger'
                    },
                    preConfirm: () => {
                        const observacao = document.getElementById('observacao').value;
                        const valor = document.getElementById('valor').value;
                        const status = document.getElementById('status').value;
                        const pag = document.getElementById('pag').value;

                        return fetch(`/pedidos/update/${pedido.id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ observacao: observacao, valor: valor, status: status, pag: pag  })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erro ao atualizar o pedido');
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
                            text: 'Pedido atualizado com sucesso.',
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
                console.error('Pedido não encontrado');
                Swal.fire('Erro', 'Pedido não encontrado', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar pedido', error);
            Swal.fire('Erro', 'Erro ao buscar pedido', 'error');
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
            fetch(`/pedidos/delete/${productId}`, {
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
                        Swal.fire({
                            title: 'Pedido inativada!',
                            text: 'O pedido não pôde ser excluído, pois possui vínculos.',
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
                            'Resposta do servidor inválida.',
                            'error'
                        );
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir pedido:', error);
                    Swal.fire('Erro!', 'Erro ao excluir pedido.', 'error');
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
                <td>${product.codigo}</td>
                <td>${product.observacao}</td>
                <td>R$${product.valorTotal}</td>
                <td>${product.status}</td>
                <td style="position: relative;">
                  <span
                    class="material-symbols-sharp info-icon"
                    style="color: blue; cursor: pointer;"
                    data-id="${product.id}"
                    onmouseover="buscarProdutos(this)"
                    onmouseout="esconderTooltip(this)">
                    info
                  </span>
                  <div class="tooltip" style="display: none;">
                    Carregando...
                  </div>
                </td>
                <td>${product.formaPagamento}</td>
                <td>
                  ${new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'America/Sao_Paulo'
                    }).format(new Date(product.createdAt)) }
                </td>
                <td>
                    <button id="editBtn" class="btn btn-success" style="margin-right: 5px;" onclick="openUpdateModal(<%= pedido.id %>)">Editar</button>
                    <button id="deleteBtn" class="btn btn-danger" onclick="deleteProduct(<%= pedido.id %>)">Excluir</button>
                </td>
                
            `;
            productContainer.appendChild(row);
        });
    } else {
        productContainer.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center;">Não há pedidos cadastrados</td>
            </tr>
        `;
    }
}

function cleanFilter() {
    document.getElementById('searchInput').value = '';

    const searchTerm = document.getElementById('searchInput').value;

    fetch(`pedidos/search?codigo=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar pedidos:', error);
        });
}

function buscarProdutos(element) {
    const pedidoId = element.getAttribute('data-id');
    const tooltip = element.nextElementSibling;

    tooltip.style.display = 'block';
    tooltip.textContent = 'Carregando...';

    fetch(`/pedidos/${pedidoId}/produtos`)
        .then(response => {
            console.log(response)
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }
            return response.json();
        })
        .then(produtos => {
            tooltip.innerHTML = '';

            if (produtos.length === 0) {
                tooltip.textContent = 'Nenhum produto encontrado.';
                return;
            }

            let nomeClienteExibido = null;

            produtos.forEach(p => {
                console.log(p)
                if (nomeClienteExibido !== p.cliente) {
                    tooltip.innerHTML += `
                        <div>
                            <strong>Cliente:</strong> ${p.cliente}<br>
                        </div>
                            <strong>Endereço:</strong> ${p.endereco.logradouro} - 
                            ${p.endereco.bairro}, ${p.endereco.numero}<br>
                        </div>
                        <hr>
                    `;
                    nomeClienteExibido = p.cliente;
                }

                tooltip.innerHTML += `
                    <br>
                    <div>
                        <strong>Nome do Produto:</strong> ${p.nome}<br>
                        <strong>Quantidade:</strong> ${p.quantidade}
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            tooltip.textContent = 'Erro ao carregar produtos.';
        });
}

function esconderTooltip(element) {
    const tooltip = element.nextElementSibling;
    tooltip.style.display = 'none';
}
