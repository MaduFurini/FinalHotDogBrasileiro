'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        ALTER TABLE produtos 
        ADD COLUMN id_categoria INTEGER NOT NULL 
        REFERENCES categorias(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE 
        AFTER id;  
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        ALTER TABLE produtos 
        DROP COLUMN id_categoria;
    `);
  }
};
