import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake?.vfs ;
export const generatePerformanceReport = (data) => {
  const docDefinition = {
    content: [
      { text: 'Employee Performance Report', style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            ['Employee', 'Completion Rate', 'Avg. Time', 'Productivity Score'],
            ...data.map((d) => [
              d.email,
              `${d.completionRate}%`,
              d.avgTime,
              `${d.productivityScore}%`,
            ]),
          ],
        },
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
    },
  };

  pdfMake.createPdf(docDefinition).download('performance-report.pdf');
};