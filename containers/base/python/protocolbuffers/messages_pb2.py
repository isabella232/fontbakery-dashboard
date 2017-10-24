# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: messages.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import any_pb2 as google_dot_protobuf_dot_any__pb2
import shared_pb2 as shared__pb2

from shared_pb2 import *

DESCRIPTOR = _descriptor.FileDescriptor(
  name='messages.proto',
  package='fontbakery.dashboard',
  syntax='proto3',
  serialized_pb=_b('\n\x0emessages.proto\x12\x14\x66ontbakery.dashboard\x1a\x19google/protobuf/any.proto\x1a\x0cshared.proto\"L\n\tFamilyJob\x12\r\n\x05\x64ocid\x18\x01 \x01(\t\x12\x30\n\x08\x63\x61\x63heKey\x18\x02 \x01(\x0b\x32\x1e.fontbakery.dashboard.CacheKey\"u\n\x14\x44istributedFamilyJob\x12\r\n\x05\x64ocid\x18\x01 \x01(\t\x12\x30\n\x08\x63\x61\x63heKey\x18\x02 \x01(\x0b\x32\x1e.fontbakery.dashboard.CacheKey\x12\r\n\x05jobid\x18\x03 \x01(\x05\x12\r\n\x05order\x18\x04 \x03(\t\"D\n\tCacheItem\x12%\n\x07payload\x18\x01 \x01(\x0b\x32\x14.google.protobuf.Any\x12\x10\n\x08\x63lientid\x18\x02 \x01(\t\"8\n\x08\x43\x61\x63heKey\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\x10\n\x08\x63lientid\x18\x02 \x01(\t\x12\r\n\x05\x66orce\x18\x03 \x01(\x08\"-\n\x0b\x43\x61\x63heStatus\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\x11\n\tinstances\x18\x02 \x01(\x05\x32\xe2\x01\n\x05\x43\x61\x63he\x12L\n\x03Put\x12\x1f.fontbakery.dashboard.CacheItem\x1a\x1e.fontbakery.dashboard.CacheKey\"\x00(\x01\x30\x01\x12=\n\x03Get\x12\x1e.fontbakery.dashboard.CacheKey\x1a\x14.google.protobuf.Any\"\x00\x12L\n\x05Purge\x12\x1e.fontbakery.dashboard.CacheKey\x1a!.fontbakery.dashboard.CacheStatus\"\x00P\x01\x62\x06proto3')
  ,
  dependencies=[google_dot_protobuf_dot_any__pb2.DESCRIPTOR,shared__pb2.DESCRIPTOR,],
  public_dependencies=[shared__pb2.DESCRIPTOR,])




_FAMILYJOB = _descriptor.Descriptor(
  name='FamilyJob',
  full_name='fontbakery.dashboard.FamilyJob',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='docid', full_name='fontbakery.dashboard.FamilyJob.docid', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='cacheKey', full_name='fontbakery.dashboard.FamilyJob.cacheKey', index=1,
      number=2, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=81,
  serialized_end=157,
)


_DISTRIBUTEDFAMILYJOB = _descriptor.Descriptor(
  name='DistributedFamilyJob',
  full_name='fontbakery.dashboard.DistributedFamilyJob',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='docid', full_name='fontbakery.dashboard.DistributedFamilyJob.docid', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='cacheKey', full_name='fontbakery.dashboard.DistributedFamilyJob.cacheKey', index=1,
      number=2, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='jobid', full_name='fontbakery.dashboard.DistributedFamilyJob.jobid', index=2,
      number=3, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='order', full_name='fontbakery.dashboard.DistributedFamilyJob.order', index=3,
      number=4, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=159,
  serialized_end=276,
)


_CACHEITEM = _descriptor.Descriptor(
  name='CacheItem',
  full_name='fontbakery.dashboard.CacheItem',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='payload', full_name='fontbakery.dashboard.CacheItem.payload', index=0,
      number=1, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='clientid', full_name='fontbakery.dashboard.CacheItem.clientid', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=278,
  serialized_end=346,
)


_CACHEKEY = _descriptor.Descriptor(
  name='CacheKey',
  full_name='fontbakery.dashboard.CacheKey',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='key', full_name='fontbakery.dashboard.CacheKey.key', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='clientid', full_name='fontbakery.dashboard.CacheKey.clientid', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='force', full_name='fontbakery.dashboard.CacheKey.force', index=2,
      number=3, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=348,
  serialized_end=404,
)


_CACHESTATUS = _descriptor.Descriptor(
  name='CacheStatus',
  full_name='fontbakery.dashboard.CacheStatus',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='key', full_name='fontbakery.dashboard.CacheStatus.key', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='instances', full_name='fontbakery.dashboard.CacheStatus.instances', index=1,
      number=2, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=406,
  serialized_end=451,
)

_FAMILYJOB.fields_by_name['cacheKey'].message_type = _CACHEKEY
_DISTRIBUTEDFAMILYJOB.fields_by_name['cacheKey'].message_type = _CACHEKEY
_CACHEITEM.fields_by_name['payload'].message_type = google_dot_protobuf_dot_any__pb2._ANY
DESCRIPTOR.message_types_by_name['FamilyJob'] = _FAMILYJOB
DESCRIPTOR.message_types_by_name['DistributedFamilyJob'] = _DISTRIBUTEDFAMILYJOB
DESCRIPTOR.message_types_by_name['CacheItem'] = _CACHEITEM
DESCRIPTOR.message_types_by_name['CacheKey'] = _CACHEKEY
DESCRIPTOR.message_types_by_name['CacheStatus'] = _CACHESTATUS
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

FamilyJob = _reflection.GeneratedProtocolMessageType('FamilyJob', (_message.Message,), dict(
  DESCRIPTOR = _FAMILYJOB,
  __module__ = 'messages_pb2'
  # @@protoc_insertion_point(class_scope:fontbakery.dashboard.FamilyJob)
  ))
_sym_db.RegisterMessage(FamilyJob)

DistributedFamilyJob = _reflection.GeneratedProtocolMessageType('DistributedFamilyJob', (_message.Message,), dict(
  DESCRIPTOR = _DISTRIBUTEDFAMILYJOB,
  __module__ = 'messages_pb2'
  # @@protoc_insertion_point(class_scope:fontbakery.dashboard.DistributedFamilyJob)
  ))
_sym_db.RegisterMessage(DistributedFamilyJob)

CacheItem = _reflection.GeneratedProtocolMessageType('CacheItem', (_message.Message,), dict(
  DESCRIPTOR = _CACHEITEM,
  __module__ = 'messages_pb2'
  # @@protoc_insertion_point(class_scope:fontbakery.dashboard.CacheItem)
  ))
_sym_db.RegisterMessage(CacheItem)

CacheKey = _reflection.GeneratedProtocolMessageType('CacheKey', (_message.Message,), dict(
  DESCRIPTOR = _CACHEKEY,
  __module__ = 'messages_pb2'
  # @@protoc_insertion_point(class_scope:fontbakery.dashboard.CacheKey)
  ))
_sym_db.RegisterMessage(CacheKey)

CacheStatus = _reflection.GeneratedProtocolMessageType('CacheStatus', (_message.Message,), dict(
  DESCRIPTOR = _CACHESTATUS,
  __module__ = 'messages_pb2'
  # @@protoc_insertion_point(class_scope:fontbakery.dashboard.CacheStatus)
  ))
_sym_db.RegisterMessage(CacheStatus)



_CACHE = _descriptor.ServiceDescriptor(
  name='Cache',
  full_name='fontbakery.dashboard.Cache',
  file=DESCRIPTOR,
  index=0,
  options=None,
  serialized_start=454,
  serialized_end=680,
  methods=[
  _descriptor.MethodDescriptor(
    name='Put',
    full_name='fontbakery.dashboard.Cache.Put',
    index=0,
    containing_service=None,
    input_type=_CACHEITEM,
    output_type=_CACHEKEY,
    options=None,
  ),
  _descriptor.MethodDescriptor(
    name='Get',
    full_name='fontbakery.dashboard.Cache.Get',
    index=1,
    containing_service=None,
    input_type=_CACHEKEY,
    output_type=google_dot_protobuf_dot_any__pb2._ANY,
    options=None,
  ),
  _descriptor.MethodDescriptor(
    name='Purge',
    full_name='fontbakery.dashboard.Cache.Purge',
    index=2,
    containing_service=None,
    input_type=_CACHEKEY,
    output_type=_CACHESTATUS,
    options=None,
  ),
])
_sym_db.RegisterServiceDescriptor(_CACHE)

DESCRIPTOR.services_by_name['Cache'] = _CACHE

try:
  # THESE ELEMENTS WILL BE DEPRECATED.
  # Please use the generated *_pb2_grpc.py files instead.
  import grpc
  from grpc.beta import implementations as beta_implementations
  from grpc.beta import interfaces as beta_interfaces
  from grpc.framework.common import cardinality
  from grpc.framework.interfaces.face import utilities as face_utilities


  class CacheStub(object):
    """The greeting service definition.
    """

    def __init__(self, channel):
      """Constructor.

      Args:
        channel: A grpc.Channel.
      """
      self.Put = channel.stream_stream(
          '/fontbakery.dashboard.Cache/Put',
          request_serializer=CacheItem.SerializeToString,
          response_deserializer=CacheKey.FromString,
          )
      self.Get = channel.unary_unary(
          '/fontbakery.dashboard.Cache/Get',
          request_serializer=CacheKey.SerializeToString,
          response_deserializer=google_dot_protobuf_dot_any__pb2.Any.FromString,
          )
      self.Purge = channel.unary_unary(
          '/fontbakery.dashboard.Cache/Purge',
          request_serializer=CacheKey.SerializeToString,
          response_deserializer=CacheStatus.FromString,
          )


  class CacheServicer(object):
    """The greeting service definition.
    """

    def Put(self, request_iterator, context):
      """Sends a greeting
      """
      context.set_code(grpc.StatusCode.UNIMPLEMENTED)
      context.set_details('Method not implemented!')
      raise NotImplementedError('Method not implemented!')

    def Get(self, request, context):
      """Sends another greeting
      """
      context.set_code(grpc.StatusCode.UNIMPLEMENTED)
      context.set_details('Method not implemented!')
      raise NotImplementedError('Method not implemented!')

    def Purge(self, request, context):
      # missing associated documentation comment in .proto file
      pass
      context.set_code(grpc.StatusCode.UNIMPLEMENTED)
      context.set_details('Method not implemented!')
      raise NotImplementedError('Method not implemented!')


  def add_CacheServicer_to_server(servicer, server):
    rpc_method_handlers = {
        'Put': grpc.stream_stream_rpc_method_handler(
            servicer.Put,
            request_deserializer=CacheItem.FromString,
            response_serializer=CacheKey.SerializeToString,
        ),
        'Get': grpc.unary_unary_rpc_method_handler(
            servicer.Get,
            request_deserializer=CacheKey.FromString,
            response_serializer=google_dot_protobuf_dot_any__pb2.Any.SerializeToString,
        ),
        'Purge': grpc.unary_unary_rpc_method_handler(
            servicer.Purge,
            request_deserializer=CacheKey.FromString,
            response_serializer=CacheStatus.SerializeToString,
        ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
        'fontbakery.dashboard.Cache', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


  class BetaCacheServicer(object):
    """The Beta API is deprecated for 0.15.0 and later.

    It is recommended to use the GA API (classes and functions in this
    file not marked beta) for all further purposes. This class was generated
    only to ease transition from grpcio<0.15.0 to grpcio>=0.15.0."""
    """The greeting service definition.
    """
    def Put(self, request_iterator, context):
      """Sends a greeting
      """
      context.code(beta_interfaces.StatusCode.UNIMPLEMENTED)
    def Get(self, request, context):
      """Sends another greeting
      """
      context.code(beta_interfaces.StatusCode.UNIMPLEMENTED)
    def Purge(self, request, context):
      # missing associated documentation comment in .proto file
      pass
      context.code(beta_interfaces.StatusCode.UNIMPLEMENTED)


  class BetaCacheStub(object):
    """The Beta API is deprecated for 0.15.0 and later.

    It is recommended to use the GA API (classes and functions in this
    file not marked beta) for all further purposes. This class was generated
    only to ease transition from grpcio<0.15.0 to grpcio>=0.15.0."""
    """The greeting service definition.
    """
    def Put(self, request_iterator, timeout, metadata=None, with_call=False, protocol_options=None):
      """Sends a greeting
      """
      raise NotImplementedError()
    def Get(self, request, timeout, metadata=None, with_call=False, protocol_options=None):
      """Sends another greeting
      """
      raise NotImplementedError()
    Get.future = None
    def Purge(self, request, timeout, metadata=None, with_call=False, protocol_options=None):
      # missing associated documentation comment in .proto file
      pass
      raise NotImplementedError()
    Purge.future = None


  def beta_create_Cache_server(servicer, pool=None, pool_size=None, default_timeout=None, maximum_timeout=None):
    """The Beta API is deprecated for 0.15.0 and later.

    It is recommended to use the GA API (classes and functions in this
    file not marked beta) for all further purposes. This function was
    generated only to ease transition from grpcio<0.15.0 to grpcio>=0.15.0"""
    request_deserializers = {
      ('fontbakery.dashboard.Cache', 'Get'): CacheKey.FromString,
      ('fontbakery.dashboard.Cache', 'Purge'): CacheKey.FromString,
      ('fontbakery.dashboard.Cache', 'Put'): CacheItem.FromString,
    }
    response_serializers = {
      ('fontbakery.dashboard.Cache', 'Get'): google_dot_protobuf_dot_any__pb2.Any.SerializeToString,
      ('fontbakery.dashboard.Cache', 'Purge'): CacheStatus.SerializeToString,
      ('fontbakery.dashboard.Cache', 'Put'): CacheKey.SerializeToString,
    }
    method_implementations = {
      ('fontbakery.dashboard.Cache', 'Get'): face_utilities.unary_unary_inline(servicer.Get),
      ('fontbakery.dashboard.Cache', 'Purge'): face_utilities.unary_unary_inline(servicer.Purge),
      ('fontbakery.dashboard.Cache', 'Put'): face_utilities.stream_stream_inline(servicer.Put),
    }
    server_options = beta_implementations.server_options(request_deserializers=request_deserializers, response_serializers=response_serializers, thread_pool=pool, thread_pool_size=pool_size, default_timeout=default_timeout, maximum_timeout=maximum_timeout)
    return beta_implementations.server(method_implementations, options=server_options)


  def beta_create_Cache_stub(channel, host=None, metadata_transformer=None, pool=None, pool_size=None):
    """The Beta API is deprecated for 0.15.0 and later.

    It is recommended to use the GA API (classes and functions in this
    file not marked beta) for all further purposes. This function was
    generated only to ease transition from grpcio<0.15.0 to grpcio>=0.15.0"""
    request_serializers = {
      ('fontbakery.dashboard.Cache', 'Get'): CacheKey.SerializeToString,
      ('fontbakery.dashboard.Cache', 'Purge'): CacheKey.SerializeToString,
      ('fontbakery.dashboard.Cache', 'Put'): CacheItem.SerializeToString,
    }
    response_deserializers = {
      ('fontbakery.dashboard.Cache', 'Get'): google_dot_protobuf_dot_any__pb2.Any.FromString,
      ('fontbakery.dashboard.Cache', 'Purge'): CacheStatus.FromString,
      ('fontbakery.dashboard.Cache', 'Put'): CacheKey.FromString,
    }
    cardinalities = {
      'Get': cardinality.Cardinality.UNARY_UNARY,
      'Purge': cardinality.Cardinality.UNARY_UNARY,
      'Put': cardinality.Cardinality.STREAM_STREAM,
    }
    stub_options = beta_implementations.stub_options(host=host, metadata_transformer=metadata_transformer, request_serializers=request_serializers, response_deserializers=response_deserializers, thread_pool=pool, thread_pool_size=pool_size)
    return beta_implementations.dynamic_stub(channel, 'fontbakery.dashboard.Cache', cardinalities, options=stub_options)
except ImportError:
  pass
# @@protoc_insertion_point(module_scope)
