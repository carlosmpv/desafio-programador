import { PDF } from '@libpdf/core'
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const payRollFiles = [
    "exemplos/payroll-01.pdf",
    "exemplos/payroll-02.pdf",
    "exemplos/payroll-03.pdf",
    "exemplos/payroll-04.pdf",
];

describe('Payroll PDF parsing', () => {
    test('Payrolls are found among examples folder', () => {
        payRollFiles.forEach(file => readFileSync(file))
    })

    test("Payrolls are read", async () => {
        const data = readFileSync(payRollFiles[0])
        const pdf = await PDF.load(data)
        const pages = pdf.getPages()
        console.log(pages[0])
    })
})
