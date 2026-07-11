const pool = require('../config/db');

const obtenerUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT id, nombre_completo, email, rol, activo, fecha_creacion 
            FROM usuarios 
            WHERE activo = TRUE 
            ORDER BY id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

module.exports = { obtenerUsuarios };