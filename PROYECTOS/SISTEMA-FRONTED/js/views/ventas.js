import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderVentas(container) {
    const user = getUser();
    const esAdmin = user.rol === 'ADMIN';

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-file-invoice-dollar text-success me-2"></i> Historial de Ventas</h3>
            
            ${!esAdmin ? `
                <button class="btn btn-success" id="btn-nueva-venta">+ Registrar Venta</button>
            ` : `
                <span class="badge bg-secondary">Modo Auditoría (Solo Lectura)</span>
            `}
        </div>

        <div class="modal fade" id="modalDetalleVenta" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-bold">Detalle de Venta #<span id="detalle-id"></span></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p class="mb-1 text-muted small">Cliente:</p>
                                <h6 id="detalle-cliente" class="fw-bold">---</h6>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <p class="mb-1 text-muted small">Fecha y Vendedor:</p>
                                <h6 id="detalle-fecha-vendedor">---</h6>
                            </div>
                        </div>
                        
                        <table class="table table-bordered table-sm mt-3">
                            <thead class="table-dark">
                                <tr>
                                    <th>Producto</th>
                                    <th class="text-center">Cant.</th>
                                    <th class="text-end">P. Unitario</th>
                                    <th class="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-detalle-productos">
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="3" class="text-end">TOTAL:</th>
                                    <th class="text-end fs-5 text-success" id="detalle-total">S/ 0.00</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-ventas">
                    <tr><td colspan="6" class="text-center">Cargando historial de ventas...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarHistorialVentas();

    
}

async function cargarHistorialVentas() {
    try {
        const ventas = await api.get('/ventas'); 
        const tbody = document.getElementById('tabla-ventas');
        
        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay ventas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = ventas.map(v => {
            const fechaBD = v.fecha || v.fecha_venta; 
            const fechaMostrada = fechaBD ? new Date(fechaBD).toLocaleString() : 'Sin fecha';

            return `
            <tr>
                <td class="fw-bold text-muted">#00${v.id}</td>
                <td>${fechaMostrada}</td>
                <td>${v.cliente_nombre || 'Cliente General'}</td>
                <td><span class="badge bg-info text-dark">${v.vendedor_nombre}</span></td>
                <td class="fw-bold">S/ ${parseFloat(v.total).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-ver-detalle" data-id="${v.id}">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                </td>
            </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idVenta = btn.dataset.id;
                await abrirModalDetalle(idVenta);
            });
        });

    } catch (err) {
        document.getElementById('tabla-ventas').innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al cargar historial</td></tr>`;
    }
}

async function abrirModalDetalle(idVenta) {
    try {
        const detalle = await api.get(`/ventas/${idVenta}`);
        
        const fechaBD = detalle.fecha || detalle.fecha_venta;
        const fechaMostrada = fechaBD ? new Date(fechaBD).toLocaleDateString() : 'Sin fecha';

        document.getElementById('detalle-id').innerText = detalle.id;
        document.getElementById('detalle-cliente').innerText = detalle.cliente_nombre || 'Cliente General';
        document.getElementById('detalle-fecha-vendedor').innerText = `${fechaMostrada} | Por: ${detalle.vendedor_nombre}`;
        document.getElementById('detalle-total').innerText = `S/ ${parseFloat(detalle.total).toFixed(2)}`;

        const tbodyProductos = document.getElementById('tabla-detalle-productos');
        tbodyProductos.innerHTML = detalle.productos.map(p => `
            <tr>
                <td>${p.producto_nombre}</td>
                <td class="text-center">${p.cantidad}</td>
                <td class="text-end">S/ ${parseFloat(p.precio_unitario).toFixed(2)}</td>
                <td class="text-end fw-bold">S/ ${parseFloat(p.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalleVenta')).show();
    } catch (err) {
        alert("Error al cargar el detalle de la venta: " + err.message);
    }
}