// package: user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class CreateUserRequest extends jspb.Message { 
    getEmail(): string;
    setEmail(value: string): CreateUserRequest;
    getPassword(): string;
    setPassword(value: string): CreateUserRequest;
    getFirstname(): string;
    setFirstname(value: string): CreateUserRequest;
    getLastname(): string;
    setLastname(value: string): CreateUserRequest;
    getPhone(): string;
    setPhone(value: string): CreateUserRequest;
    getRole(): string;
    setRole(value: string): CreateUserRequest;
    getIsactive(): boolean;
    setIsactive(value: boolean): CreateUserRequest;
    getProfileimage(): string;
    setProfileimage(value: string): CreateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateUserRequest): CreateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateUserRequest;
    static deserializeBinaryFromReader(message: CreateUserRequest, reader: jspb.BinaryReader): CreateUserRequest;
}

export namespace CreateUserRequest {
    export type AsObject = {
        email: string,
        password: string,
        firstname: string,
        lastname: string,
        phone: string,
        role: string,
        isactive: boolean,
        profileimage: string,
    }
}

export class UserById extends jspb.Message { 
    getId(): string;
    setId(value: string): UserById;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserById.AsObject;
    static toObject(includeInstance: boolean, msg: UserById): UserById.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserById, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserById;
    static deserializeBinaryFromReader(message: UserById, reader: jspb.BinaryReader): UserById;
}

export namespace UserById {
    export type AsObject = {
        id: string,
    }
}

export class UserResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): UserResponse;
    getEmail(): string;
    setEmail(value: string): UserResponse;
    getFirstname(): string;
    setFirstname(value: string): UserResponse;
    getLastname(): string;
    setLastname(value: string): UserResponse;
    getPhone(): string;
    setPhone(value: string): UserResponse;
    getRole(): string;
    setRole(value: string): UserResponse;
    getIsactive(): boolean;
    setIsactive(value: boolean): UserResponse;
    getProfileimage(): string;
    setProfileimage(value: string): UserResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserResponse): UserResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserResponse;
    static deserializeBinaryFromReader(message: UserResponse, reader: jspb.BinaryReader): UserResponse;
}

export namespace UserResponse {
    export type AsObject = {
        id: string,
        email: string,
        firstname: string,
        lastname: string,
        phone: string,
        role: string,
        isactive: boolean,
        profileimage: string,
    }
}

export class FindUserRequest extends jspb.Message { 
    getEmail(): string;
    setEmail(value: string): FindUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FindUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FindUserRequest): FindUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FindUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FindUserRequest;
    static deserializeBinaryFromReader(message: FindUserRequest, reader: jspb.BinaryReader): FindUserRequest;
}

export namespace FindUserRequest {
    export type AsObject = {
        email: string,
    }
}
