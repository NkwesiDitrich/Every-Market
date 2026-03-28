import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Note: this might need separate install if not working, but usually it's used with jspdf

export const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    const currency = "CFA";

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("SHOPORA INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Order ID: ${order._id}`, 105, 28, { align: "center" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 105, 33, { align: "center" });

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Bill To:", 20, 50);
    doc.setFontSize(10);
    doc.setTextColor(60);
    
    const address = order.address?.[0] || order.address; // Handle both snapshot formats
    doc.text(order.user?.name || "Guest Customer", 20, 56);
    doc.text(address?.street || "", 20, 61);
    doc.text(`${address?.city || ""}, ${address?.state || ""} ${address?.postalCode || ""}`, 20, 66);
    doc.text(address?.country || "", 20, 71);
    doc.text(address?.phoneNumber || "", 20, 76);

    // Table Header
    doc.setDrawColor(200);
    doc.line(20, 85, 190, 85);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Item Description", 20, 92);
    doc.text("Qty", 130, 92, { align: "right" });
    doc.text("Price", 160, 92, { align: "right" });
    doc.text("Total", 190, 92, { align: "right" });
    doc.line(20, 95, 190, 95);

    // Items
    doc.setFont(undefined, 'normal');
    let y = 102;
    const items = order.item || [];

    items.forEach((item) => {
        const title = item.product?.title || "Product";
        const price = item.product?.price || 0;
        const qty = item.quantity || 0;
        const lineTotal = price * qty;

        // Auto-wrap title if long
        const splitTitle = doc.splitTextToSize(title, 80);
        doc.text(splitTitle, 20, y);
        
        doc.text(qty.toString(), 130, y, { align: "right" });
        doc.text(`${price.toLocaleString()} ${currency}`, 160, y, { align: "right" });
        doc.text(`${lineTotal.toLocaleString()} ${currency}`, 190, y, { align: "right" });
        
        y += (splitTitle.length * 5) + 2;
        
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });

    // Summary
    y += 10;
    doc.line(120, y, 190, y);
    y += 7;
    doc.text("Subtotal:", 130, y, { align: "right" });
    doc.text(`${(order.total - (order.shipping || 0) - (order.tax || 0)).toLocaleString()} ${currency}`, 190, y, { align: "right" });
    
    y += 6;
    doc.text("Shipping:", 130, y, { align: "right" });
    doc.text(`${(order.shipping || 0).toLocaleString()} ${currency}`, 190, y, { align: "right" });
    
    y += 6;
    doc.text("Tax:", 130, y, { align: "right" });
    doc.text(`${(order.tax || 0).toLocaleString()} ${currency}`, 190, y, { align: "right" });

    y += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Total Amount:", 130, y, { align: "right" });
    doc.text(`${order.total.toLocaleString()} ${currency}`, 190, y, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150);
    doc.text("Thank you for shopping with Shopora!", 105, 285, { align: "center" });

    // Save PDF
    doc.save(`Invoice_${order._id}.pdf`);
};
