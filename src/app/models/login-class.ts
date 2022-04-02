// To parse this data:
//
//   import { LoginClass } from "./file";
//
//   const loginClass = json;
//

export interface LoginClass {
    res: boolean;
    token: string;
    id: number;
    rol: number;
    estado_id: number;
    message: string;
}

