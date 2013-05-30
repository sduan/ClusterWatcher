import psi
import psi.process
import psi.arch
import json
import socket

# local modules
from cw_config import Config

class NodeData(object):
	"""The is the base class that defines node information that need to send to master.
	"""
	dirty = True

	def __init__(self, name, is_static):
		self.name = name
		self.is_static = is_static

	def update_check(self, data_dict):
		if not self.name in data_dict.keys():
			data_dict[self.name] = {}
		if self.is_static and len(data_dict[self.name]) != 0:
			return False
		return True

class NodeSystemData(NodeData):
	"""The class collects node's system data such as hostname, version...
	"""

	def update(self, data_dict):
		if not self.update_check(data_dict):
			return
		data = {}
		data[Config.KEY_CLUSTER_NAME] = self.cluster_name
		data[Config.KEY_HOSTNAME] = socket.gethostname()
		data[Config.KEY_ENDPOINT] = self.endpoint
		data[Config.KEY_SYS_NAME] = psi.arch.arch_type().sysname
		data[Config.KEY_RELEASE] = psi.arch.arch_type().release
		# check if the data is dirty
		if data_dict[self.name] != data:
			data_dict[self.name] = data
			NodeData.dirty = True

	def set_node_endpoint(self, endpoint):
		self.endpoint = endpoint

	def set_cluster_name(self, cluster_name):
		self.cluster_name = cluster_name

class NodeProcsData(NodeData):
	"""The class collects node's processes data.
	"""

	def set_monitored_proc_names(self, monitored_proc_names):
		self.monitored_proc_names = monitored_proc_names

	def update(self, data_dict):
		if not self.update_check(data_dict):
			return
		data = []
		process_table = psi.process.ProcessTable()
		for process in process_table.values():
			for proc_name in self.monitored_proc_names:
				if proc_name in process.command:
					data.append( { Config.KEY_PID : process.pid, Config.KEY_PPID : process.ppid, Config.KEY_COMMAND : process.command } )
		if data_dict[self.name] != data:
			data_dict[self.name] = data
			NodeData.dirty = True

class NodeDataDict(object):
	"""The class contains all the node information that need to send to master.
	"""
	
	def __init__(self):
		self.items = []
		self.data = {}

	def add_item(self, item):
		self.items.append(item)

	def update(self):
		NodeData.dirty = False
		for item in self.items:
			item.update(self.data)

