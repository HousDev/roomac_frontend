import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface DocumentData {
  type: 'receipt' | 'checkin' | 'checkout' | 'terms';
  property: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  tenant: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
    checkInDate?: string;
    checkOutDate?: string;
  };
  payment?: {
    receiptNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    paymentType: string;
    month?: string;
  };
  checkin?: {
    roomCondition: string;
    inventoryList: string[];
    securityDeposit: number;
    advanceRent: number;
    agreementDuration: string;
  };
  checkout?: {
    exitDate: string;
    roomCondition: string;
    damagesFound: string;
    depositRefund: number;
    duesCleared: boolean;
    clearanceNotes: string;
  };
  terms?: {
    sections: Array<{
      title: string;
      content: string[];
    }>;
  };
}

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(property: DocumentData['property']) {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(property.name, 105, 20, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(property.address, 105, 28, { align: 'center' });
    this.doc.text(`Phone: ${property.phone} | Email: ${property.email}`, 105, 34, { align: 'center' });

    this.doc.setLineWidth(0.5);
    this.doc.line(20, 40, 190, 40);
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount} | Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        105,
        285,
        { align: 'center' }
      );
    }
  }

  generateReceipt(data: DocumentData): jsPDF {
    this.addHeader(data.property);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RENT & DEPOSIT RECEIPT', 105, 50, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Receipt No: ${data.payment?.receiptNumber}`, 20, 60);
    this.doc.text(`Date: ${data.payment?.paymentDate}`, 150, 60);

    this.doc.autoTable({
      startY: 70,
      head: [['Description', 'Details']],
      body: [
        ['Tenant Name', data.tenant.name],
        ['Room Number', data.tenant.roomNumber || 'N/A'],
        ['Payment Type', data.payment?.paymentType || 'Rent'],
        ['Payment Month', data.payment?.month || format(new Date(), 'MMMM yyyy')],
        ['Amount Paid', `₹ ${data.payment?.amount.toLocaleString('en-IN')}`],
        ['Payment Method', data.payment?.paymentMethod || 'Cash'],
        ['Payment Date', data.payment?.paymentDate || format(new Date(), 'dd/MM/yyyy')],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const finalY = this.doc.lastAutoTable.finalY || 150;

    this.doc.setFontSize(10);
    this.doc.text('Received with thanks from the above tenant.', 20, finalY + 20);

    this.doc.setFontSize(9);
    this.doc.text('Authorized Signature', 150, finalY + 50);
    this.doc.line(140, finalY + 48, 190, finalY + 48);

    this.addFooter();
    return this.doc;
  }

  generateCheckInForm(data: DocumentData): jsPDF {
    this.addHeader(data.property);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CHECK-IN FORM', 105, 50, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text('(Candidate Booking Form)', 105, 58, { align: 'center' });

    this.doc.autoTable({
      startY: 70,
      head: [['Tenant Information', '']],
      body: [
        ['Full Name', data.tenant.name],
        ['Email', data.tenant.email],
        ['Phone Number', data.tenant.phone],
        ['Room Number', data.tenant.roomNumber || 'TBD'],
        ['Check-In Date', data.tenant.checkInDate || format(new Date(), 'dd/MM/yyyy')],
        ['Agreement Duration', data.checkin?.agreementDuration || '12 months'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 12 },
    });

    let currentY = this.doc.lastAutoTable.finalY + 10;

    this.doc.autoTable({
      startY: currentY,
      head: [['Financial Details', 'Amount (₹)']],
      body: [
        ['Security Deposit', data.checkin?.securityDeposit.toLocaleString('en-IN') || '0'],
        ['Advance Rent', data.checkin?.advanceRent.toLocaleString('en-IN') || '0'],
        ['Total Amount Paid', ((data.checkin?.securityDeposit || 0) + (data.checkin?.advanceRent || 0)).toLocaleString('en-IN')],
      ],
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    });

    currentY = this.doc.lastAutoTable.finalY + 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Room Condition & Inventory', 20, currentY);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Room Condition: ${data.checkin?.roomCondition || 'Good'}`, 20, currentY + 8);

    if (data.checkin?.inventoryList && data.checkin.inventoryList.length > 0) {
      this.doc.text('Inventory Provided:', 20, currentY + 16);
      data.checkin.inventoryList.forEach((item, index) => {
        this.doc.text(`• ${item}`, 25, currentY + 24 + (index * 6));
      });
    }

    const signY = currentY + 60;
    this.doc.setFontSize(10);
    this.doc.text('Tenant Signature', 20, signY);
    this.doc.line(20, signY - 2, 70, signY - 2);

    this.doc.text('Property Manager Signature', 120, signY);
    this.doc.line(120, signY - 2, 190, signY - 2);

    this.addFooter();
    return this.doc;
  }

  generateCheckOutForm(data: DocumentData): jsPDF {
    this.addHeader(data.property);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CHECK-OUT FORM', 105, 50, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text('(Exit Clearance Form)', 105, 58, { align: 'center' });

    this.doc.autoTable({
      startY: 70,
      head: [['Tenant Information', '']],
      body: [
        ['Full Name', data.tenant.name],
        ['Room Number', data.tenant.roomNumber || 'N/A'],
        ['Check-In Date', data.tenant.checkInDate || 'N/A'],
        ['Check-Out Date', data.checkout?.exitDate || format(new Date(), 'dd/MM/yyyy')],
      ],
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    });

    let currentY = this.doc.lastAutoTable.finalY + 10;

    this.doc.autoTable({
      startY: currentY,
      head: [['Exit Details', '']],
      body: [
        ['Room Condition at Exit', data.checkout?.roomCondition || 'Good'],
        ['Damages Found', data.checkout?.damagesFound || 'None'],
        ['Dues Cleared', data.checkout?.duesCleared ? 'Yes' : 'No'],
        ['Deposit Refund Amount', `₹ ${data.checkout?.depositRefund.toLocaleString('en-IN') || '0'}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [230, 126, 34], textColor: 255 },
    });

    currentY = this.doc.lastAutoTable.finalY + 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Clearance Notes', 20, currentY);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const notes = data.checkout?.clearanceNotes || 'All dues cleared. Tenant vacated the premises in good condition.';
    const splitNotes = this.doc.splitTextToSize(notes, 170);
    this.doc.text(splitNotes, 20, currentY + 8);

    const signY = currentY + 40;
    this.doc.setFontSize(10);
    this.doc.text('Tenant Signature', 20, signY);
    this.doc.line(20, signY - 2, 70, signY - 2);

    this.doc.text('Property Manager Signature', 120, signY);
    this.doc.line(120, signY - 2, 190, signY - 2);

    this.addFooter();
    return this.doc;
  }

  generateTermsAndConditions(data: DocumentData): jsPDF {
    this.addHeader(data.property);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TERMS & CONDITIONS', 105, 50, { align: 'center' });

    let currentY = 60;

    if (data.terms?.sections) {
      data.terms.sections.forEach((section, index) => {
        if (currentY > 250) {
          this.doc.addPage();
          currentY = 20;
        }

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${index + 1}. ${section.title}`, 20, currentY);
        currentY += 8;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        section.content.forEach((item, itemIndex) => {
          if (currentY > 270) {
            this.doc.addPage();
            currentY = 20;
          }

          const bulletPoint = `   ${String.fromCharCode(97 + itemIndex)}. ${item}`;
          const splitText = this.doc.splitTextToSize(bulletPoint, 170);
          this.doc.text(splitText, 20, currentY);
          currentY += splitText.length * 5 + 2;
        });

        currentY += 5;
      });
    }

    currentY += 20;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }

    this.doc.setFontSize(10);
    this.doc.text('Tenant Signature: _____________________', 20, currentY);
    this.doc.text('Date: _____________', 20, currentY + 10);

    this.doc.text('Property Manager Signature: _____________________', 120, currentY);
    this.doc.text('Date: _____________', 120, currentY + 10);

    this.addFooter();
    return this.doc;
  }

  generate(data: DocumentData): jsPDF {
    switch (data.type) {
      case 'receipt':
        return this.generateReceipt(data);
      case 'checkin':
        return this.generateCheckInForm(data);
      case 'checkout':
        return this.generateCheckOutForm(data);
      case 'terms':
        return this.generateTermsAndConditions(data);
      default:
        throw new Error('Invalid document type');
    }
  }

  download(filename: string) {
    this.doc.save(filename);
  }

  print() {
    this.doc.autoPrint();
    window.open(this.doc.output('bloburl'), '_blank');
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }

  getBase64(): string {
    return this.doc.output('datauristring');
  }
}

export const generatePDF = (data: DocumentData) => {
  const generator = new PDFGenerator();
  return generator.generate(data);
};

export const downloadPDF = (data: DocumentData, filename: string) => {
  const generator = new PDFGenerator();
  generator.generate(data);
  generator.download(filename);
};

export const printPDF = (data: DocumentData) => {
  const generator = new PDFGenerator();
  generator.generate(data);
  generator.print();
};

export const sharePDF = async (data: DocumentData, filename: string) => {
  const generator = new PDFGenerator();
  generator.generate(data);
  const blob = generator.getBlob();

  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Sharing document from RoomAC',
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return true;
  }
};
