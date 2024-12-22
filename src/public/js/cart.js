async function deleteProduct(cartId, productId) {
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Producto eliminado');
            const productElement = document.querySelector(`#product-${productId}`);
            if (productElement) {
                productElement.remove();
            }

            const remainingProducts = document.querySelectorAll('[id^="product-"]');
            if (remainingProducts.length === 0) {
                const emptyCartButton = document.querySelector('#emptyCartButton');
                if (emptyCartButton) {
                    emptyCartButton.style.display = 'none';
                }
                const cartContainer = document.querySelector('#cart');
                if (cartContainer) {
                    cartContainer.innerHTML = "<p>El carrito está vacío.</p>";
                }
            }
        } else {
            const error = await response.json();
            alert(`Error al eliminar producto: ${error.message}`);
        }
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('Hubo un error al intentar eliminar el producto.');
    }
}

async function deleteAll(cartId) {
    try {
        console.log("Vaciando carrito:", { cartId });
        const response = await fetch(`/api/carts/${cartId}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Carrito vaciado');
            // Limpia dinámicamente el DOM sin recargar la página
            const cartContainer = document.querySelector('#cart');
            if (cartContainer) {
                cartContainer.innerHTML = "<p>El carrito está vacío.</p>";
            }
        } else {
            const error = await response.json();
            alert(`Error al vaciar carrito: ${error.message}`);
        }
    } catch (err) {
        console.error('Error al vaciar el carrito:', err);
        alert('Hubo un error al intentar vaciar el carrito.');
    }
}

async function updateQuantity(cartId, productId, change, stock) {
    try {
        const quantitySpan = document.querySelector(`#quantity-${productId}`);
        if (!quantitySpan) {
            throw new Error(`No se encontró el elemento para la cantidad del producto ${productId}`);
        }

        const currentQuantity = parseInt(quantitySpan.textContent, 10);
        if (isNaN(currentQuantity)) {
            throw new Error(`La cantidad actual no es un número válido para el producto ${productId}`);
        }

        let newQuantity = currentQuantity + change;
        newQuantity = Math.max(1, Math.min(newQuantity, stock)); // Asegura que esté dentro del rango permitido

        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
            quantitySpan.textContent = newQuantity;     
        } else {
            const error = await response.json();
            alert(`Error al actualizar cantidad: ${error.message}`);
        }
    } catch (err) {
        console.error('Error al actualizar cantidad:', err);
        alert('Hubo un error al intentar actualizar la cantidad.');
    }
}
