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

let scannerActive = false;

function toggleScanner() {
    if (scannerActive) {
        Quagga.stop();
        scannerActive = false;
    } else {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scanner'),
                constraints: {
                    facingMode: "environment" // cámara trasera
                },
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "code_39_reader"]
            }
        }, function (err) {
            if (err) {
                console.error(err);
                alert("Error al iniciar Quagga.");
                return;
            }
            Quagga.start();
            scannerActive = true;
        });

        Quagga.onDetected(data => {
            const code = data.codeResult.code;
            document.getElementById("serie").value = code;
            Quagga.stop(); // detener escaneo tras lectura exitosa
            scannerActive = false;
        });
    }
}
