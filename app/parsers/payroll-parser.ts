import type { Payroll, PayrollPage, PayrollPageField } from "../models/payroll";
import { WasmPdfDocument } from 'pdf-oxide-wasm'
import { DEFAULT_TABLE_OPTIONS, TableDetector, TableDetectorOptions } from "./tables/table-detection";


export class PayrollParser {
    private readonly tableDetector: TableDetector;

    constructor(
        private doc: WasmPdfDocument,
        private tableDetectorOptions: TableDetectorOptions = DEFAULT_TABLE_OPTIONS,
    ) {
        this.tableDetector = new TableDetector(doc, tableDetectorOptions);
    }



}