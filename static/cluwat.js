// Copyright 2009 FriendFeed
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var GREEN_PIC = '<img alt="Success" class="icon32x32" src="/static/images/green.png" tooltip="connected">';
var TD_GREEN_PIC = '<td align=\"center\">' + GREEN_PIC + '</td>';
var CLUSTER_PIC = '<img alt="Cluster" class="icon32x32" src="/static/images/cluster_32.jpg" tooltip="cluster">';
var TD_CLUSTER_PIC = '<td align=\"center\">' + CLUSTER_PIC + '</td>';
var GREEN_NODE_PIC = '<img alt="Node Connected" class="icon32x32" src="/static/images/node_green_32.jpg" tooltip="node connected">';
var TD_GREEN_NODE_PIC = '<td align=\"center\">' + GREEN_NODE_PIC + '</td>';
var SIDE_CLUSTER_PREFIX = "side_cluster_"
var SIDE_NODE_PREFIX = "side_node_"
var MAIN_CLUSTER_PREFIX = "main_cluster_"
var MAIN_NODE_PREFIX = "main_node_"

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    updater.start();
});

function newMessage(form) {
    var message = form.formToDict();
    updater.socket.send(JSON.stringify(message));
    form.find("input[type=text]").val("").select();
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

function textOverHr(text)
{
    return '<table class="text_over_hr"><tr><td><hr></td><td class="text_cell">' + text + '</td><td><hr></td></tr></table>';
}

function showNode(checkbox)
{
	$(checkbox.name).fadeToggle("slow");
}

function getStringSideNodeRow( side_node_id, node_name, node_id )
{
	return "<tr id=\"" + side_node_id + "\">" + TD_GREEN_NODE_PIC +
		   "<td align=\"center\"><input type='checkbox' checked onclick='showNode(this)' name='"+ node_id + "'/></td>" +
		   "<td align=\"center\"> <a href='" + node_id + "'>" + node_name + "</a></td></tr>";
}

function fillInNodeData(main_node_row, node_data)
{
    $(main_node_row).append(textOverHr(node_data.NODE.cluster_name + " :: " + node_data.NODE.hostname));
    $(main_node_row).append(CreateTableView([node_data.NODE], "customers", true)).fadeIn();
    $(main_node_row).append(CreateTableView(node_data.PROCESSES, "lightPro", true)).fadeIn();
}

function drawMainPanel(node_key, cluster_data)
{
    var cluster_name = cluster_data[node_key].NODE.cluster_name;
    var main_cluster_table_id = MAIN_CLUSTER_PREFIX + cluster_name;
    var main_cluster_table = "#" + main_cluster_table_id;
    var main_node_id = MAIN_NODE_PREFIX + cluster_name + "_" + node_key.replace(/\./g, '_');
    var main_node_row = "#" + main_node_id;

    if( $(main_cluster_table).length )
    {
        // cluster table already exist
        if($(main_node_row).length)
        {
            $(main_node_row).html("");
        }
        else
        {
            $(main_cluster_table).append( '<tr id="' + main_node_id + '"></tr>' );
        }
        fillInNodeData(main_node_row, cluster_data[node_key]);
    }
    else
    {
        // create cluster table
        var text = '<table class="main_cluster" id="' + main_cluster_table_id + '">' +
                   '<tr id="' + main_node_id + '"></tr></table>';
        $('#main_panel').append( text );
        fillInNodeData(main_node_row, cluster_data[node_key]);
    }
}

function drawSidePanel(node_key, cluster_data)
{
	var cluster_name = cluster_data[node_key].NODE.cluster_name;
	var side_cluster_table_id = SIDE_CLUSTER_PREFIX + cluster_name;
	var side_cluster_table = "#" + side_cluster_table_id;

	var node_name = cluster_data[node_key].NODE.hostname;
	var side_node_id = SIDE_NODE_PREFIX + cluster_name + "_" + node_key.replace(/\./g, '_');
	var side_node_row = "#" + side_node_id;
	var main_node_id = MAIN_NODE_PREFIX + cluster_name + "_" + node_key.replace(/\./g, '_');
	var main_node_row = "#" + main_node_id;

	if( $(side_cluster_table).length )
	{
		// cluster table already exist
		if(!$(side_node_row).length)
		{
			$(side_cluster_table).append( getStringSideNodeRow( side_node_id, node_name, main_node_row ) );
		}
	}
	else
	{
		// create cluster table
		var text = '<hr><table id="' + side_cluster_table_id + '" class="side_cluster" cellspacing="0" cellpadding="0">' +
			'<tr>' + TD_CLUSTER_PIC + '<td class="cluster_name" align="center" colspan="2"> <a href="#' + MAIN_CLUSTER_PREFIX + cluster_name + '">' + cluster_name + '</a></td></tr>';
		$('#side_panel').append( text );
		$(side_cluster_table).append( getStringSideNodeRow( side_node_id, node_name, main_node_row ) );
	}
}

function drawMainTable(cluster_data)
{
    cluster_data = JSON.parse(cluster_data)
    if( jQuery.isEmptyObject(cluster_data) )
    {
        $("#cluster_txt").html("<h3>There is no cluster to watch!</h3>");
        return;
    }

    // display received json data
    $("#main_panel").html("");
    for( var key in cluster_data )
    {
		drawSidePanel(key, cluster_data)
        drawMainPanel(key, cluster_data);
    }

    // show debug text
    $("#cluster_txt").html("<hr><pre><code>" + FormatJSON(cluster_data) + "</code></pre>");
};

var updater = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/chatsocket";
        if ("WebSocket" in window) {
            updater.socket = new WebSocket(url);
        } else {
            updater.socket = new MozWebSocket(url);
        }
        updater.socket.onmessage = function(event) {
            //alert("message received: " + event.data);
            drawMainTable(event.data);
        }
    },

    showMessage: function(message) {
        $("#cluster_txt").html(JSON.stringify(message));
    }
};
