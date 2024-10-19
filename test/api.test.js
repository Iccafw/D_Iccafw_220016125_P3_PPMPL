const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const controller = require('../src/controller');

describe('API Testing', () => {
  // Reset data sebelum setiap pengujian
  beforeEach(() => {
    controller.resetItems();
  });

  // --- Pengujian GET dan POST yang sudah ada ---
  it('should return all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.be.at.least(1);
  });

  it('should create a new item', async () => {
    const newItem = { name: 'Item 3' };
    const res = await request(app).post('/api/items').send(newItem);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('name', 'Item 3');
  });

  // --- Pengujian PUT yang sudah ada ---
  it('should update an existing item', async () => {
    const updatedItem = { name: 'Updated Item 1' };
    const res = await request(app).put('/api/items/1').send(updatedItem);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', 1);
    expect(res.body).to.have.property('name', 'Updated Item 1');
  });

  it('should return 404 when updating a non-existent item', async () => {
    const updatedItem = { name: 'Non-existent Item' };
    const res = await request(app).put('/api/items/999').send(updatedItem);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Item not found');
  });

  // --- Pengujian DELETE yang sudah ada ---
  it('should delete an existing item', async () => {
    const res = await request(app).delete('/api/items/1');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Item deleted successfully');
  });

  it('should return 404 when deleting a non-existent item', async () => {
    const res = await request(app).delete('/api/items/999');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Item not found');
  });

  //6 Pengujian Tambahan untuk DELETE dan PUT sebagai latihan 1 dan 2

  // 1. Menghapus item yang ada secara sukses
  it('should successfully delete an existing item', async () => {
    const res = await request(app).delete('/api/items/2');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Item deleted successfully');

    // Verifikasi bahwa item benar-benar dihapus
    const getRes = await request(app).get('/api/items');
    expect(getRes.body).to.be.an('array').that.does.not.include.deep.members([{ id: 2, name: 'Item 2' }]);
  });

  // 2. Menghapus item yang tidak ada (mengharapkan status 404)
  it('should return 404 when attempting to delete a non-existent item', async () => {
    const res = await request(app).delete('/api/items/100');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Item not found');
  });

  // 3. Memastikan item yang dihapus tidak ada lagi setelah penghapusan
  it('should ensure the item is removed after deletion', async () => {
    // Hapus item dengan id 1
    const deleteRes = await request(app).delete('/api/items/1');
    expect(deleteRes.status).to.equal(200);

    // Coba ambil item yang telah dihapus
    const getRes = await request(app).get('/api/items');
    expect(getRes.status).to.equal(200);
    expect(getRes.body).to.be.an('array').that.does.not.deep.include({ id: 1, name: 'Item 1' });
  });

  // 4. Memperbarui item yang ada secara sukses
  it('should successfully update an existing item', async () => {
    const updatedItem = { name: 'Updated Item 2' };
    const res = await request(app).put('/api/items/2').send(updatedItem);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', 2);
    expect(res.body).to.have.property('name', 'Updated Item 2');

    // Verifikasi bahwa item telah diperbarui
    const getRes = await request(app).get('/api/items');
    expect(getRes.body).to.be.an('array').that.deep.includes({ id: 2, name: 'Updated Item 2' });
  });

  // 5. Memperbarui item yang tidak ada (mengharapkan status 404)
  it('should return 404 when attempting to update a non-existent item', async () => {
    const updatedItem = { name: 'Non-existent Item Updated' };
    const res = await request(app).put('/api/items/200').send(updatedItem);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Item not found');
  });

  // 6. Memastikan data item diperbarui dengan benar setelah pengubahan
  it('should ensure the item data is correctly updated after PUT', async () => {
    const updatedItem = { name: 'Completely Updated Item 1' };
    const putRes = await request(app).put('/api/items/1').send(updatedItem);
    expect(putRes.status).to.equal(200);
    expect(putRes.body).to.have.property('name', 'Completely Updated Item 1');

    // Verifikasi melalui GET
    const getRes = await request(app).get('/api/items/1').send(); // Mengasumsikan Anda memiliki route GET /api/items/:id
    // Jika route GET /api/items/:id belum ada, Anda bisa memeriksa melalui seluruh array
    const allItemsRes = await request(app).get('/api/items');
    const updated = allItemsRes.body.find(item => item.id === 1);
    expect(updated).to.exist;
    expect(updated).to.have.property('name', 'Completely Updated Item 1');
  });
});
