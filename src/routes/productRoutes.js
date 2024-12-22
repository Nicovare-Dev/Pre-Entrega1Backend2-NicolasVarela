import { Router } from 'express';
import ProductManager from '../services/productManager.js';

const router = Router();
const productManager = new ProductManager();


router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1,sort, query } = req.query;

        console.log("Filtro por categoria:", query);

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);

        let products = await productManager.getAllProducts();

        if (query) {
            products = products.filter(product => {
                return product.category?.toLowerCase() === query.toLowerCase() ||
                    (product.available?.toString() === query);
            });
        }

        if (sort === 'asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'desc') {
            products.sort((a, b) => b.price - a.price);
        }

        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / parsedLimit);
        const startIndex = (parsedPage - 1) * parsedLimit;
        const endIndex = startIndex + parsedLimit;
        const paginatedProducts = products.slice(startIndex, endIndex);

        const response = {
            status: 'success',
            payload: paginatedProducts,
            totalPages,
            prevPage: parsedPage > 1 ? parsedPage - 1 : null,
            nextPage: parsedPage < totalPages ? parsedPage + 1 : null,
            page: parsedPage,
            hasPrevPage: parsedPage > 1,
            hasNextPage: parsedPage < totalPages,
            prevLink: parsedPage > 1 ? `/products?limit=${parsedLimit}&page=${parsedPage - 1}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: parsedPage < totalPages ? `/products?limit=${parsedLimit}&page=${parsedPage + 1}&sort=${sort || ''}&query=${query || ''}` : null
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los productos' });
    }
});



router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await productManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: `Producto con ID ${productId} no encontrado` });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'No se pudo obtener el producto' });
    }
});


router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        if (!newProduct) {
            return res.status(404).json({ error: 'El código del producto ya existe o los datos son inválidos' });
        }
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'No se pudo agregar el producto' });
    }
});


router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updatedProduct = await productManager.updateProduct(productId, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ error: `Producto con ID ${productId} no encontrado` });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'No se pudo actualizar el producto' });
    }
});


router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const result = await productManager.deleteProduct(productId);
        
        if (result.error) {
            return res.status(404).json({ message: `El producto que intentas eliminar no existe: ID ${productId}` });
        }
        
        res.json({ message: `Producto eliminado con éxito: ID ${productId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});


export default router;