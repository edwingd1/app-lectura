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

const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(devices => {
    if (!devices || devices.length === 0) {
        alert("No se encontraron cámaras.");
        return;
    }

    // Intentar encontrar la cámara trasera
    let backCamera = devices.find(device =>
        /back|rear|environment/i.test(device.label)
    ) || devices[devices.length - 1]; // usar la última como respaldo

    html5QrCode.start(
        backCamera.id,
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
            document.getElementById("serie").value = qrCodeMessage;
        },
        errorMessage => {
            console.warn("Error de escaneo:", errorMessage);
        }
    ).catch(err => {
        console.error("Error al iniciar el escáner:", err);
        alert("No se pudo iniciar la cámara. Verifica los permisos.");
    });
}).catch(err => {
    console.error("Error al obtener cámaras:", err);
    alert("No se pudo acceder a la cámara. Verifica permisos.");
});
