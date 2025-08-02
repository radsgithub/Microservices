// package: product
// file: product.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as product_pb from "./product_pb";

interface IProductServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    findOne: IProductServiceService_IFindOne;
    updateOne: IProductServiceService_IUpdateOne;
}

interface IProductServiceService_IFindOne extends grpc.MethodDefinition<product_pb.ProductById, product_pb.ProductResponse> {
    path: "/product.ProductService/FindOne";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<product_pb.ProductById>;
    requestDeserialize: grpc.deserialize<product_pb.ProductById>;
    responseSerialize: grpc.serialize<product_pb.ProductResponse>;
    responseDeserialize: grpc.deserialize<product_pb.ProductResponse>;
}
interface IProductServiceService_IUpdateOne extends grpc.MethodDefinition<product_pb.UpdateProductRequest, product_pb.ProductResponse> {
    path: "/product.ProductService/UpdateOne";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<product_pb.UpdateProductRequest>;
    requestDeserialize: grpc.deserialize<product_pb.UpdateProductRequest>;
    responseSerialize: grpc.serialize<product_pb.ProductResponse>;
    responseDeserialize: grpc.deserialize<product_pb.ProductResponse>;
}

export const ProductServiceService: IProductServiceService;

export interface IProductServiceServer {
    findOne: grpc.handleUnaryCall<product_pb.ProductById, product_pb.ProductResponse>;
    updateOne: grpc.handleUnaryCall<product_pb.UpdateProductRequest, product_pb.ProductResponse>;
}

export interface IProductServiceClient {
    findOne(request: product_pb.ProductById, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    findOne(request: product_pb.ProductById, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    findOne(request: product_pb.ProductById, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    updateOne(request: product_pb.UpdateProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    updateOne(request: product_pb.UpdateProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    updateOne(request: product_pb.UpdateProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
}

export class ProductServiceClient extends grpc.Client implements IProductServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public findOne(request: product_pb.ProductById, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    public findOne(request: product_pb.ProductById, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    public findOne(request: product_pb.ProductById, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    public updateOne(request: product_pb.UpdateProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    public updateOne(request: product_pb.UpdateProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
    public updateOne(request: product_pb.UpdateProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.ProductResponse) => void): grpc.ClientUnaryCall;
}
