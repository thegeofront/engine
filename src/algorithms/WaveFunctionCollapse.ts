import { GenMatrix } from "../data/GenMatrix";
import { Queue } from "../data/Queue";
import { Bitmap, Color, Core, Random, Util, Vector2 } from "../lib";
import { D8, Direction } from "../math/Directions";
import { TileAtlas } from "./TileAtlas";

/**
 * Implementation of the famous and fascinating WaveFunctionCollapse algorithm
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
export class WaveField {

    private constructor(
        private cells: GenMatrix<Uint8Array>, // sometimes called 'wave'
        public atlas: TileAtlas,
        private random: Random,
    ) {}

    static new(atlas: TileAtlas, width: number, height: number) {

        // init all cells containing all options
        let maxOptions = atlas.prototypes.length;
        let cells = GenMatrix.new<Uint8Array>(width, height);
        for (let i = 0; i < cells.data.length; i++) {

            // add the indices of all options
            cells.data[i] = new Uint8Array(maxOptions);
            cells.data[i].fill(1);
            // cells.data[i] = Util.range(options.length);
        }

        return new WaveField(cells, atlas, Random.fromRandom()) 
    }

    ///////////////////////////////////////////////////////////////////////////

    collapse() {
        // after doing this, all cell lists should contain just a single pointer
        let maxIterations = this.cells.data.length + 10 // we will never have to iterate more times than cells in the target image
        for (let i = 0; i < maxIterations; i++) {
            if (this.isCollapsed()) {
                return true;
            }
            let success = this.collapseStep();
            if (!success) {
                return false;
            }
        }
        
        console.error("max iteration reached in solve!");
        return false;
    }

    collapseStep() {
        let leastOptionCells = this.getCellsWithLeastOptions();
        console.log("leastOptionCells", leastOptionCells)
        let leastOptionCell = this.random.choose(leastOptionCells);
        if (leastOptionCell == 0) {
            console.log("BUG INCOMING BUG INCOMING!!!!!!");
        }
        this.pickRandomOption(leastOptionCell);
        return this.removeInvalidOptions(leastOptionCell);
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
    removeInvalidOptions(startCell: number, maxIterations = 10000000, debug=false) {
        let stack = new Array<number>();
        let visited = new Set<number>();
        
        stack.push(startCell);
        
        // protected while loop
        for (let i = 0; i < maxIterations; i++) {
            if (stack.length < 1) {
                return true;
            }

            // visit this cell
            let cell = stack.pop()!;
            visited.add(cell);

            // debug 
            if (debug) {
                console.log("-----------------")
                console.log("SOURCE:", cell, "|", this.getOptions(cell).length);
                this.atlas.printConcatConnections(this.getOptions(cell));
            }

            // per unvisited neighbor
            for (let neighbor of this.cells.getNbCells(cell)) {
                if (visited.has(neighbor)) continue;
                
                let ops = this.getOptions(neighbor);
                let changed = this.removeInvalidOptionsOfNeighbor(cell, neighbor, debug);

                // saveguard
                if (this.getOptions(neighbor).length == 0) {
                    console.error("All options were removed from node", neighbor, "!!");
                    console.log("SOURCE:", cell, "|", this.getOptions(cell).length);
                    console.log("TARGET TO THE", D8[this.cells.getDirectionFromDifference(neighbor - cell)!])
                    this.atlas.printConcatConnections(this.getOptions(cell));
                    console.log("ORIGINAL OPTIONS", ops);
                    return false;
                }

                if (changed) {
                    stack.push(neighbor);
                }   
            }

            // debug | return after one cycle
            // return false;
        }

        console.error("max iteration reached!");
        return false;
    }

    private removeInvalidOptionsOfNeighbor(cell: number, neighbor: number, debug=false) {

        let isTargetAllowed = (sourceOptions: number[], target: number, direction: D8) => {
            for (let source of sourceOptions) {
                if (this.atlas.canBeConnected(source, target, direction)) {
                    return true;
                }
            }
            return false;
        }

        let changed = false;

        // first, we require the direction
        let direction = this.cells.getDirectionFromDifference(neighbor - cell)!;

        // console.log("direction:", D8[direction], " means offset", offset);

        let sourceOptions = this.getOptions(cell);
        let targetOptions = this.getOptions(neighbor);
        let ogCount = targetOptions.length;

        // console.log("I have ", sourceOptions, "options");
        // console.log("target has", targetOptions, "options");

        // go over target options
        for (let target of targetOptions) {
            // if target matches NONE of the source options, it should be removed
            if (!isTargetAllowed(sourceOptions, target, direction)) {
                // console.log("incorrect!");
                this.removeOption(neighbor, target);
                changed = true;
            } 
        }

        // debug
        if (debug) {           
            let newCount = this.getOptions(neighbor).length;
    
            // debug
            console.log("NB", D8[direction], ":", neighbor, "|", ogCount, "->", newCount);
        }

        return changed;
    }



    isCollapsed(debug=false): boolean {
        for (let i = 0; i < this.cells.data.length; i++) {
            let options = this.getOptions(i);
            if (debug) {
                console.log(options);
            }
            if (options.length !== 1) {
                return false;
            }
        }
        return true;
    }

    getOptions(cell: number) {
        let ops: number[] = [];
        let flags = this.cells.data[cell];
        for (let i = 0 ; i < flags.length; i++) {
            if (flags[i] == 1) {
                ops.push(i);
            }
        }
        return ops;
    }

    setOption(cell: number, choice: number) {
        let data = this.cells.data[cell];
        data.fill(0);
        data[choice] = 1;
    }

    removeOption(cell: number, option: number) {
        this.cells.data[cell][option] = 0;
    }

    getTileOptions(cell: number) {
        return this.getOptions(cell).map(i => this.atlas.tiles[this.atlas.prototypes[i].tile]);
    }

    /**
     * or 'minimum entrophy', if you wanna be all fancy
     */
    private getCellsWithLeastOptions() {
        let least: number[] = [];
        let leastOptions = Infinity;
        for (let i = 0; i < this.cells.data.length; i++) {
            let options = this.getOptions(i);
            // console.log(options);
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
        console.log("least options", leastOptions)
        console.log("least", least)
        return least;
    }

    ///////////////////////////////////////////////////////////////////////////

    renderResult(): Bitmap {
        let image = Bitmap.new(this.cells.width, this.cells.height);
        for (let i = 0; i < image.pixelCount; i++) {
            // get average pixel
            let options = this.getTileOptions(i);
            if (options.length == 0) {
                console.warn("optionless cell encountered!");
                image.setWithIndex(i, [255,0,0,255]);
            } else {
                image.setWithIndex(i, getAverageCenterPixel(options));
            }
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


