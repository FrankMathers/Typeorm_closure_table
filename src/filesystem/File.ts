export class File {

  public static count: number = 0;
  public name: string;
  public path: string;
  public parentPath: string;
  public type: string;
  public isDir: boolean;
  public children: File[];

  constructor() {
    this.children = [];
  }
}