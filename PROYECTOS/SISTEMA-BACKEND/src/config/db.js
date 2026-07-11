const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});
//Ya bueno, modifiqué un toque el código para que se conecte a la base de datos en AWS RDS. 
// Ahora debería funcionar correctamente. OKA 
//Primero, ya vi que has escrito horrible. Segundo, si
//DARIO LO TIENES CORRIENDO RIGHT?
//COMO QUE ESCRIBÍ HORRIBLE? ESPEREN CREE SALA PORQUE ME ANDO ENREDANDO
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo el cliente de la base de datos:', err.stack);
  }
  console.log('Conexión exitosa a PostgreSQL en AWS RDS');
  release();
});

module.exports = pool;