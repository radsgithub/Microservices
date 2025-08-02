// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var product_pb = require('./product_pb.js');

function serialize_product_ProductById(arg) {
  if (!(arg instanceof product_pb.ProductById)) {
    throw new Error('Expected argument of type product.ProductById');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_ProductById(buffer_arg) {
  return product_pb.ProductById.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_ProductResponse(arg) {
  if (!(arg instanceof product_pb.ProductResponse)) {
    throw new Error('Expected argument of type product.ProductResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_ProductResponse(buffer_arg) {
  return product_pb.ProductResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_product_UpdateProductRequest(arg) {
  if (!(arg instanceof product_pb.UpdateProductRequest)) {
    throw new Error('Expected argument of type product.UpdateProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_product_UpdateProductRequest(buffer_arg) {
  return product_pb.UpdateProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var ProductServiceService = exports.ProductServiceService = {
  findOne: {
    path: '/product.ProductService/FindOne',
    requestStream: false,
    responseStream: false,
    requestType: product_pb.ProductById,
    responseType: product_pb.ProductResponse,
    requestSerialize: serialize_product_ProductById,
    requestDeserialize: deserialize_product_ProductById,
    responseSerialize: serialize_product_ProductResponse,
    responseDeserialize: deserialize_product_ProductResponse,
  },
  updateOne: {
    path: '/product.ProductService/UpdateOne',
    requestStream: false,
    responseStream: false,
    requestType: product_pb.UpdateProductRequest,
    responseType: product_pb.ProductResponse,
    requestSerialize: serialize_product_UpdateProductRequest,
    requestDeserialize: deserialize_product_UpdateProductRequest,
    responseSerialize: serialize_product_ProductResponse,
    responseDeserialize: deserialize_product_ProductResponse,
  },
};

exports.ProductServiceClient = grpc.makeGenericClientConstructor(ProductServiceService, 'ProductService');
