import { Router } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/cart.js';
import Product from '../models/product.js';

const router = Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', async (req, res) => {
    try {
        const newCart = new Cart();
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo crear el carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;

    if (!isValidObjectId(cartId)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }

    try {
        const cart = await Cart.findById(cartId).populate('products.product');

        if (!cart) {
            return res.status(404).json({ message: `Carrito con ID ${cartId} no encontrado` });
        }

        res.json({ message: 'Carrito encontrado', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

// Ruta para agregar productos al carrito
router.post('/add', async (req, res) => {
    const { id, quantity } = req.body;

    try {
        // Primero, verificamos si el carrito ya existe, si no, lo creamos.
        let cart = await Cart.findOne(); // Aquí deberías tener lógica para identificar el carrito actual del usuario (por ejemplo, por sesión o similar)
        if (!cart) {
            cart = new Cart(); // Si no existe, creamos un carrito nuevo
        }

        // Buscamos el producto en la base de datos
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Verificamos si el producto ya está en el carrito
        const productInCart = cart.products.find(item => item.product.toString() === id);
        if (productInCart) {
            // Si el producto ya está en el carrito, actualizamos la cantidad
            productInCart.quantity += quantity;
        } else {
            // Si el producto no está en el carrito, lo agregamos
            cart.products.push({ product: product._id, quantity });
        }

        // Guardamos los cambios en el carrito
        await cart.save();

        res.status(200).json({ message: 'Producto agregado al carrito', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: 'ID de carrito o producto inválido' });
    }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();
        res.status(200).json({ message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
});

// Actualizar el carrito con un nuevo arreglo de productos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        cart.products = products;
        await cart.save();
        res.status(200).json({ message: 'Carrito actualizado', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        cart.products = [];
        await cart.save();
        res.status(200).json({ message: 'Carrito vaciado', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: 'ID de carrito o producto inválido' });
    }

    if (quantity < 1) {
        return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
    }

    try {
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const productInCart = cart.products.find(item => item.product._id.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        if (quantity > productInCart.product.stock) {
            return res.status(400).json({ error: 'Cantidad excede el stock disponible' });
        }

        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).json({ message: 'Cantidad actualizada', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
    }
});


export default router;
