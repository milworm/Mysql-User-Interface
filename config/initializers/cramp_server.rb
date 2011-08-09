## new thread for web_socket_server
#require 'cramp'
#require 'set'
#require 'json'
#
#Cramp::Websocket.backend = :thin
#
#class WebSocketSever < Cramp::Websocket
#    @@connections = Set.new
#
#    on_start  :run
#    on_data   :on_message
#
#    def run
#        puts "Connnection established"
#        @@connections << self
#    end
#
#    def on_message data
#        # process sending simple message to all participains of chat
#        @@connections.each do |connection|
#            connection.render data
#        end
#    end
#end
#
##Rack::Handler::Thin.run WebSocketSever, :Port => 3002
#
#
#
#
#
#
#
