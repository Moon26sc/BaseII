const express = require('express');
const router = express.Router();
const {obtenerVentas, registrarVenta, obtenerVentaConId } = require('../controllers/ventaController');

router.get('/', obtenerVentas);
router.post('/', registrarVenta);
router.get('/:id', obtenerVentaConId);

module.exports = router;