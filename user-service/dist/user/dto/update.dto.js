"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = void 0;
// update-user.dto.ts
const swagger_1 = require("@nestjs/swagger");
const create_dto_1 = require("./create.dto");
class UpdateUserDto extends (0, swagger_1.PartialType)(create_dto_1.CreateUserDto) {
}
exports.UpdateUserDto = UpdateUserDto;
