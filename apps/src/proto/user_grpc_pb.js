// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var user_pb = require('./user_pb.js');

function serialize_user_AddAddressRequest(arg) {
  if (!(arg instanceof user_pb.AddAddressRequest)) {
    throw new Error('Expected argument of type user.AddAddressRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_AddAddressRequest(buffer_arg) {
  return user_pb.AddAddressRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_AddressesResponse(arg) {
  if (!(arg instanceof user_pb.AddressesResponse)) {
    throw new Error('Expected argument of type user.AddressesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_AddressesResponse(buffer_arg) {
  return user_pb.AddressesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_CreateUserRequest(arg) {
  if (!(arg instanceof user_pb.CreateUserRequest)) {
    throw new Error('Expected argument of type user.CreateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_CreateUserRequest(buffer_arg) {
  return user_pb.CreateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_DeleteAddressRequest(arg) {
  if (!(arg instanceof user_pb.DeleteAddressRequest)) {
    throw new Error('Expected argument of type user.DeleteAddressRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_DeleteAddressRequest(buffer_arg) {
  return user_pb.DeleteAddressRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_FindUserRequest(arg) {
  if (!(arg instanceof user_pb.FindUserRequest)) {
    throw new Error('Expected argument of type user.FindUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_FindUserRequest(buffer_arg) {
  return user_pb.FindUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_GetAddressesRequest(arg) {
  if (!(arg instanceof user_pb.GetAddressesRequest)) {
    throw new Error('Expected argument of type user.GetAddressesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_GetAddressesRequest(buffer_arg) {
  return user_pb.GetAddressesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_LoginUserResponse(arg) {
  if (!(arg instanceof user_pb.LoginUserResponse)) {
    throw new Error('Expected argument of type user.LoginUserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_LoginUserResponse(buffer_arg) {
  return user_pb.LoginUserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UpdateAddressRequest(arg) {
  if (!(arg instanceof user_pb.UpdateAddressRequest)) {
    throw new Error('Expected argument of type user.UpdateAddressRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UpdateAddressRequest(buffer_arg) {
  return user_pb.UpdateAddressRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UserById(arg) {
  if (!(arg instanceof user_pb.UserById)) {
    throw new Error('Expected argument of type user.UserById');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UserById(buffer_arg) {
  return user_pb.UserById.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UserResponse(arg) {
  if (!(arg instanceof user_pb.UserResponse)) {
    throw new Error('Expected argument of type user.UserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UserResponse(buffer_arg) {
  return user_pb.UserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var UserServiceService = exports.UserServiceService = {
  createUser: {
    path: '/user.UserService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.CreateUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_CreateUserRequest,
    requestDeserialize: deserialize_user_CreateUserRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  findOne: {
    path: '/user.UserService/FindOne',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UserById,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_UserById,
    requestDeserialize: deserialize_user_UserById,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  findUser: {
    path: '/user.UserService/FindUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.FindUserRequest,
    responseType: user_pb.LoginUserResponse,
    requestSerialize: serialize_user_FindUserRequest,
    requestDeserialize: deserialize_user_FindUserRequest,
    responseSerialize: serialize_user_LoginUserResponse,
    responseDeserialize: deserialize_user_LoginUserResponse,
  },
  addAddress: {
    path: '/user.UserService/AddAddress',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.AddAddressRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_AddAddressRequest,
    requestDeserialize: deserialize_user_AddAddressRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  updateAddress: {
    path: '/user.UserService/UpdateAddress',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UpdateAddressRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_UpdateAddressRequest,
    requestDeserialize: deserialize_user_UpdateAddressRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  getAddresses: {
    path: '/user.UserService/GetAddresses',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.GetAddressesRequest,
    responseType: user_pb.AddressesResponse,
    requestSerialize: serialize_user_GetAddressesRequest,
    requestDeserialize: deserialize_user_GetAddressesRequest,
    responseSerialize: serialize_user_AddressesResponse,
    responseDeserialize: deserialize_user_AddressesResponse,
  },
  deleteAddress: {
    path: '/user.UserService/DeleteAddress',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.DeleteAddressRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_DeleteAddressRequest,
    requestDeserialize: deserialize_user_DeleteAddressRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService, 'UserService');
