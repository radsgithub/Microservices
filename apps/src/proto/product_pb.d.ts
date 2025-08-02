// package: product
// file: product.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class ProductById extends jspb.Message { 
    getProductid(): string;
    setProductid(value: string): ProductById;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProductById.AsObject;
    static toObject(includeInstance: boolean, msg: ProductById): ProductById.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProductById, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProductById;
    static deserializeBinaryFromReader(message: ProductById, reader: jspb.BinaryReader): ProductById;
}

export namespace ProductById {
    export type AsObject = {
        productid: string,
    }
}

export class ProductResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): ProductResponse;
    getName(): string;
    setName(value: string): ProductResponse;
    getDescription(): string;
    setDescription(value: string): ProductResponse;
    getPrice(): string;
    setPrice(value: string): ProductResponse;
    getStock(): string;
    setStock(value: string): ProductResponse;
    getCategory(): string;
    setCategory(value: string): ProductResponse;
    getIsactive(): boolean;
    setIsactive(value: boolean): ProductResponse;
    getImageurl(): string;
    setImageurl(value: string): ProductResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProductResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ProductResponse): ProductResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProductResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProductResponse;
    static deserializeBinaryFromReader(message: ProductResponse, reader: jspb.BinaryReader): ProductResponse;
}

export namespace ProductResponse {
    export type AsObject = {
        id: string,
        name: string,
        description: string,
        price: string,
        stock: string,
        category: string,
        isactive: boolean,
        imageurl: string,
    }
}

export class UpdateProductRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateProductRequest;
    getName(): string;
    setName(value: string): UpdateProductRequest;
    getDescription(): string;
    setDescription(value: string): UpdateProductRequest;
    getPrice(): string;
    setPrice(value: string): UpdateProductRequest;
    getStock(): string;
    setStock(value: string): UpdateProductRequest;
    getCategory(): string;
    setCategory(value: string): UpdateProductRequest;
    getIsactive(): boolean;
    setIsactive(value: boolean): UpdateProductRequest;
    getImageurl(): string;
    setImageurl(value: string): UpdateProductRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateProductRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateProductRequest): UpdateProductRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateProductRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateProductRequest;
    static deserializeBinaryFromReader(message: UpdateProductRequest, reader: jspb.BinaryReader): UpdateProductRequest;
}

export namespace UpdateProductRequest {
    export type AsObject = {
        id: string,
        name: string,
        description: string,
        price: string,
        stock: string,
        category: string,
        isactive: boolean,
        imageurl: string,
    }
}
