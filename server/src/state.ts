// MyState.ts
import { Schema, ArraySchema, type } from "@colyseus/schema";

// export class Cell extends Schema {
//     @type("int32") x = 0;
// }

export class FieldCol extends Schema {
    @type(["int32"]) col = new ArraySchema<"int32">();
}

export class Field extends Schema {
    @type([FieldCol]) cols = new ArraySchema<FieldCol>();
}

export class RoomState extends Schema {
    @type(Field) field: Field = new Field();
}