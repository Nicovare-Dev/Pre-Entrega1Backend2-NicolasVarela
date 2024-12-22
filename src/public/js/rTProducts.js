const socket = io();

const form = document.getElementById('productForm');
const productsContainer = document.getElementById('productsContainer');

const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const codeInput = document.getElementById('code');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const categoryInput = document.getElementById('category');
const availableInput = document.getElementById('available');  

socket.on("Productos", data => {
    productsContainer.innerHTML = '';
    data.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Descripción:</strong> ${product.description}</p>
            <p><strong>Código:</strong> ${product.code}</p>
            <p><strong>Precio:</strong> $${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p><strong>Categoría:</strong> ${product.category}</p>
            <button class="deleteBtn" data-id="${product._id}">Eliminar</button>
        `;

        const deleteBtn = productDiv.querySelector('.deleteBtn');
        deleteBtn.addEventListener('click', () => {
            const productId = deleteBtn.getAttribute('data-id');
            socket.emit('deleteProduct', productId);
        });

        productsContainer.appendChild(productDiv);
    });
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const newProduct = {
        name: titleInput.value,
        description: descriptionInput.value,
        code: codeInput.value,
        price: priceInput.value,
        stock: stockInput.value,
        category: categoryInput.value,
        available: availableInput.value === "true" 
    };

    socket.emit('newProduct', newProduct);

    form.reset();
});
