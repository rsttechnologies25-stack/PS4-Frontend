const fs = require('fs');
const path = require('path');

const base64Path = path.join(__dirname, 'logo_base64_ascii.txt');
const pagePath = path.join(__dirname, '..', 'app', '(dashboard)', 'orders', '[id]', 'page.tsx');

const base64 = fs.readFileSync(base64Path, 'ascii').trim();
let pageContent = fs.readFileSync(pagePath, 'utf8');

// --- THE REPLACEMENT ---
// We replace the handleDownloadInvoice logic with a direct base64 implementation.
const newHandleInvoice = `
    const handleDownloadInvoice = () => {
        if (!order) return;

        const doc = new jsPDF();
        const logoBase64 = "${base64}";
        
        // --- Header & Logo Setup ---
        try {
            doc.addImage(logoBase64, 'PNG', 145, 12, 50, 15);
        } catch (e) {
            console.error("Logo failed to load", e);
        }

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(139, 69, 19); 
        doc.text("Perambur Sri Srinivasa", 14, 22);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("GSTIN: 33AAPCP6259C1ZA", 14, 28);
        
        doc.setFontSize(10);
        doc.text("TAX INVOICE", 14, 35);

        // --- Order & Customer Details ---
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(\`Order ID: #\${order.id.slice(-8).toUpperCase()}\`, 14, 45);
        doc.text(\`Date: \${new Date(order.createdAt).toLocaleDateString()} \${new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}\`, 14, 51);
        doc.text(\`Status: \${order.status}\`, 14, 57);

        doc.text(\`Billed To:\`, 120, 45);
        doc.text(\`\${order.customerName || order.user?.name || 'Customer'}\`, 120, 51);
        if (order.phoneNumber) doc.text(\`\${order.phoneNumber}\`, 120, 57);
        if (order.addressLine1) {
            const splitAddress = doc.splitTextToSize(\`\${order.addressLine1}, \${order.addressLine2 ? order.addressLine2 + ', ' : ''}\${order.city} - \${order.pincode}\`, 70);
            doc.text(splitAddress, 120, 63);
        }

        // --- Items Table ---
        const tableColumn = ["Item Description", "Unit Price", "Qty", "Total (Incl. Tax)"];
        const tableRows = [];

        order.items.forEach((item) => {
            const itemData = [
                item.productName || item.product?.name || 'Removed Product',
                \`Rs. \${item.price.toFixed(2)}\`,
                item.quantity,
                \`Rs. \${(item.price * item.quantity).toFixed(2)}\`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            startY: 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [234, 88, 12], textColor: 255 }, 
            styles: { fontSize: 9 },
            margin: { top: 10 }
        });

        const finalY = (doc).lastAutoTable.finalY || 100;
        doc.setFontSize(10);
        doc.setTextColor(0);

        let currentY = finalY + 15;
        const rColX = 140;
        const rValX = 175;

        doc.text("Product Base Total:", rColX, currentY);
        doc.text(\`Rs. \${productBaseTotal.toFixed(2)}\`, rValX, currentY);
        currentY += 6;

        if (discountAmount > 0) {
            doc.text("Coupon Discount:", rColX, currentY);
            doc.setTextColor(0, 150, 0); 
            doc.text(\`- Rs. \${discountAmount.toFixed(2)}\`, rValX, currentY);
            doc.setTextColor(0);
            currentY += 6;
        }

        doc.text("Product CGST (2.5%):", rColX, currentY);
        doc.text(\`Rs. \${productCGST.toFixed(2)}\`, rValX, currentY);
        currentY += 6;

        doc.text("Product SGST (2.5%):", rColX, currentY);
        doc.text(\`Rs. \${productSGST.toFixed(2)}\`, rValX, currentY);
        currentY += 6;

        doc.text("Shipping Base:", rColX, currentY);
        doc.text(\`Rs. \${shippingBaseValue.toFixed(2)}\`, rValX, currentY);
        currentY += 6;

        doc.text("Shipping CGST (9.0%):", rColX, currentY);
        doc.text(\`Rs. \${shippingCGST.toFixed(2)}\`, rValX, currentY);
        currentY += 6;

        doc.text("Shipping SGST (9.0%):", rColX, currentY);
        doc.text(\`Rs. \${shippingSGST.toFixed(2)}\`, rValX, currentY);
        currentY += 10;

        doc.setLineWidth(0.5);
        doc.line(rColX, currentY - 4, rValX + 30, currentY - 4);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Grand Total:", rColX, currentY + 2);
        doc.text(\`Rs. \${grandTotal.toFixed(2)}\`, rValX, currentY + 2);

        currentY += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("This is a computer generated invoice. (v2)", 14, currentY);

        doc.save(\`Invoice_\${order.id.slice(-8).toUpperCase()}.pdf\`);
    };
`;

// Regex to find and replace the entire function
const startRegex = /const handleDownloadInvoice = \(\) => {/g;
const match = startRegex.exec(pageContent);
if (match) {
    const startIndex = match.index;
    // Find the end of handleDownloadInvoice function
    // For simplicity, we'll look for the next "};" after about 3000 chars OR we'll use a safer approach.
    // Given the structure, handleDownloadInvoice ends with img.onerror = () => generatePDF(); };
    const endIndex = pageContent.indexOf('};', startIndex + 500) + 2; 
    
    // BUT our previous edit was fragmented. Let's do a robust replacement of the BLOCK.
    // Alternative: We'll just replace everything between line 155 and 292 if possible.
}

// SIMPLER FOR STABILITY:
// We'll replace the block from "const handleDownloadInvoice = () => {" to specific markers.
pageContent = pageContent.replace(/const handleDownloadInvoice = \(\) => {[\s\S]*?img.onerror = \(\) => generatePDF\(\);\s+};/g, newHandleInvoice);

fs.writeFileSync(pagePath, pageContent);
console.log('Successfully updated page.tsx with hardcoded Base64 logo (v2)');
