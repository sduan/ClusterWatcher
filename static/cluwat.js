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
var GREEN_NODE_PIC = '<img alt="Node Connected" class="icon32x32" src="/static/images/cluster_32.jpg" tooltip="node connected">';
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

function showNode(checkbox)
{
	$(checkbox.name).fadeToggle("slow");
}

function getStringSideNodeRow( side_node_id, node_name, node_id )
{
	return "<tr id=\"" + side_node_id + "\">" + TD_GREEN_NODE_PIC +
		   "<td align=\"center\"><input type='checkbox' checked onclick='showNode(this)' name='"+ node_id + "'/></td>" +
		   "<td align=\"center\">" + node_name + "</td></tr>";
}

function fillInNodeData(main_node_row, node_data)
{
    // var title_row = "<tr>";
    // var content_row = "<tr>";
    // for( var key in node_data.NODE )
    // {
    //     title_row += "<td>" + key + "</td>";
    //     content_row += "<td>" + node_data.NODE[key] + "</td>";
    // }
    // title_row += "</tr>";
    // content_row += "</tr>";
    // $(main_node_row).append( "<table width=\"100%\">" + title_row + content_row + "</table>" );

    // //$(main_node_row).append(CreateTableView([node_data.NODE], "lightPro", true)).fadeIn();
    // title_row = "<tr><td>PID</td><td>PPID</td><td>Command</td></tr>";
    // content_row = "";
    // for( var i in node_data.PROCESSES )
    // {
    //     content_row += "<tr>"
    //     for( var key in node_data.PROCESSES[i])
    //     {
    //         content_row += "<td>" + node_data.PROCESSES[i][key] + "</td>";
    //     }
    //     content_row += "</tr>"
    //     //main_node_row).append(CreateTableView([node_data.PROCESSES[proc]], "lightPro", true)).fadeIn();
    // }
    // $(main_node_row).append( "<table width=\"100%\">" + title_row + content_row + "</table>" );
    $(main_node_row).append(CreateTableView([node_data.NODE], "customers", true)).fadeIn();
    $(main_node_row).append(CreateTableView(node_data.PROCESSES, "lightPro", true)).fadeIn();
}

function drawSidePanel(cluster_data)
{
    //$("#side_panel").html("");
    $("#main_panel").html("");
    for( var key in cluster_data )
    {
        var cluster_name = cluster_data[key].NODE.cluster_name;
        var side_cluster_table_id = SIDE_CLUSTER_PREFIX + cluster_name;
        var side_cluster_table = "#" + side_cluster_table_id;

        var node_name = cluster_data[key].NODE.hostname;
        var side_node_id = SIDE_NODE_PREFIX + cluster_name + "_" + key.replace(/\./g, '_');
        var side_node_row = "#" + side_node_id;

        // main panel
        var main_cluster_table_id = MAIN_CLUSTER_PREFIX + cluster_name;
        var main_cluster_table = "#" + main_cluster_table_id;
        var main_node_id = MAIN_NODE_PREFIX + cluster_name + "_" + key.replace(/\./g, '_');
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
            var text = "<hr><table id=\"" + side_cluster_table_id + "\" class=\"customers\">" +
                       "<tr>" + TD_CLUSTER_PIC + "<td align='center' colspan='2'>" + cluster_name + "</td></tr>";
                       //"<tr><td width='10%' align=\"center\">status</td><td width='10%' align=\"center\">show</td><td align=\"center\">node name</td></tr></table>";
            $("#side_panel").append( text );
            $(side_cluster_table).append( getStringSideNodeRow( side_node_id, node_name, main_node_row ) );
        }

       if( $(main_cluster_table).length )
        {
            // cluster table already exist
            if($(main_node_row).length)
            {
                $(main_node_row).html("");
            }
            else
            {
                $(main_cluster_table).append( "<tr id=\"" + main_node_id + "\"></tr>" );
            }
            fillInNodeData(main_node_row, cluster_data[key]);
        }
        else
        {
            // create cluster table
            var text = "<hr><table width=\"100%\" id=\"" + main_cluster_table_id + "\">" +
                       "<tr id=\"" + main_node_id + "\"></tr></table>";
            $("#main_panel").append( text );
            fillInNodeData(main_node_row, cluster_data[key]);
        }
    }
    //var node = [cluster_data.NODE];
    //$("#side_panel").html("");
    //$("#side_panel").append(CreateTableView(node, "lightPro", true)).fadeIn();
};

function drawMainPanel(cluster_data)
{
    //var node = [cluster_data.NODE];
    //$("#main_panel").html("");
    //$("#main_panel").append(CreateTableView(node, "lightPro", true)).fadeIn();
};

function drawMainTable(cluster_data)
{
    cluster_data = JSON.parse(cluster_data)
    if( jQuery.isEmptyObject(cluster_data) )
    {
        $("#cluster_txt").html("<h3>There is no cluster to watch!</h3>");
        return;
    }
    // show debug text
    $("#cluster_txt").html("<hr><pre><code>" + FormatJSON(cluster_data) + "</code></pre>");

    // display received json data
    drawSidePanel(cluster_data);
    drawMainPanel(cluster_data);
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
        //updater.showMessage(event.data);
        drawMainTable(event.data);
    }
    },

    showMessage: function(message) {
        //var existing = $("#m" + message.id);
        //if (existing.length > 0) return;
        //var node = $(message.body);
        //node.hide();
		// var obj = JSON.parse(message.body);
		// console.log(obj)
		// var tbl_body = "";
		// $.each(obj.NODE, function() {
		// 	var tbl_row = "";
		// 	$.each(this, function(k , v) {
		// 			tbl_row += "<td>"+v+"</td>";
		// 	})
		// 	tbl_body += "<tr>"+tbl_row+"</tr>";
		// })

        // $("#inbox").html(tbl_body);
		// //$("#inbox").append(node);
        //node.slideDown();

        $("#cluster_txt").html(JSON.stringify(message));
        //drawMainTable(JSON.parse(message));
    }
};
