
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

type WordNode = {
    right?: WordNode,
    bottom?: WordNode,
    word: Word,
};

export class TableDetector {
    constructor() { }

    private median(values: number[]): number {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    private lineAvgFontSize(line: Word[]): number {
        const sizes = line.map(w => w.avgFontSize)
        return sizes.reduce((a, b) => a + b, 0) / sizes.length;
    }

    private aggregateWords(line: Word[]): string[] {
        if (!line.length) return [];

        // ~1.8 é a resposta correta
        const medianFont = this.median(line.map(w => w.avgFontSize));
        const threshold = 1.7;

        const avgFontSize = this.lineAvgFontSize(line);

        let result: string[] = []
        let lastWord: Word | undefined = undefined;

        for (const word of line) {
            if (!lastWord) {
                lastWord = word;
                result.push(word.text)
                continue
            }

            const gap = word.bbox.x - (lastWord.bbox.x + lastWord.bbox.width);
            if (gap <= threshold) {
                result[result.length - 1] += ' ' + word.text
            } else {
                result.push(word.text)
            }

            lastWord = word
        }

        return result
    }

    private isNear(a: number, b: number, eps: number = 2) {
        return Math.abs(a - b) <= eps
    }

    private alignsInX(wordA: Word, wordB: Word): boolean {
        return this.isNear(wordA.bbox.x, wordB.bbox.x)
            || this.isNear(wordA.bbox.x + wordA.bbox.width, wordB.bbox.x + wordB.bbox.width)
            || this.isNear(wordA.bbox.x + wordA.bbox.width / 2, wordB.bbox.x + wordB.bbox.width / 2)
    }

    detect(words: Word[]) {
        const lines = new Map<number, Word[]>();

        words.forEach(w => {
            let wordsInLine = lines.get(w.bbox.y) || [];
            wordsInLine.push(w)
            lines.set(w.bbox.y, wordsInLine)
        })

        // Garante que as palavras estão da esquerda para direita e de cima para baixo
        const sortedLines = Array.from(lines.entries())
            .sort(([keyA], [keyB]) => Number(keyB) - Number(keyA))
            .map(([, value]) => value.sort((wa, wb) => wa.bbox.x - wb.bbox.x));

        if (!sortedLines.length) {
            return []
        }

        for (let i = 1; i < sortedLines.length; i++) {
            const prevLine = sortedLines[i - 1]
            const currLine = sortedLines[i]

            
            let j = 0, k = 0;
            let alignmentCount = 0;

            // Algorítmo Longest Common Subsequence (gerado com ChatGPT)
            while (j < prevLine.length && k < currLine.length) {
                const prevWord = prevLine[j];
                const currWord = currLine[k];

                if (this.alignsInX(prevWord, currWord)) {
                    alignmentCount++;
                    j++;
                    k++;
                    continue;
                }

                // tenta “pular” uma palavra na linha atual
                if (k + 1 < currLine.length && this.alignsInX(prevWord, currLine[k + 1])) {
                    k++; // currLine[k] provavelmente é uma palavra faltante / extra
                    continue;
                }

                // tenta “pular” uma palavra na linha anterior
                if (j + 1 < prevLine.length && this.alignsInX(prevLine[j + 1], currWord)) {
                    j++;
                    continue;
                }

                k++;
            }


            console.log(`Alignmente between ${i - 1} and ${1}: ${alignmentCount}/${Math.min(prevLine.length, currLine.length)}\n\t${prevLine.map(v => v.text)}\n\t${currLine.map(v => v.text)}\n`)
        }


        for (const [y, words] of sortedLines.entries()) {
            console.log(words)
            break
        }
    }
}