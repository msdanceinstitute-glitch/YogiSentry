import PDFDocument from 'pdfkit';
import { put } from '@vercel/blob';
import { Readable } from 'stream';

export const InvoiceService = {
  async generateAndUploadInvoice(paymentData: { 
    id: string; 
    residentName: string; 
    flatNo: string; 
    amount: number; 
    date: string 
  }) {
    return new Promise<string>(async (resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      let buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        
        // Upload to Vercel Blob
        const blob = await put(`invoices/invoice-${paymentData.id}.pdf`, pdfData, {
          access: 'public',
          contentType: 'application/pdf',
        });
        
        resolve(blob.url);
      });

      // Simple Invoice Layout
      doc.fontSize(20).text('Maintenance Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice ID: ${paymentData.id}`);
      doc.text(`Date: ${paymentData.date}`);
      doc.text(`Resident: ${paymentData.residentName} (Flat: ${paymentData.flatNo})`);
      doc.moveDown();
      doc.fontSize(16).text(`Amount Paid: $${paymentData.amount}`, { align: 'right' });
      
      doc.end();
    });
  }
};
