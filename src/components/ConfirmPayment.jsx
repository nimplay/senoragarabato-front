const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL;
import { useEffect } from "preact/hooks";

export default function ConfirmPayment() {
  useEffect(() => {
    // Obtener el orderId de la URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("token");

    if (orderId) {
      fetch(`${PUBLIC_API_URL}/paypal/capture-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "COMPLETED") {
            alert("Pago exitoso. ¡Gracias por tu compra!");
            window.location.href = "/"; // Redirigir a la página principal
          } else {
            alert("Hubo un problema al capturar el pago.");
          }
        })
        .catch((error) => console.error("Error al capturar el pago:", error));
    }
  }, []);

  return <p>Procesando pago...</p>;
}
