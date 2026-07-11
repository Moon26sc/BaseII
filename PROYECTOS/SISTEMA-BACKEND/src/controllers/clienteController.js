const pool = require('../config/db');

const obtenerClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes WHERE activo = TRUE ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

const crearCliente = async (req, res) => {
    const { nombre, documento, email, telefonos_secundarios = [] } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clientes (nombre, documento, email, telefonos_secundarios) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, documento, email, telefonos_secundarios]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un cliente con ese documento' });
        }
        res.status(500).json({ error: 'Error al crear cliente' });
    }
};

const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE clientes SET activo = FALSE WHERE id = $1', [id]);
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};

module.exports = { obtenerClientes, crearCliente, eliminarCliente };