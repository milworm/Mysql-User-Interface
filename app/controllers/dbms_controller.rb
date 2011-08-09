# here is a main controller
# which renders layout with included js-files
#

class DbmsController < ApplicationController
    layout "main"
    # action renders layout
    #
    def index
        @title = 'Database Management System(Mysql User Interface)'
    end
    
    #def start_web_socket_server
    #    Thread.new do
    #        EventMachine::WebSocket.start(:host => "127.0.0.1", :port => 5005) do |ws|
    #            ws.onopen {ws.send "hello"}
    #            ws.onmessage {|m| ws.send m+'fuck'}
    #        end
    #    end
    #    
    #    render nothing: true
    #end
    
    #def about
    #    EventMachine::WebSocket.stop 
    #end
    #def swf
    #    @filename ="#{RAILS_ROOT}/public/ext-3.2.1/resources/charts.swf"
    #    send_file(@filename, :filename => "charts.swf")
    #end
    
end
