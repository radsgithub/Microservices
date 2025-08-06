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
        Id: string,
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
    clearAddressesList(): void;
    getAddressesList(): Array<Address>;
    setAddressesList(value: Array<Address>): UserResponse;
    addAddresses(value?: Address, index?: number): Address;

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
        addressesList: Array<Address.AsObject>,
    }
}

export class Address extends jspb.Message { 
    getStreet(): string;
    setStreet(value: string): Address;
    getApartment(): string;
    setApartment(value: string): Address;
    getCity(): string;
    setCity(value: string): Address;
    getState(): string;
    setState(value: string): Address;
    getZipcode(): string;
    setZipcode(value: string): Address;
    getCountry(): string;
    setCountry(value: string): Address;
    getLabel(): string;
    setLabel(value: string): Address;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Address.AsObject;
    static toObject(includeInstance: boolean, msg: Address): Address.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Address, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Address;
    static deserializeBinaryFromReader(message: Address, reader: jspb.BinaryReader): Address;
}

export namespace Address {
    export type AsObject = {
        street: string,
        apartment: string,
        city: string,
        state: string,
        zipcode: string,
        country: string,
        label: string,
    }
}

export class AddAddressRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): AddAddressRequest;

    hasAddress(): boolean;
    clearAddress(): void;
    getAddress(): Address | undefined;
    setAddress(value?: Address): AddAddressRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AddAddressRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AddAddressRequest): AddAddressRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AddAddressRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AddAddressRequest;
    static deserializeBinaryFromReader(message: AddAddressRequest, reader: jspb.BinaryReader): AddAddressRequest;
}

export namespace AddAddressRequest {
    export type AsObject = {
        userid: string,
        address?: Address.AsObject,
    }
}

export class UpdateAddressRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): UpdateAddressRequest;

    hasAddress(): boolean;
    clearAddress(): void;
    getAddress(): Address | undefined;
    setAddress(value?: Address): UpdateAddressRequest;
    getAddressindex(): number;
    setAddressindex(value: number): UpdateAddressRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateAddressRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateAddressRequest): UpdateAddressRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateAddressRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateAddressRequest;
    static deserializeBinaryFromReader(message: UpdateAddressRequest, reader: jspb.BinaryReader): UpdateAddressRequest;
}

export namespace UpdateAddressRequest {
    export type AsObject = {
        userid: string,
        address?: Address.AsObject,
        addressindex: number,
    }
}

export class GetAddressesRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): GetAddressesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetAddressesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetAddressesRequest): GetAddressesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetAddressesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetAddressesRequest;
    static deserializeBinaryFromReader(message: GetAddressesRequest, reader: jspb.BinaryReader): GetAddressesRequest;
}

export namespace GetAddressesRequest {
    export type AsObject = {
        userid: string,
    }
}

export class AddressesResponse extends jspb.Message { 
    clearAddressesList(): void;
    getAddressesList(): Array<Address>;
    setAddressesList(value: Array<Address>): AddressesResponse;
    addAddresses(value?: Address, index?: number): Address;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AddressesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: AddressesResponse): AddressesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AddressesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AddressesResponse;
    static deserializeBinaryFromReader(message: AddressesResponse, reader: jspb.BinaryReader): AddressesResponse;
}

export namespace AddressesResponse {
    export type AsObject = {
        addressesList: Array<Address.AsObject>,
    }
}

export class DeleteAddressRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): DeleteAddressRequest;
    getAddressindex(): number;
    setAddressindex(value: number): DeleteAddressRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteAddressRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteAddressRequest): DeleteAddressRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteAddressRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteAddressRequest;
    static deserializeBinaryFromReader(message: DeleteAddressRequest, reader: jspb.BinaryReader): DeleteAddressRequest;
}

export namespace DeleteAddressRequest {
    export type AsObject = {
        userid: string,
        addressindex: number,
    }
}

export class LoginUserResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): LoginUserResponse;
    getEmail(): string;
    setEmail(value: string): LoginUserResponse;
    getFirstname(): string;
    setFirstname(value: string): LoginUserResponse;
    getLastname(): string;
    setLastname(value: string): LoginUserResponse;
    getPhone(): string;
    setPhone(value: string): LoginUserResponse;
    getRole(): string;
    setRole(value: string): LoginUserResponse;
    getIsactive(): boolean;
    setIsactive(value: boolean): LoginUserResponse;
    getProfileimage(): string;
    setProfileimage(value: string): LoginUserResponse;
    getPassword(): string;
    setPassword(value: string): LoginUserResponse;
    clearAddressesList(): void;
    getAddressesList(): Array<Address>;
    setAddressesList(value: Array<Address>): LoginUserResponse;
    addAddresses(value?: Address, index?: number): Address;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LoginUserResponse.AsObject;
    static toObject(includeInstance: boolean, msg: LoginUserResponse): LoginUserResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LoginUserResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LoginUserResponse;
    static deserializeBinaryFromReader(message: LoginUserResponse, reader: jspb.BinaryReader): LoginUserResponse;
}

export namespace LoginUserResponse {
    export type AsObject = {
        id: string,
        email: string,
        firstname: string,
        lastname: string,
        phone: string,
        role: string,
        isactive: boolean,
        profileimage: string,
        password: string,
        addressesList: Array<Address.AsObject>,
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
