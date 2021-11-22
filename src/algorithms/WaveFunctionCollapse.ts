import { GenMatrix } from "../data/GenMatrix";
import { Bitmap, Color, Random, Util, Vector2 } from "../lib";
import { D8, Direction } from "../math/Directions";

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
class Option {
    
    constructor(public index: number, public tile: number) {

    }
}

export class WFC {

    private constructor(
        private cells: GenMatrix<Uint8Array>, // sometimes called 'wave'
        private options: Option[], // sometimes called 'Prototypes'
        public readonly tiles: Bitmap[], //
        private random: Random,
    ) {}

    static new(input: Bitmap, kernelSize: number, cellsX: number, cellsY: number) : WFC {
        
        // cut the input into tiles
        console.log("cutting...")
        let tiles: Bitmap[] = [];
        for (let y = 0; y < input.height-2; y++) {
            for (let x = 0; x < input.width-2; x++) {
                tiles.push(input.trim(x, y, x + kernelSize, y + kernelSize))
            }
        }

        // turn tiles into options
        let options: Option[] = [];
        for (let i = 0; i < tiles.length; i++) {
            options[i] = new Option(i, i);
        }

        // init all cells containing all options
        let cells = GenMatrix.new<Uint8Array>(cellsX, cellsY);
        for (let i = 0; i < cells.data.length; i++) {

            // add the indices of all options
            cells.data[i] = new Uint8Array(options.length);
            cells.data[i].fill(1);
            // cells.data[i] = Util.range(options.length);
        }

        return new WFC(cells, options, tiles, Random.fromRandom()) 
    }

    ///////////////////////////////////////////////////////////////////////////

    solve(maxIterations=1000000) {
        // after doing this, all cell lists should contain just a single pointer
        for (let i = 0; i < maxIterations; i++) {
            if (this.isCollapsed()) {
                return this.renderResult();
            }
            let leastOptionCells = this.getCellsWithLeastOptions();
            let leastOptionCell = this.random.choose(leastOptionCells);
            this.pickRandomOption(leastOptionCell);
            this.removeInvalidOptions(leastOptionCell);
        }
        
        console.error("max iteration reached in solve!");
        return undefined;
    }

    pickRandomOption(cell: number) {
      
        // get choices
        let data = this.cells.data[cell];
        let options: number[] = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i] == 1) {
                options.push(i); 
            } 
        }

        let choice = this.random.choose(options);

        this.setOption(cell, choice);

        // for (let i = 0; i < data.length; i++) {
        //     if (data[i]) count += 1; 
        //     if (i == choice) data[i] = 1;
        //     else data[i] = 0;
        // }
    }

    /**
     * The core
     */
    removeInvalidOptions(startCell: number, maxIterations = 1000000) {
        let stack: number[] = [];
        stack.push(startCell);

        // protected while loop
        for (let i = 0; i < maxIterations; i++) {
            if (stack.length < 1) {
                return true;
            }

            // per neighbor
            let cell = stack.pop()!;
            for (let neighbor of this.cells.getNbIndices8(cell)) {
                let unchanged = this.removeInvalidOptionsOfNeighbor(cell, neighbor);
                if (!unchanged) {
                    stack.push(neighbor);
                }

                // debug
                // break;
            }
        }

        console.error("max iteration reached!");
        return false;
    }

    private removeInvalidOptionsOfNeighbor(cell: number, neighbor: number) {

        let unchanged = true;

        // first, we require the direction
        let direction = this.cells.getDirectionFromDifference(neighbor - cell)!;
        console.log("direction:", D8[direction]);
        
        let sourceOptions = this.getOptions(cell);
        let targetOptions = this.getOptions(neighbor);

        let newTargetOptions: number[] = [];
        console.log(targetOptions.length);

        // go over target options
        for (let target of targetOptions) {
            for (let source of sourceOptions) {
                let offset = Direction.D8ToVector(direction);

                // console.log(this.tiles[source.tile]);
                let thisTileIsIncorrect = doImagesOverlap(this.tiles[source.tile], this.tiles[target.tile], offset);
                
                if (thisTileIsIncorrect) {
                    console.log("incorrect!");
                    this.removeOption(neighbor, target);
                    unchanged = true;
                    // unchanged = false;
                    
                } 
            }
        }
        return unchanged;
    }



    isCollapsed(): boolean {
        for (let options of this.cells.data) {
            if (options.length != 1) {
                return false;
            }
        }
        return true;
    }

    getOptions(cell: number) {
        let ops: Option[] = [];
        let flags = this.cells.data[cell];
        for (let i = 0 ; i < flags.length; i++) {
            if (flags[i] == 1) {
                ops.push(this.options[i]);
            }
        }
        return ops;
    }

    setOption(cell: number, choice: number) {
        let data = this.cells.data[cell];
        data.fill(0);
        data[choice] = 1;
    }

    removeOption(cell: number, option: Option) {
        this.cells.data[cell][option.index] = 0;
    }

    getTileOptions(cell: number) {
        return this.getOptions(cell).map(i => this.tiles[i.tile]);
    }

    /**
     * or 'minimum entrophy', if you wanna be all fancy
     */
    private getCellsWithLeastOptions() {
        let least: number[] = [-1];
        let leastOptions = Infinity;
        for (let i = 0; i < this.cells.data.length; i++) {
            let options = this.cells.data[i];
            if (options.length == 1) {
                continue;
            }
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

    renderResult(): Bitmap {
        let image = Bitmap.new(this.cells.width, this.cells.height);
        for (let i = 0; i < image.pixelCount; i++) {
            // get average pixel
            let options = this.getTileOptions(i);
            image.setWithIndex(i, getAverageCenterPixel(options));
        }
        return image;
    }
}

function getAverageCenterPixel(imageSeries: Bitmap[]) {
    let pixel = [0,0,0,0];
    let count = imageSeries.length;
    let oneOverCount = 1 / count;
    let k = Math.floor(imageSeries[0].width / 2);
    
    for (let image of imageSeries) {
        let newPixel = image.get(k, k);
        for (let i = 0; i < 4; i++) {
            pixel[i] += newPixel[i] * oneOverCount;
        }
    }
    return pixel;
}


export function doImagesOverlap(a: Bitmap, b: Bitmap, offset: Vector2) : boolean {

    let aoff = Vector2.zero();
    if (offset.x > 0) aoff.x += offset.x;
    if (offset.y > 0) aoff.y += offset.y;

    let boff = Vector2.zero();
    if (offset.x < 0) boff.x += offset.x * -1;
    if (offset.y < 0) boff.y += offset.y * -1;

    for (let y = 0; y < a.height - Math.abs(offset.y); y++) {
        for (let x = 0; x < a.width - Math.abs(offset.x); x++) {
            if (!Color.isTheSame(a.get(x + aoff.x, y + aoff.y), b.get(x + boff.x, y + boff.y))) {
                return false
            }
        }
    }

    return true;
}