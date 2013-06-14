import zmq
from zmq.eventloop.zmqstream import ZMQStream

class Connection(object):
	"""The base class for the connection between node and  master
	"""

	def __init__(self, endpoint):
		self.endpoint = endpoint
		# init zeromq
		self.context = zmq.Context()
		self.socket = self.context.socket(zmq.REQ)
		self.stream = ZMQStream(self.socket)
		self.stream.on_recv(self.OnRecvMsg)
		# get local endpoint
		self.socket.bind("tcp://eth0:*")
		self.local_endpoint = str(self.socket.getsockopt(zmq.LAST_ENDPOINT))
		print "Local endpoint [%s]" % self.local_endpoint
		# connect to target
		self.socket.connect(endpoint)
		print "Connected to [%s]" % endpoint

	def SendMsg(self, msg):
		self.socket.send(msg, copy=False)
		print "Sending message [%s]" % msg
		#msg_rsp = self.socket.recv( copy = False )
		#print "Receiving message [%s]" % msg_rsp

	def OnRecvMsg(self, msg):
		#msg_rsp = self.socket.recv( copy = False )
		#print "Receiving message [%s]" % msg_rsp
		print "Receiving message ========== [%s]" % msg

	def GetLocalEndpoint(self):
		return self.local_endpoint

	def GetEndpoint(self):
		return self.endpoint
