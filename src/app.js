import express from 'express';
import mongoose from 'mongoose';
import productsRouter from './routes/productRoutes.js';
import cartsRouter from './routes/cartRoutes.js';
import sessionRoutes from './routes/sessions.js';
import { create } from 'express-handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import Handlebars from 'handlebars'; 
import __dirname from './utils.js';
import { Server } from 'socket.io';
import Product from './models/product.js'; 
import Cart from './models/cart.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js';

const app = express();
const PORT = 8080;
const hbs = create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
});

mongoose.connect('mongodb://localhost:27017/mi_base_de_datos', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(express.static(__dirname + '/public'));

app.engine("handlebars", hbs.engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionRoutes);

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {});
});

app.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        let filter = {};
        if (query) {
            if (query === "available") {
                filter.stock = { $gt: 0 }; 
            } else {
                filter.category = query.toLowerCase(); 
            }
        }

        let sortOptions = {};
        if (sort === "asc") {
            sortOptions.price = 1; 
        } else if (sort === "desc") {
            sortOptions.price = -1; 
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
            lean: true, 
        };

        const products = await Product.paginate(filter, options);

        const response = {
            status: "success",
            payload: products.docs, 
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage
                ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}`
                : null,
            nextLink: products.hasNextPage
                ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}` 
                : null,
        };

        res.render('home', { products: response.payload });

    } catch (error) {
        console.error("Error al renderizar la vista home:", error.message);
        res.status(500).send("Error al cargar la página principal");
    }
});

app.get('/cart/:cid', async (req, res) => {
    const cartId = req.params.cid;  
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const productsInCart = await Promise.all(
            cart.products.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    ...product.toObject(),
                    quantity: item.quantity,
                };
            })
        );

        res.render('cart', { products: productsInCart, cartId: cart._id });
    } catch (error) {
        console.error("Error al cargar el carrito:", error.message);
        res.status(500).send("Error al cargar el carrito");
    }
});

const httpServer = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const socketServer = new Server(httpServer);

socketServer.on('connection', async (socket) => {
    console.log("Cliente conectado");

    const productos = await Product.find(); 
    socket.emit("Productos", productos);

    socket.on('deleteProduct', async (id) => {
        const result = await Product.findByIdAndDelete(id); 
        if (result) {
            const productosActualizados = await Product.find();
            socketServer.emit("Productos", productosActualizados);
        }
    });

    socket.on("newProduct", async (data) => {
        const newProduct = new Product(data); 
        try {
            await newProduct.save(); 
            const productosActualizados = await Product.find();
            socketServer.emit("Productos", productosActualizados);
        } catch (error) {
            console.error("Error al agregar producto:", error.message);
        }
    });
});
