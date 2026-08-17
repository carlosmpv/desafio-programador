import { PDF } from '@libpdf/core'
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { PayrollParser } from '@/parsers/payroll-parser';
import { PDFParse } from 'pdf-parse'
import { WasmPdfDocument } from 'pdf-oxide-wasm';
import { TableDetector } from '@/parsers/tables/table-detection';

const payRollFiles = [
    "exemplos/payroll-01.pdf",
    "exemplos/payroll-02.pdf",
    "exemplos/payroll-03.pdf",
    "exemplos/payroll-04.pdf",
];




// describe("Table detector works", () => {
//     test("Test table detector", async () => {
//         const data = readFileSync(payRollFiles[0])
//         const doc = new WasmPdfDocument(data);
//         const words = doc.extractWords(0, null);

//         const tableDetector = new TableDetector(doc);
//         const detectedTables = tableDetector.detect(words)
//         detectedTables.forEach(v => console.table(v))
//     })
// })

describe("PayrollParser works", () => {
    test("Can parse payroll-01", () => {
        const data = readFileSync(payRollFiles[0])
        const doc = new WasmPdfDocument(data);

        const parser = new PayrollParser(doc)
        const payroll = parser.parse();
        console.log(payroll.pages)
        
    })
})