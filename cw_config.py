import json

class Config(object):
	"""The base class of the configuration of cluster watcher.
	The configuration is stored in a JSON format file.
	"""

	# group name
	GROUP_PROCESSES = "PROCESSES"
	GROUP_MASTER = "MASTER"
	GROUP_NODE = "NODE"
	GROUP_MONITORED_PROCS = "MONITORED_PROCS"

	# key name
	KEY_MSG_ID = "msg_id"
	KEY_SYS_NAME = "sysname"
	KEY_RELEASE	= "release"
	KEY_HOSTNAME = "hostname"
	KEY_ENDPOINT = "endpoint"
	KEY_PID = "pid"
	KEY_PPID = "ppid"
	KEY_COMMAND = "command"

	def __init__(self):
		pass

	def load_config(self):
		print "Loading configuration from [%s]..." % self.filename 
		json_data = open(self.filename)
		self.data = json.load(json_data)
		json_data.close()

class MasterConfig(Config):
	"""The configuration for the cluster watcher master.
	The file is /etc/cluwat/cluwat.conf by default.
	"""
	def __init__(self):
		Config.__init__(self)
		self.filename = "cluwat.conf"

	def load_config(self):
		Config.load_config(self)

	def GetMasterEndpoint(self):
		return self.data[self.GROUP_MASTER][self.KEY_ENDPOINT]

class NodeConfig(Config):
	"""The configuration for the cluster watcher node.
	The file is /etc/cluwat/cluwat_node.conf by default.
	"""

	def __init__(self):
		Config.__init__(self)
		self.filename = "cluwat_node.conf"

	def load_config(self):
		Config.load_config(self)

	def GetMasterEndpoint(self):
		return self.data[self.GROUP_MASTER][self.KEY_ENDPOINT]

	def GetMonitoredProcNames(self):
		return self.data[self.GROUP_MONITORED_PROCS]
