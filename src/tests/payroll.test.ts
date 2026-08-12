import { PDF } from '@dvvebond/core'
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { PayrollParser } from '../parsers/payroll-parser';
import { WasmPdfDocument } from 'pdf-oxide-wasm';

const payRollFiles = [
    "exemplos/payroll-01.pdf",
    "exemplos/payroll-02.pdf",
    "exemplos/payroll-03.pdf",
    "exemplos/payroll-04.pdf",
];

describe("Payroll PDF's exists and are parseable", () => {
    // test('Payrolls are found among examples folder', () => {
    //     payRollFiles.forEach(file => readFileSync(file))
    // })

    // test("Payrolls are read", async () => {
    //     payRollFiles.forEach(async payRoll => {
    //         const data = readFileSync(payRoll)
    //         const pdf = await PDF.load(data)
    //         const pages = pdf.getPages()
    //         console.log(`Payroll ${payRoll} has ${pages.length} pages`)
    //     })
    // })

    test("Check payroll content", () => {
        payRollFiles.forEach(async payRoll => {
            const data = readFileSync(payRoll)
            const doc = new WasmPdfDocument(data);
            console.log('------------------------------------------------------------------------------------------------------')
            console.log(doc.extractAllText());
        })
    })
})

// describe("PayrollParser works", () => {
//     test("PayrollParser works", async () => {
//         const data = readFileSync(payRollFiles[0])
//         const payrollParse = new PayrollParser()
//         payrollParse.parse(data)
//     })
// })