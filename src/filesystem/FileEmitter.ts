import EventEmitter from "events";

export enum FileEvent {
    Add = "add",
    Change = "change",
    AddDir = "addDir",
    Unlink = "unlink",
    UnlinkDir = "unlinkDir",
    Rename = "rename"
}

export class FileEmitter extends EventEmitter {}
