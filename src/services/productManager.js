import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
    constructor() {
        const dataFolder = path.join(__dirname, '../data');
        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
        }
        this.path = path.join(dataFolder, 'productos.json');
        this.products = [];
        this.init();
    }

    async init() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, '[]', 'utf-8');
                console.log('Archivo productos.json creado');
            }
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            console.log('Error inicializando productos:', error);
        }
    }

    async addProduct(product) {
        try {
            if (this.products.some(p => p.code === product.code)) {
                console.log('Error: El producto con este código ya existe');
                throw new Error('Producto con este código ya existe.');
            }

            const newProduct = {
                id: this.products.length ? this.products[this.products.length - 1].id + 1 : 1,
                ...product,
                status: product.status ?? true,
            };

            this.products.push(newProduct);
            await this.saveProducts();
            console.log(`Producto añadido con éxito: ${JSON.stringify(newProduct)}`);
            return { message: 'Producto añadido correctamente', product: newProduct };
        } catch (error) {
            console.log('Error añadiendo producto:', error.message);
            return { error: 'Error al añadir el producto', message: error.message };
        }
    }

    async saveProducts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
            console.log('Productos guardados con éxito en el archivo');
        } catch (error) {
            console.log('Error guardando productos:', error.message);
        }
    }

    async updateProduct(id, productData) {
        try {
            const productIndex = this.products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                console.log(`Error: Producto con ID ${id} no encontrado`);
                return { error: `Producto con ID ${id} no encontrado` };
            }

            this.products[productIndex] = { ...this.products[productIndex], ...productData };
            await this.saveProducts();
            console.log(`Producto actualizado con éxito: ${JSON.stringify(this.products[productIndex])}`);
            return { message: 'Producto actualizado correctamente', product: this.products[productIndex] };
        } catch (error) {
            console.log('Error actualizando producto:', error.message);
            return { error: 'Error al actualizar el producto', message: error.message };
        }
    }

    async getAllProducts(limit) {
        try {
            const productsToReturn = limit ? this.products.slice(0, limit) : this.products;
            console.log(`Se han devuelto ${productsToReturn.length} productos`);
            return productsToReturn;
        } catch (error) {
            console.log('Error obteniendo productos:', error.message);
            return { error: 'Error al obtener los productos', message: error.message };
        }
    }

    async getProductById(id) {
        try {
            const product = this.products.find(p => p.id === id);
            if (!product) {
                console.log(`Error: Producto con ID ${id} no encontrado`);
                return { error: `Producto con ID ${id} no encontrado` };
            }
            console.log(`Producto encontrado: ${JSON.stringify(product)}`);
            return { message: 'Producto encontrado', product };
        } catch (error) {
            console.log('Error obteniendo producto:', error.message);
            return { error: 'Error al obtener el producto', message: error.message };
        }
    }

    async deleteProduct(id) {
        try {
            const productIndex = this.products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                console.log(`Error: Producto con ID ${id} no encontrado`);
                return { error: `Producto con ID ${id} no encontrado` };
            }

            this.products.splice(productIndex, 1);
            await this.saveProducts();
            console.log(`Producto con ID ${id} eliminado con éxito`);
            return { message: `Producto con ID ${id} eliminado con éxito` };
        } catch (error) {
            console.log('Error eliminando producto:', error.message);
            return { error: 'Error al eliminar el producto', message: error.message };
        }
    }
}

export default ProductManager;