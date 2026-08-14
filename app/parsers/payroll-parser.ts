import type { IPayrollParser, Payroll, PayrollPage, PayrollPageField } from "./parsers";
import { WasmPdfDocument } from 'pdf-oxide-wasm'

type LineReadingBounds = {
    monthYearRegex: RegExp
    beginReading: RegExp
    endReading: RegExp
}

type ReadingState =
    'reading_field_code'
    | 'reading_field_name'
    | 'reading_field_reference'
    | 'reading_field_value';

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
        const lineMap = new Map<Number, any[]>();
        words.forEach((word: any) => {
            if (!lineMap.has(word.bbox.y)) {
                lineMap.set(word.bbox.y, [])
            }

            let wordsInLine = lineMap.get(word.bbox.y)!
            wordsInLine.push(word)
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

        let currentPageField: PayrollPageField = {
            code: "",
            label: "",
            reference: "",
            value: "",
        }

        let readingValues = false;

        for (const line of sortedLines) {
            console.log(line)
            const lineStr = line.map(v => v.text).join(" ");
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

            // Faz sentido manter um contexto de como foram com outras linhas para identificar o que é esperado
            // de se encontrar em cada posição
            if (readingValues) {
                // A verba pode ou não ter um código antes do nome por via de regra
                // ao que tudo indica esses códigos devem ser números inteiros

                let readingState: ReadingState = 'reading_field_code';
                

                for (const word of line) {
                    console.log(word.bbox)
                    switch (readingState as ReadingState) {
                        case 'reading_field_code':
                            if (isNaN(Number(word.text))) { // not number
                                readingState = "reading_field_name"
                                console.log("No code")
                                // fallthrough
                            } else {
                                console.log(`Code: ${word.text}`)
                                currentPageField.code = word.text
                                break;
                            }
                        case 'reading_field_name':


                            break;
                        case 'reading_field_reference':

                            break;
                        case 'reading_field_value':

                            break;
                    }
                }
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