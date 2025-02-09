import { useState, useEffect } from "preact/hooks";
const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL;
const PUBLIC_PAYPAL_CHECKOUT_URL = import.meta.env.PUBLIC_PAYPAL_CHECKOUT_URL

export default function Store() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    console.log("Ejecutando fetch...");
    fetch(`${PUBLIC_API_URL}/products/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data recibida:", data);
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const productWithSubcategory = selectedSubcategory
      ? {
          name: product.name,
          subcategory: selectedSubcategory.name,
          price: selectedSubcategory.price,
          quantity: 1,
          img: selectedSubcategory.img,
        }
      : {
          name: product.name,
          subcategory: product.subcategory[0].name,
          price: product.subcategory[0].price,
          quantity: 1,
          img: product.subcategory[0].img,
        };

    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) =>
          item.name === productWithSubcategory.name &&
          item.subcategory === productWithSubcategory.subcategory
      );
      if (existingProduct) {
        return prevCart.map((item) =>
          item.name === productWithSubcategory.name &&
          item.subcategory === productWithSubcategory.subcategory
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, productWithSubcategory];
      }
    });
  };


  const handleSubcategoryChange = (productId, subcategoryIndex) => {
    const product = products.find((p) => p.id === productId);
    setSelectedSubcategory(product.subcategory[subcategoryIndex]);
  };

  const incrementQuantity = (name, subcategory) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.name === name && item.subcategory === subcategory
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (name, subcategory) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.name === name && item.subcategory === subcategory
            ? {
                ...item,
                quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePay = () => {
    // Crear el objeto de productos en el formato esperado por el backend
    const orderItems = cart.map((item) => ({
      name: item.name,
      description: item.description || "", // Descripción opcional
      quantity: item.quantity,
      price: item.price,
    }));

    // Hacer la solicitud al backend para crear la orden de PayPal
    fetch(`${PUBLIC_API_URL}/paypal/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: orderItems, // Enviar el carrito con los productos
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          // Si la orden se creó correctamente, redirigir a la página de pago de PayPal
          const orderId = data.id;
          window.location.href = `${PUBLIC_PAYPAL_CHECKOUT_URL}?token=${orderId}`;
        } else {
          console.error("Error al crear la orden:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error al procesar el pago:", error);
      });
  };


  return (
    <>
      {/* Carrito icon */}
      <div className="cart-secction">
        <button
          className="car-top-button"
          onClick={() => setCartOpen(!cartOpen)}
        >
          <img
            style={{ width: "30px" }}
            src="https://senora-garabato-images.s3.us-east-2.amazonaws.com/images/Cesta.PNG"
            alt="carrito"
          />
        </button>
        <div id="cart-notification" className="cart-notification">
          {cart.length}
        </div>
      </div>

      {/* Tienda */}
      <section className="store-main-container">
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div id="store-items" className="store-container-list">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="store-container-img">
                  <img
                    src={
                      selectedSubcategory
                        ? selectedSubcategory.img
                        : product.subcategory[0].img
                    }
                    alt={
                      selectedSubcategory
                        ? selectedSubcategory.name
                        : product.subcategory[0].name
                    }
                    className="store-img"
                  />
                  <div className="store-container-description">
                    <h1 style={{ fontSize: "30px", margin: 0 }}>
                      {product.name}
                    </h1>
                    <p style={{ fontSize: "14px" }}>
                      {selectedSubcategory
                        ? selectedSubcategory.description
                        : product.subcategory[0].description}
                    </p>
                    <p style={{ fontSize: "16px" }}>
                      Precio desde:
                      <b>
                        <span>
                          {selectedSubcategory
                            ? selectedSubcategory.price
                            : product.subcategory[0].price}
                        </span>
                        {product.currency}
                      </b>
                    </p>

                    <div className="store-total">
                      <div className="store-quantity">
                        <p style={{ fontSize: "14px" }}>
                          Seleccionar Subcategoría:
                        </p>
                        <select
                          onChange={(e) =>
                            handleSubcategoryChange(
                              product.id,
                              e.target.selectedIndex
                            )
                          }
                          defaultValue={0}
                        >
                          {product.subcategory.map((sub, idx) => (
                            <option key={idx} value={idx}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="button-55 car-button"
                        onClick={() => addToCart(product)}
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay productos disponibles.</p>
            )}
          </div>
        )}
      </section>

      {/* Modal del carrito */}
      {cartOpen && (
        <div id="cart-modal" className="modal">
          <div className="modal-inner">
            <div
              className="modal-backdrop"
              onClick={() => setCartOpen(false)}
            ></div>
            <div className="modal-content">
              <span className="close-btn" onClick={() => setCartOpen(false)}>
                &times;
              </span>
              <h2>Tu Carrito</h2>
              <div id="cart-items">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="cart-item">
                       <img
                    src={item.img}
                    alt={item.subcategory}
                    style={{ width: "50px", height: "auto", marginRight: "10px" }}
                  />
                      <p>
                        {item.name} - {item.subcategory}
                      </p>
                      <div className="quantity-buttons">
                        <button
                          onClick={() =>
                            decrementQuantity(item.name, item.subcategory)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            incrementQuantity(item.name, item.subcategory)
                          }
                        >
                          +
                        </button>
                      </div>
                      <p>${item.price}</p>
                    </div>
                  ))
                ) : (
                  <p>Tu carrito está vacío.</p>
                )}
              </div>
              <div id="cart-total">
                <h3>
                  Total:{" "}
                  <span>
                    {cart.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )}
                  </span>
                  $
                </h3>
              </div>
              <button onClick={handlePay}>Pagar con PayPal</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
