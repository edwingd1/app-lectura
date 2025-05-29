let registros = [];
let serie = "";

document.getElementById("formulario").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!serie) {
        alert("Primero escanea una Serie");
        return;
    }

    let activa = parseFloat(document.getElementById("activa").value);
    let potencia = parseFloat(document.getElementById("potencia").value);
    let reactiva = parseFloat(document.getElementById("reactiva").value);

    registros.push([serie, activa, potencia, reactiva]);

    localStorage.setItem("registros", JSON.stringify(registros));

    alert("Guardado correctamente");
    document.getElementById("formulario").reset();
    serie = "";
    document.getElementById("serie").innerText = "";
    startScanner(); // vuelve a escanear
});

function exportarExcel() {
    const nombre = prompt("Nombre del archivo (sin extensión):", "registros");
    if (!nombre) return;

    const data = [["Serie", "Activa kWh", "Potencia kW", "Reactiva kVARh"], ...registros];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    XLSX.writeFile(wb, nombre + ".xlsx");
}

function startScanner() {
    const scanner = new Html5Qrcode("reader");
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            serie = decodedText;
            document.getElementById("serie").innerText = decodedText;
            scanner.stop();
        }
    );
}

// Cargar registros desde localStorage al iniciar
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