async function addToCart(product) {
    alert("Producto agregado al carrito exitosamente")

    try {
        const response = await fetch('/api/carts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: product.id,
                quantity: 1, 
            }),
        });
    } catch (error) {
        console.error('Error al realizar la petición:', error);
    }
}
