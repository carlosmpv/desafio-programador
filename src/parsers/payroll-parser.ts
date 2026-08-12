import type { IPayrollParser, Payroll } from "./parsers";
import { WasmPdfDocument } from 'pdf-oxide-wasm'


export class PayrollParser implements IPayrollParser {


    async parse(fileData: Uint8Array<ArrayBufferLike>): Promise<Payroll> {
        const doc = new WasmPdfDocument(fileData);
        const pageCount = doc.pageCount();
        console.log(doc.extractText(0, null))
        // console.log(doc.extractText(0, null))
        
        return {
            pages: []
        }
    }
}