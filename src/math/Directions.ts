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
}

