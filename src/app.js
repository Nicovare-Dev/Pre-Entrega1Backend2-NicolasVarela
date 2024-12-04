import express from 'express'
import productsRouter from './routes/productRoutes.js';
import cartsRouter from './routes/cartRoutes.js';
import handlebars from 'express-handlebars'
import __dirname from './utils.js';
import { Server } from 'socket.io';
import ProductManager from './services/productManager.js';

const app = express();
const PORT = 8080;
const productManager = new ProductManager('./src/data/productos.json');


app.use(express.json());

app.use(express.static(__dirname + '/public'))


app.engine("handlebars", handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')



app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {})
})
app.get('/', (req, res) => {
    res.render('home', {})
})


app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});



const httpServer = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


const socketServer = new Server(httpServer)






socketServer.on('connection', async (socket) => {
    console.log("Cliente conectado");

    const productos = await productManager.getAllProducts();
    socket.emit("Productos", productos);


    socket.on('deleteProduct', async (id) => {
        const result = await productManager.deleteProduct(id);
        if (!result.error) {
            io.emit('Productos', productManager.products);
        }
    });


    socket.on("newProduct", async (data) => {
        console.log("Nuevo producto recibido: ", data);
        const result = await productManager.addProduct(data); 
        if (!result.error) {
            const productosActualizados = await productManager.getAllProducts();
            socketServer.emit("Productos", productosActualizados.products); 
        } else {
            console.error("Error al agregar producto:", result.message);
        }
    });
});


