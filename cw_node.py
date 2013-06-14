import time
import psi
import psi.process
import psi.arch
import json
import socket
from zmq.eventloop import ioloop
from datetime import timedelta

# local modules
from cw_config import Config, NodeConfig
from cw_connection import Connection
from cw_node_data import NodeData, NodeSystemData, NodeProcsData, NodeDataDict

# load configuration
config = NodeConfig()
config.load_config()

# setup connection to master
connection = Connection(config.GetMasterEndpoint())
#connection.SendMsg( str( config.data ) )

# create node_data_dict to hold all node data we want to send to master
node_data_dict = NodeDataDict()

# add node's system info to node_data_dict
node_system_data = NodeSystemData(Config.GROUP_NODE, True)
node_system_data.set_node_endpoint(connection.GetLocalEndpoint())
node_system_data.set_cluster_name(config.GetClusterName())
node_data_dict.add_item(node_system_data)

# add node's proc info to node_data_dict
node_procs_data = NodeProcsData(Config.GROUP_PROCESSES, False)
node_procs_data.set_monitored_proc_names(config.GetMonitoredProcNames())
node_data_dict.add_item(node_procs_data)

# prepare node heartbeat data
node_heartbeat_data = {}
node_system_data.update(node_heartbeat_data)
node_heartbeat_data[Config.KEY_MSG_ID] = 2

# collection node info
def OnUpdateNodeInfo():
	#print "OnUpdateNodeInfo"
	node_data_dict.update()
	if NodeData.dirty:
		node_data_dict.data[Config.KEY_MSG_ID] = 1
		content = json.dumps(node_data_dict.data)
		connection.SendMsg(content)
	AddTimerUpdateNodeInfo()

# send heartbeat msg to master
def OnSendHeartbeat():
	print "OnSendHeartbeat"
	content = json.dumps(node_heartbeat_data)
	print "MSG = " + content
	#connection.SendMsg(content)
	AddTimerHeartbeat()

def AddTimerUpdateNodeInfo():
	loop.add_timeout(timedelta(0, 1), OnUpdateNodeInfo)

def AddTimerHeartbeat():
	loop.add_timeout(timedelta(0, 5), OnSendHeartbeat)

# eventloop
loop = ioloop.IOLoop.instance()
AddTimerUpdateNodeInfo()
AddTimerHeartbeat()
loop.start()
