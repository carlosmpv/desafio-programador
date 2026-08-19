import type { Payroll, PayrollPage, PayrollPageBase, PayrollPageField } from "../models/payroll";
import { WasmPdfDocument } from 'pdf-oxide-wasm'
import { DEFAULT_TABLE_OPTIONS, TableDetector, TableDetectorOptions } from "./tables/table-detection";
import { columnRoles, Role } from "./tables/table-role-resolver";


export class PayrollParser {
    private readonly tableDetector: TableDetector;

    constructor(
        private doc: WasmPdfDocument,
        private tableDetectorOptions: TableDetectorOptions = DEFAULT_TABLE_OPTIONS,
    ) {
        this.tableDetector = new TableDetector(doc, tableDetectorOptions);
    }

    public parse(): Payroll {
        const yearMonthRgx: RegExp = /Mês: (\w{3})-(\d{2})/g
        let pages: PayrollPage[] = []
        for (let page = 0; page < this.doc.pageCount(); page++) {
            const tables = this.tableDetector.detect(page);
            const text = this.doc.extractText(page, null);
            let yearMonthMatch = Array.from(text.matchAll(yearMonthRgx));
            if (!yearMonthMatch.length) {
                yearMonthMatch = Array(tables.length).fill(['', '', '']);
            }

            const yearsMonths = Array.from(
                yearMonthMatch
                    .filter(v => v.length >= 3)
                    .map(v => [v[1], v[2]])
            )
            // Vou assumir que haverá 1 tabela por ano/mes por página
            // console.log(yearsMonths)

            for (let i = 0; i < Math.min(yearsMonths.length, tables.length); i++) {

                const [month, year] = yearsMonths[i];
                const table = tables[i];
                const roles = columnRoles(table);
                const mergedRoles: Role[] = [];

                const mergedColumnsTable = table.map((line, lineIdx) => {
                    const newLine = [];
                    let i = 0;

                    while (i < line.length) {
                        const currentRole = roles[i];
                        const isTargetRole = currentRole === 'base_label' || currentRole === 'field_label';

                        if (isTargetRole) {
                            // Agrupa todas as colunas consecutivas com o mesmo role alvo
                            let merged = line[i];
                            let j = i + 1;

                            while (j < line.length && roles[j] === currentRole) {
                                // Só junta se o valor não for null
                                if (line[i] !== null && line[j] !== null) {
                                    merged += ' ' + line[j];
                                }
                                j++;
                            }

                            newLine.push(merged);

                            // Adiciona apenas UMA role para o grupo mesclado
                            if (!lineIdx)
                                mergedRoles.push(currentRole);

                            i = j;
                        } else {
                            newLine.push(line[i]);
                            // Adiciona a role individual
                            if (!lineIdx)
                                mergedRoles.push(currentRole);
                            i++;
                        }
                    }

                    return newLine;
                });


                let fields: PayrollPageField[] = []
                let currentField: PayrollPageField | null = null
                let bases: PayrollPageBase[] = []
                let currentBase: PayrollPageBase | null = null

                mergedColumnsTable.forEach(line => {
                    line.forEach((cell, j) => {
                        if (!cell) return;

                        const role = mergedRoles[j];
                        switch (role) {
                            case "field_code":
                                if (!!currentBase) {
                                    bases.push(currentBase)
                                    currentBase = null
                                }

                                if (!currentField) {
                                    currentField = {
                                        code: "",
                                        label: "",
                                        reference: "",
                                        value: ""
                                    }
                                }

                                currentField.code = cell;
                                break
                            case "field_label":
                                if (!!currentBase) {
                                    bases.push(currentBase)
                                    currentBase = null
                                }

                                if (!currentField) {
                                    currentField = {
                                        code: "",
                                        label: "",
                                        reference: "",
                                        value: ""
                                    }
                                }

                                currentField.label = cell;
                                break
                            case "field_reference":
                                if (!currentField) {
                                    currentField = {
                                        code: "",
                                        label: "",
                                        reference: "",
                                        value: ""
                                    }
                                }
                                currentField.reference = cell;
                                break
                            case "field_value":
                                if (!currentField) {
                                    currentField = {
                                        code: "",
                                        label: "",
                                        reference: "",
                                        value: ""
                                    }
                                }
                                currentField.value = cell;
                                break
                            case "base_label":
                                if (!!currentField) {
                                    fields.push(currentField)
                                    currentField = null
                                }

                                if (!currentBase) {
                                    currentBase = {
                                        label: "",
                                        value: "",
                                    }
                                }

                                currentBase.label = cell
                                break
                            case "base_value":
                                if (!currentBase) {
                                    currentBase = {
                                        label: "",
                                        value: "",
                                    }
                                }

                                currentBase.value = cell
                        }
                    })
                })

                if (!!currentField) {
                    fields.push(currentField)
                }

                if (!!currentBase) {
                    bases.push(currentBase)
                }

                // console.log('fields', fields)
                // console.log('bases', bases)
                // console.table(mergedColumnsTable)
                // console.table(mergedRoles)


                pages.push({
                    page: page,
                    year: year,
                    month: month,
                    bases: bases,
                    fields: fields,
                })
            }
        }

        return {
            pages: pages
        }
    }

}