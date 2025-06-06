let registros = [];
let scanner;

window.onload = () => {
  const guardados = localStorage.getItem("registros");
  if (guardados) {
    registros = JSON.parse(guardados);
  }
  startScanner();
};

function startScanner() {
  const reader = new Html5Qrcode("reader");
  reader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById("serie-input").value = decodedText;
      reader.stop();
    },
    () => {}
  ).catch(err => {
    console.error("Error al iniciar el escáner:", err);
  });
}

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

document.getElementById("exportar-btn").addEventListener("click", () => {
  const faltantesContainer = document.getElementById("faltantes-container");
  const faltantesList = document.getElementById("faltantes-list");
  faltantesContainer.style.display = "none";
  faltantesList.innerHTML = "";

  if (registros.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const archivoRef = document.getElementById("archivo-referencia").files[0];
  if (!archivoRef) {
    alert("Por favor selecciona un archivo de referencia con las series esperadas.");
    return;
  }

  const lector = new FileReader();
  lector.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(primeraHoja, { header: 1 });

    const seriesEsperadas = datos.map(row => row[0]).filter(Boolean);
    const seriesCapturadas = registros.map(r => r[0]);

    const faltantes = seriesEsperadas.filter(serie => !seriesCapturadas.includes(serie));

    if (faltantes.length > 0) {
      faltantes.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        faltantesList.appendChild(li);
      });
      faltantesContainer.style.display = "block";
      alert("Faltan series por registrar. Revisa el listado debajo.");
      return;
    }

    const nombre = prompt("Nombre del archivo (sin extensión):", "registros");
    if (!nombre) return;

    const dataExport = [["Serie", "Activa kWh", "Potencia kW", "Reactiva kVARh"], ...registros];
    const ws = XLSX.utils.aoa_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lecturas");

    XLSX.writeFile(wb, nombre + ".xlsx");

    registros = [];
    localStorage.removeItem("registros");
    alert("Datos exportados y memoria limpiada.");
  };

  lector.readAsArrayBuffer(archivoRef);
});
