import {Schema, ArraySchema, type, MapSchema} from "@colyseus/schema";

export class FieldCol extends Schema {
    @type(["int32"]) col = new ArraySchema<"int32">();
}

export class Field extends Schema {
    @type([FieldCol]) cols = new ArraySchema<FieldCol>();
}

export class Player extends Schema {
    @type("int32") id: number;
    @type("boolean") connected: boolean;
    @type("string") name: string;
    @type("string") sessionId: string;
    @type("string") sub: string;
    @type("int32") resources: number;
    @type("int32") score: number;
    @type("int32") development: number;
    @type("int32") milestones_reached: number;
    @type("string") color: string;
    @type("string") avatar: string;
}

export class GameState extends Schema {
    @type(Field) field: Field = new Field();
    @type({map: Player}) players = new MapSchema<Player>();
    @type("boolean") gameRunning: boolean = false;
    @type("boolean") gameOver: boolean = false;
    @type("string") time: string;
}

export class RelayState extends Schema {
    @type({map: Player}) players = new MapSchema<Player>();
    @type("boolean") gameRunning: boolean = false;
}
