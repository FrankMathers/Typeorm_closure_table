import EventEmitter from "events"

export enum FileEvent {
  Change = "change",
  Rename = "rename"
}

export class FileEmitter extends EventEmitter {

}