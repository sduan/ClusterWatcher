import time
import psi
import psi.process
import psi.arch
import json
import socket

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

# collection node info
while True:
	node_data_dict.update()
	if NodeData.dirty:
		node_data_dict.data[Config.KEY_MSG_ID] = 1
		content = json.dumps(node_data_dict.data)
		connection.SendMsg(content)
	time.sleep(1)

