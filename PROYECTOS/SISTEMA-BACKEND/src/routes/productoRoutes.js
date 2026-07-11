const express = require('express');
const router = express.Router();
const multer = require('multer'); // 1. Importamos multer

const { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio, actualizarProducto } = require('../controllers/productoController');
// 2. Configuramos dónde y cómo se guardan las imágenes

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Asegúrate de crear una carpeta llamada "uploads" en tu backend
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')) // Nombre único
    }
});
const upload = multer({ storage: storage });

router.get('/', obtenerProductos);
// 3. Agregamos "upload.single('imagen')" justo antes del controlador
router.post('/', upload.single('imagen'), crearProducto);
router.delete('/:id', eliminarProducto);
router.patch('/:id/precio', actualizarPrecio);

router.put('/:id', upload.single('imagen'), actualizarProducto);

module.exports = router;