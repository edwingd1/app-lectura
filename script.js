let registros = [];
let scanner;

// Inicializar el escáner y Service Worker al cargar
window.onload = () => {
  const guardados = localStorage.getItem("registros");
  if (guardados) {
    registros = JSON.parse(guardados);
  }
  startScanner();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};

// Escanear Serie con Html5Qrcode
function startScanner() {
  const reader = new Html5Qrcode("reader");
  reader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById("serie-input").value = decodedText;
      reader.stop();
    },
    (errorMessage) => {
      // Silencio: no queremos spam de errores
    }
  ).catch(err => {
    console.error("Error al iniciar el escáner:", err);
  });
}

// Guardar fila al enviar el formulario
document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();

  const serie = document.getElementById("serie-input").value.trim();
  if (!serie) {
    alert("Por favor ingresa o escanea la Serie.");
    return;
  }

  const activa = parseFloat(document.getElementById("activa").value);
  const potencia = parseFloat(document.getElementById("potencia").value) || 0;
  const reactiva = parseFloat(document.getElementById("reactiva").value) || 0;

  registros.push([serie, activa, potencia, reactiva]);
  localStorage.setItem("registros", JSON.stringify(registros));

  alert("Lectura guardada.");
  this.reset();
  document.getElementById("serie-input").value = "";
  startScanner();
});

// Exportar a Excel
document.getElementById("exportar-btn").addEventListener("click", () => {
  if (registros.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const nombre = prompt("Nombre del archivo (sin extensión):", "registros");
  if (!nombre) return;

  const data = [["Serie", "Activa kWh", "Potencia kW", "Reactiva kVARh"], ...registros];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lecturas");

  XLSX.writeFile(wb, nombre + ".xlsx");

  registros = [];
  localStorage.removeItem("registros");
  alert("Datos exportados y memoria limpiada.");
});
