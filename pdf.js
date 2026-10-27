import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const money = (n) => 'Rs. ' + Number(n).toFixed(2);

export function downloadInvoicePdf(inv, shop = { name: 'Your Shop Name', address: 'Shop address, City', gstin: '27ABCDE1234F1Z5' }) {
  const doc = new jsPDF();
  doc.setFontSize(18).text(shop.name, 14, 18);
  doc.setFontSize(10).text([shop.address, 'GSTIN: ' + shop.gstin], 14, 25);
  doc.setFontSize(14).text('TAX INVOICE', 196, 18, { align: 'right' });
  doc.setFontSize(10).text([
    inv.number, new Date(inv.created_at + 'Z').toLocaleString('en-IN'),
  ], 196, 25, { align: 'right' });

  doc.text(['Bill to: ' + inv.customer, inv.gstin ? 'GSTIN: ' + inv.gstin : ''], 14, 42);

  const rows = inv.items.map((i, n) => {
    const base = i.price * i.qty, tax = (base * i.gst) / 100;
    return [n + 1, i.name, i.qty, money(i.price), i.gst + '%', money(base), money(base + tax)];
  });
  autoTable(doc, {
    startY: 54,
    head: [['#', 'Item', 'Qty', 'Rate', 'GST', 'Taxable', 'Amount']],
    body: rows,
    headStyles: { fillColor: [38, 50, 90] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  });

  let y = doc.lastAutoTable.finalY + 8;
  const line = (label, val, bold) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.text(label, 140, y); doc.text(val, 196, y, { align: 'right' }); y += 6;
  };
  line('Subtotal', money(inv.subtotal));
  line('CGST', money(inv.tax / 2));
  line('SGST', money(inv.tax / 2));
  line('Total', money(inv.total), true);
  doc.setFont(undefined, 'normal').setFontSize(9).text('Thank you for shopping with us.', 14, y + 10);
  doc.save(inv.number + '.pdf');
}
