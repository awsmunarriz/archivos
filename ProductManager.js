const fs = require("fs");

class ProductManager {
  constructor(filePath) {
    this.products = [];
    this.path = filePath;
    this.loadProducts();
  }

  // Método: Devolver el arreglo con todos los productos creados hasta ese momento.
  getProducts = () => {
    this.loadProducts(); // Cargar los productos desde el archivo
    return this.products;
  };

  // Método: Cargar productos desde el archivo
  loadProducts = () => {
    try {
      if (this.path) {
        const data = fs.readFileSync(this.path, "utf-8");
        this.products = JSON.parse(data);
      }
    } catch (error) {
      // Si el archivo no existe o hay algún error, se mantendrá el arreglo de productos vacío.
      console.error("Error loading products:", error.message);
    }
  };

  // Método: Agregar un producto al arreglo de productos inicial.
  addProduct = (title, description, price, thumbnail, code, stock) => {
    this.loadProducts(); // Cargar los productos desde el archivo
    // Verificar si el código ya existe en algún producto agregado previamente
    const isDuplicateCode = this.products.some(
      (product) => product.code === code
    );

    if (isDuplicateCode) {
      console.error("Error: Product with the same code already exists.");
      return;
    }

    const producto = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    // Indice con id autoincrementable
    if (this.products.length === 0) {
      producto.id = 1;
    } else {
      producto.id = this.products[this.products.length - 1].id + 1;
    }

    this.products.push(producto);
    this.saveProducts();
  };

  // Método: Guardar productos en el archivo
  saveProducts = () => {
    try {
      const data = JSON.stringify(this.products, null, 2);
      fs.writeFileSync(this.path, data, "utf-8");
      console.log("Products saved successfully.");
    } catch (error) {
      console.error("Error saving products:", error.message);
    }
  };

  // Método: Obtener un producto por su id
  getProductById = (id) => {
    this.loadProducts(); // Cargar los productos desde el archivo
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return product;
    } else {
      console.error("Not found");
    }
  };

  // Método: Eliminar un producto por su id
  deleteProduct = (id) => {
    this.loadProducts(); // Cargar los productos desde el archivo
    const index = this.products.findIndex((product) => product.id === id);

    if (index !== -1) {
      this.products.splice(index, 1);
      try {
        this.saveProducts();
        console.log(`Product with id ${id} has been deleted.`);
      } catch (error) {
        console.error("Error saving products:", error.message);
      }
    } else {
      console.error(`Product with id ${id} not found.`);
    }
  };

  // Método: Actualizar un producto por su id
  updateProduct = (id, updatedFields) => {
    this.loadProducts(); // Cargar los productos desde el archivo
    const productIndex = this.products.findIndex(
      (product) => product.id === id
    );

    if (productIndex !== -1) {
      const productToUpdate = this.products[productIndex];

      // Verificar si el campo "id" está presente en los "updatedFields" y, en ese caso, eliminarlo
      if ("id" in updatedFields) {
        delete updatedFields.id;
        console.error("Error: The 'id' field cannot be updated.");
      }

      const updatedProduct = { ...productToUpdate, ...updatedFields };

      // Actualizar el producto solo si no se eliminó el campo "id"
      if ("id" in productToUpdate && productToUpdate.id === id) {
        this.products[productIndex] = updatedProduct;
        try {
          this.saveProducts();
          console.log(`Product with id ${id} has been updated.`);
        } catch (error) {
          console.error("Error saving products:", error.message);
        }
      } else {
        console.error(`Product with id ${id} not found.`);
      }
    } else {
      console.error(`Product with id ${id} not found.`);
    }
  };
}

// Crear nueva instancia de la Clase ProductManager con el nombre del archivo "productos.txt"
const manejadorDeProducts = new ProductManager("productos.txt");

// Llamar a "getProducts" debe devolver un arreglo vacio
console.log("Get products:");
console.log(manejadorDeProducts.getProducts());

// Agregar producto
manejadorDeProducts.addProduct(
  "producto prueba",
  "Este es un producto prueba",
  200,
  "Sin imagen",
  "abc123",
  25
);

// Agregar producto con los mismos campos, debe arrojar un error porque el código estará repetido.
manejadorDeProducts.addProduct(
  "producto prueba",
  "Este es un producto prueba",
  200,
  "Sin imagen",
  "abc123",
  25
);

// Agregar otro producto con diferente code.
manejadorDeProducts.addProduct(
  "otro producto prueba",
  "Este es otro producto prueba",
  600,
  "Sin imagen",
  "xyz123",
  50
);

// Llamar a "getProducts" nuevamente, esta vez debe aparecer el producto recién agregado
console.log("Get products:");
console.log(manejadorDeProducts.getProducts());

// Obtener un producto por su ID
console.log("Search product with code = 1:");
const productIdToFind = 1;
const foundProduct = manejadorDeProducts.getProductById(productIdToFind);
foundProduct && console.log(foundProduct);

// Intentar obtener un producto con un ID inexistente
console.log("Search product with code = 5:");
const nonExistentProductId = 5;
const notFoundProduct =
  manejadorDeProducts.getProductById(nonExistentProductId);
notFoundProduct && console.log(notFoundProduct);

// Actualizar un producto por su id y campos
const productIdToUpdate = 2;
const updatedFields = {
  title: "Producto Actualizado",
  description: "Nueva descripción del producto",
  price: 150,
  stock: 77,
};
manejadorDeProducts.updateProduct(productIdToUpdate, updatedFields);

// Actualizar un producto por su id y campos. Debe arrojar un error porque el id no puede ser modificado.
const productIdToUpdateFail = 2;
const updatedFieldsFail = {
  id: 9,
  title: "Producto Actualizado",
  description: "Nueva descripción del producto",
  price: 150,
  stock: 77,
};
manejadorDeProducts.updateProduct(productIdToUpdateFail, updatedFieldsFail);

// Listar productos después de actualizar
console.log("Products after update:");
console.log(manejadorDeProducts.getProducts());

// Eliminar un producto por su id
const productIdToDelete = 1;
manejadorDeProducts.deleteProduct(productIdToDelete);

// Eliminar un producto por su id. Debe arrojar un error porque el id no existe.
const productIdToDeleteFail = 8;
manejadorDeProducts.deleteProduct(productIdToDeleteFail);

// Listar productos después de eliminar
console.log("Products after delete:");
console.log(manejadorDeProducts.getProducts());
