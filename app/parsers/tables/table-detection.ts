import { WasmPdfDocument } from "pdf-oxide-wasm";


type Cluster = {
    x: number;
    count: number;
};

interface Word {
    chars: any[],
    bbox: {
        x: number,
        y: number,
        width: number,
        height: number,
    },
    text: string,
    avgFontSize: number,
    dominantFont: string,
    isBold: boolean,
    isItalic: boolean,
    sequence: number
}

type TableDetectorOptions = {
    minTableSize: number,
    requiredAligntment: number, // entre 0 e 1
    wordSpacing: number,
    columnsCenterTol: number,
    columnsClusterTol: number,
    minCellsPerCluster: number,
}

export const DEFAULT_TABLE_OPTIONS: TableDetectorOptions = {
    minTableSize: 2,
    requiredAligntment: 0.60,
    wordSpacing: 3,
    columnsCenterTol: 12,
    minCellsPerCluster: 2,
    columnsClusterTol: 8,
    
}

function printMatrix(matrix: Word[][]) {
    console.table(matrix.map((row) => row.map(word => word.text)))
}

function printMatrixArray(matrix: Word[][][]) {
    console.log(`Total de tabelas: ${matrix.length}`);

    matrix.forEach((table, tableIndex) => {
        console.log(`\n=== TABELA ${tableIndex + 1} ===`);
        console.log(`Linhas: ${table.length}`);
        printMatrix(table)
    });
}

export class TableDetector {
    constructor(
        private doc: WasmPdfDocument,
        private options: TableDetectorOptions = DEFAULT_TABLE_OPTIONS,
    ) { }


    private getSortedLines(words: Word[]): Word[][] {
        const lines = new Map<number, Word[]>();

        words.forEach(w => {
            let wordsInLine = lines.get(w.bbox.y) || [];
            wordsInLine.push(w);
            lines.set(w.bbox.y, wordsInLine);
        });

        return Array.from(lines.entries())
            .sort(([keyA], [keyB]) => keyB - keyA)
            .map(([, value]) => value.sort((wa, wb) => wa.bbox.x - wb.bbox.x));
    }

    private joinWords(acc: Word, next: Word) {
        const newWidth = (next.bbox.x + next.bbox.width) - acc.bbox.x;
        acc.bbox.width = newWidth
        acc.text += ' ' + next.text
    }

    private aggregateWords(line: Word[]): Word[] {
        if (!line.length) return [];

        const threshold = this.options.wordSpacing; // tornar configurável
        // const avgFontSize = this.lineAvgFontSize(line);

        let result: Word[] = []
        let lastWord: Word | undefined = undefined;

        for (const word of line) {
            if (!lastWord) {
                lastWord = word;
                result.push({ ...word })
                continue
            }

            const gap = word.bbox.x - (lastWord.bbox.x + lastWord.bbox.width);
            if (gap <= threshold) {
                const prev = result[result.length - 1];
                this.joinWords(prev, { ...word })
            } else {
                result.push({ ...word })
                lastWord = word
            }


        }

        return result
    }

    private alignsInX(wordA: Word, wordB: Word, eps: number = 5): boolean {
        // Check if the intervals overlap significantly
        const aStart = wordA.bbox.x;
        const aEnd = wordA.bbox.x + wordA.bbox.width;
        const bStart = wordB.bbox.x;
        const bEnd = wordB.bbox.x + wordB.bbox.width;

        // Overlap ratio
        const overlapStart = Math.max(aStart, bStart);
        const overlapEnd = Math.min(aEnd, bEnd);
        const overlap = overlapEnd - overlapStart;

        if (overlap > 0) {
            // They overlap - check if overlap is significant
            const minWidth = Math.min(wordA.bbox.width, wordB.bbox.width);
            return overlap / minWidth > 0.3; // At least 30% overlap
        }

        // If no overlap, check if they're close
        const gap = Math.min(
            Math.abs(aStart - bEnd),
            Math.abs(bStart - aEnd)
        );
        return gap <= eps;
    }

    private findColumnClusters(words: Word[]): number[] {
        const xPositions = words.flatMap(w => [
            w.bbox.x,
            w.bbox.x + w.bbox.width / 2,
            w.bbox.x + w.bbox.width
        ]);

        // Cluster positions
        const clusters: number[] = [];
        const sorted = [...xPositions].sort((a, b) => a - b);

        for (const pos of sorted) {
            let found = false;
            for (const cluster of clusters) {
                if (Math.abs(pos - cluster) <= this.options.columnsClusterTol) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                clusters.push(pos);
            }
        }
        return clusters;
    }

    detect(page: number): (string | null)[][][] {

        const wellReadCodes = this.doc.extractText(page, null)
        const knownWords = new Set<string>(wellReadCodes.split(/\s+/).filter(v => !!v))
        const words = this.doc.extractWords(page).map((w: Word) => knownWords.has(w.text) ? w : { ...w, text: `??${w.text}??` })

        const sortedLines = this.getSortedLines(words)
        if (!sortedLines.length) return [];


        // Build column clusters from ALL lines
        const allWords = sortedLines.flat();
        const columnClusters = this.findColumnClusters(allWords);

        // console.log(`Found ${columnClusters.length} column clusters`);

        let detectedTables: Word[][][] = [];
        let currentTable: Word[][] = []
        let isReadingTable = false;

        for (let i = 1; i < sortedLines.length; i++) {
            const prevLine = this.aggregateWords(sortedLines[i - 1]);
            const currLine = this.aggregateWords(sortedLines[i]);


            // Map each word to its nearest column cluster
            const getColumnIndex = (word: Word): number => {
                const center = word.bbox.x + word.bbox.width / 2;
                let minDist = Infinity;
                let bestIdx = 0;
                for (let idx = 0; idx < columnClusters.length; idx++) {
                    const dist = Math.abs(center - columnClusters[idx]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestIdx = idx;
                    }
                }
                return bestIdx;
            };

            // Count matches by column index
            const prevColumns = prevLine.map(w => getColumnIndex(w));
            const currColumns = currLine.map(w => getColumnIndex(w));

            // Find common column indices
            const commonColumns = prevColumns.filter(idx => currColumns.includes(idx));

            // Also check actual X-position alignment for non-cluster approach
            let j = 0, k = 0;
            let directAlignment = 0;
            const usedJ = new Set<number>();
            const usedK = new Set<number>();

            // Improved LCS with tolerance
            while (j < prevLine.length && k < currLine.length) {
                if (usedJ.has(j)) { j++; continue; }
                if (usedK.has(k)) { k++; continue; }

                const prevWord = prevLine[j];
                const currWord = currLine[k];

                if (this.alignsInX(prevWord, currWord, 8)) {
                    directAlignment++;
                    usedJ.add(j);
                    usedK.add(k);
                    j++;
                    k++;
                    continue;
                }

                // Try finding alignment for prevWord in currLine
                let found = false;
                for (let ki = k + 1; ki < currLine.length; ki++) {
                    if (usedK.has(ki)) continue;
                    if (this.alignsInX(prevWord, currLine[ki], 8)) {
                        usedK.add(ki);
                        directAlignment++;
                        found = true;
                        break;
                    }
                }
                if (found) { usedJ.add(j); j++; continue; }

                // Try finding alignment for currWord in prevLine
                for (let ji = j + 1; ji < prevLine.length; ji++) {
                    if (usedJ.has(ji)) continue;
                    if (this.alignsInX(prevLine[ji], currWord, 8)) {
                        usedJ.add(ji);
                        directAlignment++;
                        found = true;
                        break;
                    }
                }
                if (found) { usedK.add(k); k++; continue; }

                k++;
            }

            const finalAlignment = Math.max(directAlignment, commonColumns.length);
            const maxPossible = Math.min(prevLine.length, currLine.length);
            const maxLength = Math.max(prevLine.length, currLine.length);
            const aligntmentRatio = finalAlignment / maxPossible;

            const matchRequiredOptions = maxLength >= this.options.minTableSize && aligntmentRatio >= this.options.requiredAligntment
            if (!isReadingTable && matchRequiredOptions) {
                // Começou a ler a tabela adiciona as 2 linhas
                currentTable.push(prevLine, currLine)
            } else if (matchRequiredOptions) {
                // Segue lendo a mesma tabela
                currentTable.push(currLine)
            } else {
                // Não está mais lendo a tabela
                if (currentTable.length) {
                    detectedTables.push(currentTable)
                }

                currentTable = [];
            }

            isReadingTable = matchRequiredOptions
            // console.log(`Alignment between ${i - 1} and ${i}: ${finalAlignment}/${maxPossible} (${(aligntmentRatio * 100).toFixed(1)}%)`);
            // console.log(`  Prev: ${prevLine.map(v => v.text).join(' | ')}`);
            // console.log(`  Curr: ${currLine.map(v => v.text).join(' | ')}`);
            // console.log('');
        }

        

        // this.identifyColumns(detectedTables[2])
        // this.normalizeTable(detectedTables[2])


        const tables = detectedTables.map(tbl => {
            const allWords = tbl.flat();
            const columnCenters = this.detectColumnCenters(allWords);
            return this.normalizeTable(tbl, columnCenters);
        })

        return tables.filter(tbl => tbl.length && tbl[0].length > this.options.minTableSize)
    }


    private detectColumnCenters(words: Word[]): number[] {
        const centers = words
            .map(w => w.bbox.x + w.bbox.width / 2)
            .sort((a, b) => a - b);

        const clusters: Cluster[] = [];

        for (const c of centers) {
            const last = clusters[clusters.length - 1];

            if (!last) {
                clusters.push({ x: c, count: 1 });
                continue;
            }

            if (Math.abs(c - last.x) <= this.options.columnsCenterTol) {
                last.x = (last.x * last.count + c) / (last.count + 1);
                last.count += 1;
            } else {
                clusters.push({ x: c, count: 1 });
            }
        }

        // Mescla clusters raros no vizinho mais próximo
        const filtered: Cluster[] = [];
        for (const cluster of clusters) {
            if (cluster.count >= this.options.minCellsPerCluster) {
                filtered.push(cluster);
                continue;
            }

            const prev = filtered[filtered.length - 1];
            if (prev && Math.abs(prev.x - cluster.x) <= this.options.columnsCenterTol * 2) {
                prev.x = (prev.x * prev.count + cluster.x * cluster.count) / (prev.count + cluster.count);
                prev.count += cluster.count;
            }
        }

        return filtered.map(c => c.x);
    }

    private getColumnIndex(word: Word, columnCenters: number[]): number {
        const center = word.bbox.x + word.bbox.width / 2;
        let bestIdx = 0;
        let bestDist = Infinity;

        for (let i = 0; i < columnCenters.length; i++) {
            const dist = Math.abs(center - columnCenters[i]);
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        }

        return bestIdx;
    }

    private normalizeTable(table: Word[][], columnCenters: number[]): (string | null)[][] {
        return table.map(line => {
            const row: (string | null)[] = Array(columnCenters.length).fill(null);

            for (const word of line) {
                const idx = this.getColumnIndex(word, columnCenters);
                row[idx] = row[idx] ? `${row[idx]} ${word.text}` : word.text;
            }

            return row;
        });
    }



}