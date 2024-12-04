import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartManager {
    constructor() {
        const dataFolder = path.join(__dirname, '../data');
        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
        }
        this.path = path.join(dataFolder, 'carritos.json');
        this.carts = [];
        this.init();
    }

    async init() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, '[]', 'utf-8');
                console.log('Archivo carritos.json creado');
            }
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);
            console.log('Carritos cargados desde el archivo');
        } catch (error) {
            console.log('Error inicializando carritos:', error);
        }
    }

    async createCart() {
        try {
            const newCart = {
                id: this.carts.length ? this.carts[this.carts.length - 1].id + 1 : 1,
                products: [], 
            };

            this.carts.push(newCart);
            await this.saveCarts();
            console.log(`Carrito creado con éxito: ${JSON.stringify(newCart)}`);
            return { message: 'Carrito creado correctamente', cart: newCart };
        } catch (error) {
            console.log('Error al crear el carrito:', error.message);
            return { error: 'Error al crear el carrito', message: error.message };
        }
    }

    async saveCarts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
            console.log('Carritos guardados con éxito en el archivo');
        } catch (error) {
            console.log('Error guardando carritos:', error.message);
        }
    }

    async getCartById(id) {
        try {
            const cart = this.carts.find(c => c.id === id);
            if (!cart) {
                return null;
            }
            return cart;
        } catch (error) {
            console.log('Error obteniendo carrito:', error.message);
            return null;
        }
    }
    

    async addProductToCart(cartId, productId) {
        try {
            const cartIndex = this.carts.findIndex(c => c.id === cartId);
            if (cartIndex === -1) {
                console.log(`Error: Carrito con ID ${cartId} no encontrado`);
                return { error: `Carrito con ID ${cartId} no encontrado` };
            }

            const cart = this.carts[cartIndex];
            const productInCart = cart.products.find(p => p.product === productId);

            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 }); 
            }

            await this.saveCarts();
            console.log(`Producto con ID ${productId} añadido al carrito ${cartId}`);
            return { message: `Producto añadido al carrito ${cartId}`, cart };
        } catch (error) {
            console.log('Error añadiendo producto al carrito:', error.message);
            return { error: 'Error al añadir producto al carrito', message: error.message };
        }
    }
}

export default CartManager;