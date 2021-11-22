import { GenMatrix } from "../data/GenMatrix";
import { Bitmap, Random, Vector2 } from "../lib";

/**
 * Implementation of the famous and fascinating WaveFunctionCollapse algorithm for 2d Textures:
 * https://github.com/mxgmn/WaveFunctionCollapse
 *
 * Some video's
 * https://www.youtube.com/watch?v=DOQTr2Xmlz0
 * https://www.youtube.com/watch?v=fnFj3dOKcIQ
 *
 * Terminology
 * Tile:
 * Prototype: A pairing between a tile and adjacency information. One tile can occur in multiple prototypes, due to rotation
 * Cell: a spot in the output image
 *
 *
 */
interface Option {
    tile: ptr;
    // orientation: number;
}

type ptr = number;
export class WFCImage {
    private constructor(
        private cells: GenMatrix<number[]>, // sometimes called 'wave'
        private options: Option[], // sometimes called 'Prototypes'
        private tiles: Bitmap[], //
        private random: Random,
    ) {}

    static new(input: Bitmap, kernelSize = 3, outputSize = Vector2.new(10, 10)) {
        // cut the input into pieces, and fill prototypes
        let options: Option[] = [];

        let maxOptions = options.length;

        let wave = GenMatrix.new<Uint8Array>(outputSize.x, outputSize.y);
        for (let i = 0; wave.data.length; i++) {
            wave.data[i] = new Uint8Array(maxOptions);
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    collapse() {
        // after doing this, all cell lists should contain just a single pointer
        while (!this.isCollapsed()) {
            this.iterate();
        }
        return this.renderResult();
    }

    iterate() {
        let leastOptionCells = this.getCellsWithLeastOptions();
        let leastOptionCell = this.random.choose(leastOptionCells);
        this.pickRandomOption(leastOptionCell);

        this.propagate(leastOptionCell);
    }

    private pickRandomOption(cell: number) {
        let choices = this.cells.data[cell];
        let choice = this.random.choose(choices);
        this.cells.data[cell] = [choice];
    }

    /**
     * The core
     */
    private propagate(startCell: number, maxIterations = 1000000) {
        let stack: number[] = [];
        stack.push(startCell);

        // protected while loop
        for (let i = 0; i < maxIterations; i++) {
            if (stack.length === 0) {
                break;
            }

            // per neighbor
            let cell = stack.pop();
            for (let neighbor of this.cells.getNbCells(cell)) {
                let unchanged = this.removeInvalidOptionsOfNeighbor(cell, neighbor);
                if (!unchanged) {
                    stack.push(neighbor);
                }
            }
        }
    }

    private removeInvalidOptionsOfNeighbor(cell: number, neighbor: number) {
        let unchanged = true;

        // first, we require the direction
        let direction = this.cells.getDirectionFromDifference(neighbor - cell);
        console.log(direction);

        let allowedCellOptions = false;

        return unchanged;
    }

    private isCollapsed(): boolean {
        for (let options of this.cells.data) {
            if (options.length != 1) {
                return false;
            }
        }
        return true;
    }

    private getCellOptions(x: number, y: number) {
        return this.cells.tryGet(x, y)!.map((i) => this.options[i]);
    }

    /**
     * or 'minimum entrophy', if you wanna be all fancy
     */
    private getCellsWithLeastOptions() {
        let least: number[] = [-1];
        let leastOptions = Infinity;
        for (let i = 0; i < this.cells.data.length; i++) {
            let options = this.cells.data[i];
            if (options.length == leastOptions) {
                least.push(i);
            } else if (options.length < leastOptions) {
                least = [];
                least.push(i);
                leastOptions = options.length;
            }
        }
        return least;
    }

    ///////////////////////////////////////////////////////////////////////////

    private renderResult(): Bitmap {
        return Bitmap.new(1, 1);
    }
}
