import { Position, Utils } from "./Utils";
import { Node } from 'cc';
import { BlastGame } from "./BlastGame";

export class Tile {
    position: Position;
    type: number;
    node: Node;

    constructor(position: Position, type: number) {
        this.position = position;
        this.type = type;
    }
}