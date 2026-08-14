import { PDF } from '@libpdf/core'
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { SimplePayrollParser } from '@/app/parsers/payroll-parser';
import { PDFParse } from 'pdf-parse'
import { WasmPdfDocument } from 'pdf-oxide-wasm';
import { TableDetector } from '@/app/parsers/tables/table-detection';

const payRollFiles = [
    "exemplos/payroll-01.pdf",
    "exemplos/payroll-02.pdf",
    "exemplos/payroll-03.pdf",
    "exemplos/payroll-04.pdf",
];

// describe("Payroll PDF's exists and are parseable", () => {
//     test('Payrolls are found among examples folder', () => {
//         payRollFiles.forEach(file => readFileSync(file))
//     })

//     test("Payrolls are read", async () => {
//         payRollFiles.forEach(async payRoll => {
//             const data = readFileSync(payRoll)
//             const pdf = await PDF.load(data)
//             const pages = pdf.getPages()
//             console.log(`Payroll ${payRoll} has ${pages.length} pages`)
//         })
//     })

//     // test("Check payroll content", () => {
//     //     payRollFiles.forEach(async payRoll => {
//     //         const data = readFileSync(payRoll)
//     //         const doc = new WasmPdfDocument(data);
//     //         console.log('------------------------------------------------------------------------------------------------------')
//     //         console.log(doc.extractAllText());
//     //     })
//     // })
// })

// describe("PayrollParser works", () => {
//     test("Can parse payroll-1", async () => {
//         const data = readFileSync(payRollFiles[0])
//         const payrollParse = new SimplePayrollParser({
//             monthYearRegex: /Mês: (\w{3})-(\d{2})/,
//             beginReading: /Mês: \w{3}-\d{2}/,
//             endReading: /Folha Normal/
//         });

//         payrollParse.parse(data)
//     })
// })



describe("Table detector works", () => {
    test("Test table detector", async () => {
        const data = readFileSync(payRollFiles[1])
        const doc = new WasmPdfDocument(data);
        const words = doc.extractWords(0, null);

        const tableDetector = new TableDetector(doc, {
            minTableSize: 2,
            requiredAligntment: 0.60,
            wordSpacing: 3,
            columnsCenterTol: 50,
            minCellsPerCluster: 2,
            columnsClusterTol: 8,
        });
        const detectedTables = tableDetector.detect(words)

        
        detectedTables.forEach(v => console.table(v))

    })
})