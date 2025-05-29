let registros = JSON.parse(localStorage.getItem("registros") || "[]");
let html5QrCode = null;
let currentCameraId = null;
let availableCameras = [];
let cameraIndex = 0;

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

function startCamera(cameraId) {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode.start(
                cameraId,
                { fps: 10, qrbox: 250 },
                qrCodeMessage => {
                    document.getElementById("serie").value = qrCodeMessage;
                },
                errorMessage => {
                    console.warn("Error de escaneo:", errorMessage);
                }
            );
        });
    } else {
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            qrCodeMessage => {
                document.getElementById("serie").value = qrCodeMessage;
            },
            errorMessage => {
                console.warn("Error de escaneo:", errorMessage);
            }
        );
    }

    currentCameraId = cameraId;
}

function switchCamera() {
    if (availableCameras.length > 1) {
        cameraIndex = (cameraIndex + 1) % availableCameras.length;
        startCamera(availableCameras[cameraIndex].id);
    } else {
        alert("No hay múltiples cámaras disponibles.");
    }
}

// Inicializar cámaras al cargar
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        availableCameras = devices;
        cameraIndex = devices.findIndex(device =>
            /back|rear|environment/i.test(device.label)
        );
        if (cameraIndex === -1) cameraIndex = 0;

        startCamera(devices[cameraIndex].id);
    } else {
        alert("No se encontraron cámaras.");
    }
}).catch(err => {
    console.error("Error al obtener cámaras:", err);
    alert("No se pudo acceder a la cámara. Verifica permisos.");
});
