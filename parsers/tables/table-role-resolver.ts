export type Role =
    'field_code'
    | 'field_label'
    | 'field_reference'
    | 'field_value'
    | 'base_label'
    | 'base_value'

export function columnRoles(table: (string | null)[][]): Role[] {
    if (!table.length) return [];

    const numColumns = table[0].length;
    let roles: Role[] = []
    let isField: boolean = false

    for (let columnIdx = 0; columnIdx < numColumns; columnIdx++) {
        const column = table.map(line => line[columnIdx])

        const probIsCode = column
            .map(v => Number(!!v && !/[^0-9]/.test(v)))
            .reduce((prev, curr) => prev + curr) / column.length;
        
        const probIsLabel = table.map(line => line[columnIdx])
            .map(v => Number(!!v && !/^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?$/.test(v)))
            .reduce((prev, curr) => prev + curr) / column.length;

        const probIsReferenceOrValue = table.map(line => line[columnIdx])
            .map(v => Number(!!v && /^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?$/.test(v)))
            .reduce((prev, curr) => prev + curr) / column.length;

        // console.log('label: ', probIsLabel, 'ref/val: ', probIsReferenceOrValue, 'code: ', probIsCode)

        if (roles.at(-1) != 'field_code'
            && probIsCode >= Math.max(probIsReferenceOrValue, probIsLabel)) {
            roles.push('field_code')
            // console.log("IS Code: ", column)
            continue
        }

        if (probIsLabel > Math.max(probIsReferenceOrValue, probIsCode)) {
            isField = roles.at(-1) == 'field_code' || roles.at(-1) == 'field_label'
            roles.push(
                isField
                    ? 'field_label'
                    : 'base_label'
            )
            continue
        }

        if (probIsReferenceOrValue > Math.max(probIsCode, probIsLabel)) {
            const lastRole = roles.at(-1);
            
            if (isField) {
                switch (lastRole) {
                    case "field_label":
                        roles.push("field_reference")
                        break;

                    case "field_reference":
                        roles.push("field_value")
                        break;
                    default: // Funciona para payroll-01
                        roles[roles.length - 1] = "field_reference"
                        roles.push("field_value")
                }
            } else {
                roles.push("base_value")
            }
            continue
        }

        roles.push('field_label')
    }


    return roles
}