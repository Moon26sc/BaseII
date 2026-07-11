import { api } from '../api.js';

export async function renderUsuarios(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Gestión de Usuarios</h3>
            <button class="btn btn-primary" id="btn-nuevo-usuario">
                <i class="fas fa-plus"></i> Nuevo Usuario
            </button>
        </div>
        
        <div class="modal fade" id="modalUsuario" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-usuario">
                        <input type="hidden" id="usuario-id">
                        
                        <div class="modal-header"><h5 class="modal-title" id="modal-user-titulo">Agregar Usuario</h5></div>
                        <div class="modal-body">
                            <input type="text" id="nombre_completo" class="form-control mb-3" placeholder="Nombre Completo" required>
                            <input type="email" id="email_usuario" class="form-control mb-3" placeholder="Correo Electrónico" required>
                            <input type="password" id="password_usuario" class="form-control mb-3" placeholder="Contraseña (dejar en blanco para no cambiar)">
                            <select id="rol_usuario" class="form-select mb-3" required>
                                <option value="">Seleccione un rol...</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="VENDEDOR">Vendedor</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-usuarios">
                    <tr><td colspan="5" class="text-center">Cargando usuarios...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarTablaUsuarios(container);

    document.getElementById('btn-nuevo-usuario').addEventListener('click', () => {
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        document.getElementById('password_usuario').setAttribute('required', 'true'); 
        document.getElementById('modal-user-titulo').innerText = 'Agregar Usuario';
        
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).show();
    });

    document.getElementById('form-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('usuario-id').value;
        const data = {
            nombre_completo: document.getElementById('nombre_completo').value,
            email: document.getElementById('email_usuario').value,
            rol: document.getElementById('rol_usuario').value
        };

        const pass = document.getElementById('password_usuario').value;
        if (pass) data.password = pass; 

        try {
            if (id) {
                await api.put(`/usuarios/${id}`, data); 
            } else {
                await api.post('/usuarios', data);
            }
            
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).hide();
            await cargarTablaUsuarios(container);
        } catch (err) { 
            alert("Error al guardar usuario: " + err.message); 
        }
    });
}

async function cargarTablaUsuarios(container) {
    try {
        const usuarios = await api.get('/usuarios'); 
        const tbody = document.getElementById('tabla-usuarios');
        
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.nombre_completo}</td>
                <td>${u.email}</td>
                <td><span class="badge ${u.rol === 'ADMIN' ? 'bg-danger' : 'bg-success'}">${u.rol}</span></td>
                <td>
                    <span class="badge ${u.activo ? 'bg-primary' : 'bg-secondary'}">
                        ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar-user" 
                            data-id="${u.id}" data-nombre="${u.nombre_completo}" 
                            data-email="${u.email}" data-rol="${u.rol}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${u.activo ? 'btn-outline-warning' : 'btn-outline-success'} btn-toggle-user" 
                            data-id="${u.id}" data-estado="${u.activo}">
                        <i class="fas ${u.activo ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-editar-user').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('usuario-id').value = btn.dataset.id;
                document.getElementById('nombre_completo').value = btn.dataset.nombre;
                document.getElementById('email_usuario').value = btn.dataset.email;
                document.getElementById('rol_usuario').value = btn.dataset.rol;
                
                document.getElementById('password_usuario').removeAttribute('required'); 
                document.getElementById('modal-user-titulo').innerText = 'Editar Usuario';
                
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).show();
            });
        });

        document.querySelectorAll('.btn-toggle-user').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const estadoActual = btn.dataset.estado === 'true';
                const accion = estadoActual ? 'desactivar' : 'activar';
                
                if (confirm(`¿Estás seguro de ${accion} este usuario?`)) {
                    await api.patch(`/usuarios/${id}/estado`, { activo: !estadoActual });
                    await cargarTablaUsuarios(container);
                }
            });
        });

    } catch (err) {
        document.getElementById('tabla-usuarios').innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar usuarios</td></tr>`;
    }
}