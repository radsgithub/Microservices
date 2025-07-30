// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var user_pb = require('./user_pb.js');

function serialize_user_CreateUserRequest(arg) {
  if (!(arg instanceof user_pb.CreateUserRequest)) {
    throw new Error('Expected argument of type user.CreateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_CreateUserRequest(buffer_arg) {
  return user_pb.CreateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
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
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_FindUserRequest,
    requestDeserialize: deserialize_user_FindUserRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService, 'UserService');
