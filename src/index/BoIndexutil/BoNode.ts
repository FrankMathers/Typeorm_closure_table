export class BoNode {
    public static count: number = 0;
    public name: string;

    public boName: string;
    public boNamespace: string;
    public path: string;
    public parentPath: string;
    public type: string;
    public isNode: boolean;
    public children: BoNode[];

    constructor() {
        this.children = [];
    }
}
