// package: user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as user_pb from "./user_pb";

interface IUserServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createUser: IUserServiceService_ICreateUser;
    findOne: IUserServiceService_IFindOne;
    findUser: IUserServiceService_IFindUser;
    addAddress: IUserServiceService_IAddAddress;
    updateAddress: IUserServiceService_IUpdateAddress;
    getAddresses: IUserServiceService_IGetAddresses;
    deleteAddress: IUserServiceService_IDeleteAddress;
}

interface IUserServiceService_ICreateUser extends grpc.MethodDefinition<user_pb.CreateUserRequest, user_pb.UserResponse> {
    path: "/user.UserService/CreateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.CreateUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.CreateUserRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IFindOne extends grpc.MethodDefinition<user_pb.UserById, user_pb.UserResponse> {
    path: "/user.UserService/FindOne";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.UserById>;
    requestDeserialize: grpc.deserialize<user_pb.UserById>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IFindUser extends grpc.MethodDefinition<user_pb.FindUserRequest, user_pb.LoginUserResponse> {
    path: "/user.UserService/FindUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.FindUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.FindUserRequest>;
    responseSerialize: grpc.serialize<user_pb.LoginUserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.LoginUserResponse>;
}
interface IUserServiceService_IAddAddress extends grpc.MethodDefinition<user_pb.AddAddressRequest, user_pb.UserResponse> {
    path: "/user.UserService/AddAddress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.AddAddressRequest>;
    requestDeserialize: grpc.deserialize<user_pb.AddAddressRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IUpdateAddress extends grpc.MethodDefinition<user_pb.UpdateAddressRequest, user_pb.UserResponse> {
    path: "/user.UserService/UpdateAddress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.UpdateAddressRequest>;
    requestDeserialize: grpc.deserialize<user_pb.UpdateAddressRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IGetAddresses extends grpc.MethodDefinition<user_pb.GetAddressesRequest, user_pb.AddressesResponse> {
    path: "/user.UserService/GetAddresses";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.GetAddressesRequest>;
    requestDeserialize: grpc.deserialize<user_pb.GetAddressesRequest>;
    responseSerialize: grpc.serialize<user_pb.AddressesResponse>;
    responseDeserialize: grpc.deserialize<user_pb.AddressesResponse>;
}
interface IUserServiceService_IDeleteAddress extends grpc.MethodDefinition<user_pb.DeleteAddressRequest, user_pb.UserResponse> {
    path: "/user.UserService/DeleteAddress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.DeleteAddressRequest>;
    requestDeserialize: grpc.deserialize<user_pb.DeleteAddressRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}

export const UserServiceService: IUserServiceService;

export interface IUserServiceServer {
    createUser: grpc.handleUnaryCall<user_pb.CreateUserRequest, user_pb.UserResponse>;
    findOne: grpc.handleUnaryCall<user_pb.UserById, user_pb.UserResponse>;
    findUser: grpc.handleUnaryCall<user_pb.FindUserRequest, user_pb.LoginUserResponse>;
    addAddress: grpc.handleUnaryCall<user_pb.AddAddressRequest, user_pb.UserResponse>;
    updateAddress: grpc.handleUnaryCall<user_pb.UpdateAddressRequest, user_pb.UserResponse>;
    getAddresses: grpc.handleUnaryCall<user_pb.GetAddressesRequest, user_pb.AddressesResponse>;
    deleteAddress: grpc.handleUnaryCall<user_pb.DeleteAddressRequest, user_pb.UserResponse>;
}

export interface IUserServiceClient {
    createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    findOne(request: user_pb.UserById, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    findOne(request: user_pb.UserById, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    findOne(request: user_pb.UserById, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    findUser(request: user_pb.FindUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    findUser(request: user_pb.FindUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    findUser(request: user_pb.FindUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    addAddress(request: user_pb.AddAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    addAddress(request: user_pb.AddAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    addAddress(request: user_pb.AddAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateAddress(request: user_pb.UpdateAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateAddress(request: user_pb.UpdateAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateAddress(request: user_pb.UpdateAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    getAddresses(request: user_pb.GetAddressesRequest, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    getAddresses(request: user_pb.GetAddressesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    getAddresses(request: user_pb.GetAddressesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    deleteAddress(request: user_pb.DeleteAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    deleteAddress(request: user_pb.DeleteAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    deleteAddress(request: user_pb.DeleteAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
}

export class UserServiceClient extends grpc.Client implements IUserServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public findOne(request: user_pb.UserById, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public findOne(request: user_pb.UserById, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public findOne(request: user_pb.UserById, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public findUser(request: user_pb.FindUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    public findUser(request: user_pb.FindUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    public findUser(request: user_pb.FindUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.LoginUserResponse) => void): grpc.ClientUnaryCall;
    public addAddress(request: user_pb.AddAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public addAddress(request: user_pb.AddAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public addAddress(request: user_pb.AddAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateAddress(request: user_pb.UpdateAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateAddress(request: user_pb.UpdateAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateAddress(request: user_pb.UpdateAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public getAddresses(request: user_pb.GetAddressesRequest, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    public getAddresses(request: user_pb.GetAddressesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    public getAddresses(request: user_pb.GetAddressesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.AddressesResponse) => void): grpc.ClientUnaryCall;
    public deleteAddress(request: user_pb.DeleteAddressRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public deleteAddress(request: user_pb.DeleteAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public deleteAddress(request: user_pb.DeleteAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
}
