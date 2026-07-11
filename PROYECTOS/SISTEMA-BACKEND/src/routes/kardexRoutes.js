const express = require('express');
const router = express.Router();
const { obtenerKardex, registrarAjusteKardex } = require('../controllers/kardexController');

router.get('/', obtenerKardex);
router.post('/', registrarAjusteKardex);
module.exports = router;