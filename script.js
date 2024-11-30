document.getElementById('sealForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileUpload');
    const labelSize = document.getElementById('labelSize').value;
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = ''; // Clear any previous error messages

    if (!fileInput.files.length) {
        errorDiv.textContent = 'Please upload a valid CSV file containing seal numbers.';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const content = e.target.result;
            const sealNumbers = content.split(/\r?\n/).filter(line => line.trim() !== '');
            if (sealNumbers.length === 0) {
                throw new Error('The uploaded file is empty.');
            }

            generatePDF(sealNumbers, labelSize);
        } catch (err) {
            errorDiv.textContent = `Error: ${err.message}`;
        }
    };

    reader.onerror = function () {
        errorDiv.textContent = 'Failed to read the file. Please try again.';
    };

    reader.readAsText(file);
});

function generatePDF(sealNumbers, labelSize) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        unit: "in",
        format: labelSize === "4x4" ? [4, 4] : [4, 2],
    });

    sealNumbers.forEach((sealNumber, index) => {
        if (index > 0) pdf.addPage();

        // Add Seal Number Text
        pdf.setFontSize(14);
        pdf.text("Seal Number:", 0.5, 0.5);
        pdf.text(sealNumber, 0.5, 1);

        // Generate Barcode
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, sealNumber, { format: "CODE128", width: 2, height: 30 });
        const imgData = canvas.toDataURL("image/png");

        // Add Barcode Image to PDF
        pdf.addImage(imgData, "PNG", 0.5, 1.2, 3, 1);
    });

    // Save PDF
    pdf.save("SealNumberLabels.pdf");
}

document.getElementById('downloadTemplate').addEventListener('click', function () {
    const sampleContent = "SealNumber\nABC123456\nDEF987654\nGHI567890\nJKL345678\nMNO234567";
    const blob = new Blob([sampleContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "seal_numbers_template.csv";
    link.click();
});
