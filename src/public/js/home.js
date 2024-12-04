const socket = io()
const div = document.getElementById("producto") 

socket.on("Productos", data => {
    data.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product'); 
        productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <p><strong>Descripción:</strong> ${product.description}</p>
            <p><strong>Código:</strong> ${product.code}</p>
            <p><strong>Precio:</strong> $${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p><strong>Categoría:</strong> ${product.category}</p>
        `;
        div.appendChild(productDiv);
    })
})