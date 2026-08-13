import type { IPayrollParser, Payroll, PayrollPage } from "./parsers";
import { WasmPdfDocument } from 'pdf-oxide-wasm'

type LineReadingBounds = {
    monthYearRegex: RegExp
    beginReading: RegExp
    endReading: RegExp
}

export class SimplePayrollParser implements IPayrollParser {

    constructor(private lineReadingBounds: LineReadingBounds) { }

    async parse(fileData: Uint8Array<ArrayBufferLike>): Promise<Payroll> {
        const doc = new WasmPdfDocument(fileData);

        let payroll: Payroll = {
            pages: []
        };

        const pageCount = doc.pageCount();

        // Se eu usasse extractText, os textos não necessariamente seriam apresentados
        // em uma mesma linha, então eu agrupo as palavras por posição em y
        const words = doc.extractWords(0, null);
        const lineMap = new Map<Number, string[]>();
        words.forEach((word: any) => {
            if (!lineMap.has(word.bbox.y)) {
                lineMap.set(word.bbox.y, [])
            }

            let wordsInLine = lineMap.get(word.bbox.y)!
            wordsInLine.push(word.text)
            lineMap.set(word.bbox.y, wordsInLine)
        });

        const sortedLines = Array.from(lineMap.entries())
            .sort(([keyA], [keyB]) => Number(keyB) - Number(keyA))
            .map(([, value]) => value);

        const { monthYearRegex, beginReading, endReading } = this.lineReadingBounds;

        let currentPage: PayrollPage = {
            bases: [],
            fields: [],
            page: 0,
            year: "",
            month: "",
        };
        let readingValues = false;

        for (const line of sortedLines) {
            const lineStr = line.join(" ");
            const monthYearMatch = lineStr.match(monthYearRegex);
            if (monthYearMatch) {
                const [_, month, year] = monthYearMatch
                currentPage.year = year;
                currentPage.month = month
            }

            const beginReadingMatch = lineStr.match(beginReading)
            if (beginReadingMatch) {
                readingValues = true
            }

            const endReadingMatch = lineStr.match(endReading)
            if (endReadingMatch) {
                readingValues = false
            }

            if (readingValues) {
                console.log(lineStr)
            }
        }

        console.log(currentPage)

        // for (const [y, line] of lineMap.entries()) {
        //     sortedLines.
        // }


        return {
            pages: []
        }
    }
}