import { Vector2Array } from "../data/vector-array"
import { Circle2 } from "../geo/circle2"
import { Const } from "../math/const"
import { Vector2 } from "../math/vector"

export function RansacCircle2d(
    points: Vector2Array, iterations: number, radius: number, tolerance: number,
    seed: number, min_score: number, max_radius_deviation: number) : [Circle2, number[]] | undefined {
    //  Extract circle parameters from points in 2D space.

    //  IN
    //      - points : np.array[n, 2] -> sample points
    //      - iterations : int -> how many times to repeat
    //      - radius : float -> radius to create circles from
    //      - tolerance : float -> point counts if within tolerance distance
    //      - seed for randomization : int -> for random picking
    //      - min_score : int -> if high_score is below min_score, its invalid
    //      - num_scores : int -> if higher than one: use an average of the top x highscores for a more acurate result

    //  OUT
    //      - best circle, null if none passed the minimum score ('failsave')
    //      - number of matches

    //  Algorithm:
    //  - iterate for MAX_TRIES times
    //  - Pick 2 random 'points'
    //  - Construct two circles with 'radius'
    //  - per circle, per point in 'points'
    //    - if distance to circle < 'tolerance'
    //      - add 1 to score

    //  - return the high score circle

    //  TODO ideeen:
    //  - varreer kleine beetjes in de radius?
    //  - high score : top 5 gemiddelde <- might not be useful: results already amazing
    //  - embrace ovaal vorm 

    // seed
    // TODO SEED
    //np.random.seed(seed)

    console.log(points);

    // TODO do-over of high score system
    let high_score = 0
    let high_score_center: Vector2 = new Vector2(0,0);
    let high_score_radius = 0.0
    let high_score_ids: number[] = []

    let num_points = points.count();
    for (let i = 0 ; i < iterations; i++) {

        // randomize the radius a bit
        let this_radius = radius + (Math.random() - 0.5) * max_radius_deviation

        // choose two, and create a circle with it
        let id1 = randInt(0, num_points);
        let id2 = randInt(0, num_points);
        let centers = Circle2.centersFromPPR(points.getVector(id1), points.getVector(id2), this_radius)

        // print("found some centers: ", centers)
        for(let center of centers) {

            // figure out the score
            let includedIds = idsWithinCircle(points, center, radius, tolerance);
            let score = includedIds.length;

            // save if high score
            if (score > high_score) {
                high_score = score
                high_score_radius = this_radius
                high_score_center = center
                high_score_ids = includedIds;
            }
        }     
    }

    // feedback
    console.log("best score", high_score)
    if (high_score < min_score) {
        console.log("this is smaller than the minimum score: ransac failed.");
        return undefined;
    }

    // construct the best circle, and return it
    let best_circle = new Circle2(high_score_center, high_score_radius)
    return [best_circle, high_score_ids]
}

function idsWithinCircle(pts: Vector2Array, center: Vector2, radius: number, tolerance: number) : number[] {
    
    let indices: number[] = [];
    pts.forEach((p, i) => { 
        let distance = p.disTo(center);
        if (Math.abs(distance - radius) < tolerance) {
            indices.push(i);
        }
    })
    return indices;
}

/**
 * @param  {number} lower=0, including
 * @param  {number} upper=1, excluding
 */
function randInt(lower: number, upper: number) {
    return Math.floor(lower + (Math.random() * (upper-lower)));
}
