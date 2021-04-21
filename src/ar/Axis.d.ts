import { ARNode } from '../AR';
export declare class Axis {
    private ar;
    private node;
    constructor(ar: any, node?: ARNode);
    private addAlpha;
    drawAxis(scale: any, offset?: any): void;
}
