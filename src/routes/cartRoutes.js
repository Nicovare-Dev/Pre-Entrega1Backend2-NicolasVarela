import { Router } from 'express';
import CartManager from '../services/cartManager.js';

const router = Router();
const cartManager = new CartManager();


router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'No se pudo crear el carrito' });
    }
});


router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await cartManager.getCartById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: `Carrito con ID ${cartId} no encontrado` });
        }

        res.json({ message: 'Carrito encontrado', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});



router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        const updatedCart = await cartManager.addProductToCart(cartId, productId);

        if (!updatedCart) {
            return res.status(404).json({ error: 'No se pudo agregar el producto al carrito. Verifique los IDs y el stock.' });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'No se pudo agregar el producto al carrito' });
    }
});

export default router;