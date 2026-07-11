import { getUser, login } from './auth.js';
import { renderInventario } from './views/inventario.js';
import { renderUsuarios } from './views/usuarios.js'; 
import { renderVentas } from './views/ventas.js';
import { renderMovimientos } from './views/movimientos.js'; 
import { renderClientes } from './views/clientes.js'; 

const app = document.getElementById('app');

function router() {
    const user = getUser();
    const token = localStorage.getItem('token');

    if (user) {
        renderDashboard(user);
    } else {
        renderLogin();
    }
}

function renderLogin() {
    app.innerHTML = `
        <div class="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div class="card p-4 shadow" style="width: 350px;">
                <h3 class="text-center mb-4">Iniciar Sesión</h3>
                <form id="login-form">
                    <div class="mb-3">
                        <input type="email" id="email" class="form-control" placeholder="Email" required>
                    </div>
                    <div class="mb-3">
                        <input type="password" id="password" class="form-control" placeholder="Contraseña" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Entrar</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await login(email, password);
            router(); 
        } catch (error) {
            alert("Credenciales incorrectas: " + error.message);
        }
    });
}

function renderDashboard(user) {
    const esMujer = user.genero === 'F' || user.genero === 'Mujer'; 
    const colorAvatar = esMujer ? '#e83e8c' : '#0d6efd'; 
    const iconoAvatar = esMujer ? 'fas fa-female' : 'fas fa-user'; 

    app.innerHTML = `
        <div class="d-flex bg-light vh-100 overflow-hidden">
            <nav class="sidebar p-3 overflow-auto" style="min-width: 260px;">
                <div class="brand-logo mb-4 px-2">
                    <h4>PROYECTO BD</h4>
                </div>
                
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="#dashboard" class="nav-link active">
                            <i class="fas fa-chart-pie me-2"></i> Estadísticas
                        </a>
                    </li>
                    
                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Comercial</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#ventas" class="nav-link"><span class="dot bg-success"></span> Ventas</a></li>
                            <li><a href="#clientes" class="nav-link"><span class="dot bg-warning"></span> Clientes</a></li>
                        </ul>
                    </li>

                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Logística</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#inventario" class="nav-link"><span class="dot bg-primary"></span> Productos</a></li>
                            <li><a href="#movimientos" class="nav-link"><span class="dot bg-info"></span> Kardex </a></li>
                        </ul>
                    </li>

                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Administración</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#usuarios" class="nav-link"><span class="dot bg-danger"></span> Usuarios</a></li>
                        </ul>
                    </li>
                    
                    <li class="nav-item mt-auto pt-5">
                        <button id="logout" class="btn btn-outline-light btn-sm w-100 mt-5">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </nav>

            <main class="flex-grow-1 p-4 overflow-auto">
                <header class="d-flex justify-content-end mb-4">
                    <div class="dropdown">
                        <div class="d-flex align-items-center dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer; user-select: none;">
                            <span class="me-3">Bienvenido, <b>${user.nombre_completo || 'Administrador'}</b></span>
                            <div class="shadow-sm text-white" style="background-color: ${colorAvatar}; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="${iconoAvatar} fs-5"></i>
                            </div>
                        </div>
                        
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="min-width: 200px;">
                            <li class="px-3 py-2 text-center">
                                <span class="d-block fw-bold">${user.nombre_completo || 'Admin'}</span>
                                <small class="text-muted">${user.rol || 'Administrador'}</small>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item py-2" href="#perfil">
                                    <i class="fas fa-user-edit me-2 text-muted"></i> Editar Perfil
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#configuracion">
                                    <i class="fas fa-cog me-2 text-muted"></i> Configuración
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger py-2 fw-bold" href="#" id="logout-header">
                                    <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </header>

                <div id="view-content">
                </div>
            </main>
        </div>
    `;

    const renderHomeCards = () => {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <h4 class="mb-4 text-dark fw-bold">Dashboard</h4>
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="card p-4 border-0 shadow-sm">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1 small text-uppercase">Total Users</h6>
                                <h3 class="fw-bold mb-0">20,000</h3>
                            </div>
                            <div class="icon-box bg-primary-soft text-primary" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-users fs-4"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <span class="text-success small fw-bold">▲ +5,000</span>
                            <span class="text-muted small"> Last 30 days</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card p-4 border-0 shadow-sm">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1 small text-uppercase">Total Income</h6>
                                <h3 class="fw-bold mb-0">$42,000</h3>
                            </div>
                            <div class="icon-box bg-success-soft text-success" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-wallet fs-4"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <span class="text-success small fw-bold">▲ +$20,000</span>
                            <span class="text-muted small"> Last 30 days</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const viewContent = document.getElementById('view-content');
    
    renderHomeCards();

    document.querySelector('a[href="#usuarios"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderUsuarios(viewContent);
    });

    document.querySelector('a[href="#ventas"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderVentas(viewContent);
    });

    document.querySelector('a[href="#movimientos"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderMovimientos(viewContent);
    });

    document.querySelector('a[href="#inventario"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderInventario(viewContent);
    });
    
    document.querySelector('a[href="#clientes"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderClientes(viewContent);
    });

    document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');  
        renderHomeCards();
    });

    document.getElementById('logout-header').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        router();
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        router();
    });
}

router();