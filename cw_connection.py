import zmq

class Connection(object):
	"""The base class for the connection between node and  master
	"""

	def __init__(self, endpoint):
		self.endpoint = endpoint
		# init zeromq
		self.context = zmq.Context()
		self.socket = self.context.socket(zmq.REQ)
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
		msg2 = self.socket.recv( copy = False )

	def GetLocalEndpoint(self):
		return self.local_endpoint

	def GetEndpoint(self):
		return self.endpoint
