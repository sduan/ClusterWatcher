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
var TD_GREEN_PIC = '<td width=10%>' + GREEN_PIC + '</td>';

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    $("#messageform").live("submit", function() {
        newMessage($(this));
        return false;
    });
    $("#messageform").live("keypress", function(e) {
        if (e.keyCode == 13) {
            newMessage($(this));
            return false;
        }
    });
    $("#message").select();
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

function drawSidePanel(cluster_data)
{
    //$("#side_panel").html("");
    $("#main_panel").html("");
    for( var key in cluster_data )
    {
        var cluster_name = cluster_data[key].NODE.cluster_name;
        var node_name = cluster_data[key].NODE.hostname;
        var cluster_table_name = "#" + cluster_name;
        var node_id = cluster_name + "_" + key.replace(/\./g, '_');
        var node_id_name = "#" + node_id;
        if( $(cluster_table_name).length )
        {
            // cluster table already exist
            if(!$(node_id_name).length)
            {
                $(cluster_table_name).append( "<tr>" + TD_GREEN_PIC + "<td id=\"" + node_id + "\">" + node_name + "</td></tr>" );
            }
        }
        else
        {
            // create cluster table
            var text = "<table id=\"" + cluster_name + "\"><tr><td>" + cluster_name + "</td></tr></table>";
            $("#side_panel").append( text );
            $(cluster_table_name).append( "<tr>" + TD_GREEN_PIC + "<td id=\"" + node_id + "\">" + node_name + "</td></tr>" );
        }
        //$("#main_panel").append(CreateTableView([cluster_data[key].NODE], "lightPro", true)).fadeIn();
        var value = cluster_data[key];
        //$("#main_panel").append( JSON.stringify(value.NODE) );
        $("#main_panel").append(CreateTableView([value.NODE], "lightPro", true)).fadeIn();
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
    // show debug text
    $("#cluster_txt").html("<pre><code>" + FormatJSON(cluster_data) + "</code></pre>");

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
