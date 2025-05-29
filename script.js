let registros = JSON.parse(localStorage.getItem("registros") || "[]");

function guardarRegistro() {
    const serie = document.getElementById("serie").value.trim();
    const activa = parseFloat(document.getElementById("activa").value);
    const potencia = parseFloat(document.getElementById("potencia").value);
    const reactiva = parseFloat(document.getElementById("reactiva").value);

    if (!serie || isNaN(activa) || isNaN(potencia) || isNaN(reactiva)) {
        alert("Por favor completa todos los campos correctamente.");
        return;
    }

    registros.push([serie, activa, potencia, reactiva]);
    localStorage.setItem("registros", JSON.stringify(registros));

    document.getElementById("serie").value = "";
    document.getElementById("activa").value = "";
    document.getElementById("potencia").value = "";
    document.getElementById("reactiva").value = "";
    document.getElementById("serie").focus();
}

function exportarExcel() {
    const nombre = prompt("Nombre del archivo (sin extensión):", "registros");
    if (!nombre) return;

    const data = [["Serie", "Activa kWh", "Potencia kW", "Reactiva kVARh"], ...registros];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    XLSX.writeFile(wb, nombre + ".xlsx");

    registros = [];
    localStorage.removeItem("registros");

    alert("Archivo exportado y datos reiniciados.");
}

Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        // Buscar cámara trasera
        let backCamera = devices.find(device =>
            /back|rear|environment/i.test(device.label)
        ) || devices[0]; // fallback: la primera si no encuentra otra

        html5QrCode.start(
            backCamera.id,
            { fps: 10, qrbox: 250 },
            qrCodeMessage => {
                document.getElementById("serie").value = qrCodeMessage;
            }
        ).catch(err => {
            console.error("Error al iniciar escáner:", err);
        });
    }
}).catch(err => {
    console.error("No se pudo acceder a la cámara:", err);
});
