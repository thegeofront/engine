import { Vector2 } from "./Vector2";

export enum D4 {
    Left,
    Up,
    Right,
    Down,
}

export enum D6 {
    PosX,
    NegX,
    PosY,
    NegY,
    PosZ,
    NegZ,
}

export enum D8 {
    Left,
    UpLeft,
    Up,
    UpRight,
    Right,
    DownRight,
    Down,
    DownLeft,
}

export namespace Direction {

    export const Four = [D8.Left, D8.Up, D8.Right, D8.Down];
    export const Eight = [D8.Left, D8.UpLeft, D8.Up, D8.UpRight, D8.Right, D8.DownRight, D8.Down, D8.DownLeft];


    export function D8ToVector(dir: D8) : Vector2 {

        switch(dir) {
            case D8.Left:
                return Vector2.new(-1,0);  
            case D8.UpLeft:
                return Vector2.new(-1,-1);  
            case D8.Up:
                return Vector2.new(0,-1);
            case D8.UpRight:
                return Vector2.new(1,-1);

            case D8.Right:
                return Vector2.new(1,0);
            case D8.DownRight:
                return Vector2.new(1,1);
            case D8.Down:
                return Vector2.new(0,1);
            case D8.DownLeft:
                return Vector2.new(-1,1);
            
        }
    }

    export function opposite(dir: D8) {
        switch(dir) {
            case D8.Left:       return D8.Right;
            case D8.UpLeft:     return D8.DownRight;
            case D8.Up:         return D8.Down;
            case D8.UpRight:    return D8.DownLeft;
            case D8.Right:      return D8.Left;
            case D8.DownRight:  return D8.UpLeft;
            case D8.Down:       return D8.Up;
            case D8.DownLeft:   return D8.UpRight;
        }
    }
}

