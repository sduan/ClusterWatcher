import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import tornado.template
import os.path
import uuid

from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

import zmq
from zmq.eventloop import ioloop, zmqstream
import json

ioloop.install()

#import tornado
#import tornado.web

# local modules
from cw_config import Config, MasterConfig

node_info_data = {}
#node_info_data[1] = "test"

def OnRecvNodeInfo( msg ):
	print "Message: " + str(msg)
	# print "From:" + str( socket.gethostname() ) + ":" + str( msg )
	# print str( s.gethostname() )
	str_msg = str( msg );
	str_msg = str_msg[2:]
	str_msg = str_msg[:-2]
	print str( str_msg )
	json_data = json.loads( str_msg )
	print "Received msg id[" + str( json_data["msg_id"] ) + "]"
	print "Json data: " + str( json_data )
	print "Received msg:" + str_msg
	key = json_data[Config.GROUP_NODE][Config.KEY_ENDPOINT]
	node_info_data[key] = str_msg
	stream.send( "ok" )
	ChatSocketHandler.send_message(json.dumps(node_info_data))



c = zmq.Context()
s = c.socket(zmq.REP)
s.bind('tcp://*:10001')
stream = zmqstream.ZMQStream(s)
stream.on_recv( OnRecvNodeInfo )

# while True:
# 	msg = str( s.recv(copy=False) )
# 	#print msg
# 	json_data = json.loads( msg )
# 	print "Received msg id[" + str( json_data["msg_id"] ) + "]"
# 	print "Json data: " + str( json_data )
# 	s.send(msg)
# 

# class TestHandler(tornado.web.RequestHandler):
# 	def get(self):
# 		print ("sending hello")
# #		stream.send("hello")
# #		print ( "node_info_data[1] = " + node_info_data[1] )
# #		self.write("hello")
# 		self.write( str( node_info_data[1] ) )
# application = tornado.web.Application([(r"/", TestHandler)])
# 
# if __name__ == "__main__":
# 	application.listen(8888)
# 	ioloop.IOLoop.instance().start()
# 
class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            (r"/chatsocket", ChatSocketHandler),
        ]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False,
        )
        tornado.web.Application.__init__(self, handlers, **settings)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        #self.render("JsonToHTML/index.html", messages=ChatSocketHandler.cache)
        # my_value=[]
        # my_value.append( {"Id":1, "UserName":"Sam Smith"} )
        # my_value.append( {"Id":2,"UserName":"Fred Frankly"} )
        # my_value.append( {"Id":1,"UserName":"Zachary Zupers"} )
        # #test = "[{\"Id\":1,\"UserName\":\"Sam Smith\"},{\"Id\":2,\"UserName\":\"Fred Frankly\"},{\"Id\":1,\"UserName\":\"Zachary Zupers\"}]"
        # #self.render("JsonToHTML/index.html", myvalue=test, messages=["abc", "def"])
        test = '{"NODE":[{"release": "2.6.32-220.7.1.el6.x86_64", "sysname": "Linux", "endpoint": "tcp://172.20.136.20:49095", "hostname": "GXCore20"}]}'
        mydata = json.dumps(node_info_data)
        self.render("index.html", data=mydata)

        # #self.render("JsonToHTML/index.html", myvalue=ChatSocketHandler.cache, messages=["abc", "def"])
        # #t = tornado.template.Template("<html>{{ myvalue }}</html>")
        # #self.write(t.generate(myvalue="xxx"))

class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = ""
    cache_size = 200

    def allow_draft76(self):
        # for iOS 5.0 Safari
        return True

    def open(self):
        ChatSocketHandler.waiters.add(self)

    def on_close(self):
        ChatSocketHandler.waiters.remove(self)

    @classmethod
    def update_cache(cls, chat):
        if len(cls.cache) == 0:
            logging.info("Append to cache")
            cls.cache.append(chat)
        else:
            logging.info("Replace to cache")
            cls.cache[0] = chat
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, chat):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(chat)
            except:
                logging.error("Error sending message", exc_info=True)

    def on_message(self, message):
        logging.info("got message %r", message)
        #parsed = tornado.escape.json_decode(message)
        #chat = {
        #    "id": str(uuid.uuid4()),
        #    "body": "hello",
        #    }
        #chat["html"] = tornado.escape.to_basestring(
        #   self.render_string("message.html", message=chat))
        #logging.info( "The chat: %s", str( chat ) )
        ChatSocketHandler.update_cache(message)
        ChatSocketHandler.send_updates(message)

    @classmethod
    def send_message(self, message):
        logging.info("I got message %r", message)
        # chat = {
        #     "id": str(uuid.uuid4()),
        #     "body": "hello",
        #     }
        # chat["html"] = '<div class="message" id="m5e57d54a-b7e5-44d3-a4aa-242e580a74bd">' + message + '</div>\n'
        # chat = message
        # ChatSocketHandler.update_cache(chat)
        # ChatSocketHandler.send_updates(chat)
        #t = tornado.template.Template("<html>{{ myvalue }}</html>")
        #ChatSocketHandler.send_updates(t.generate(myvalue=str(message)))
        # data = {}
        # data["body"] = message
        # logging.info("sending %r", data)
        ChatSocketHandler.cache = message
        ChatSocketHandler.send_updates(message)
	

def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
