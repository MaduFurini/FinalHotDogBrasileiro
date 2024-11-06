'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categorias', [
      {
        nome: 'Hot Dog',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Hot Dog Doce',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Bebida',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nome: 'Adicional',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
