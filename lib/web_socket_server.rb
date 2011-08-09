require 'json'
require 'em-websocket'
# renders infor for client-side charts
# total cpu usage info
def cpu_usage
     # all usage
    total_used_cpu = IO.popen("ps aux").read.split("\n").inject 0 do |a, i|
        a += i.split(' ')[2].to_f
    end
    # mysqld usage
    tread_desc = IO.popen("ps aux|grep mysqld").read.split("\n")[0].split " " #get total info about mysql-process
    #form json
    return  {
        rows: [{
            type:  "CPU free",
            total: 100
        },{
            type:  "Mysql used",
            total: tread_desc[2].to_f
        },{
            type: 'Other',
            total: total_used_cpu - tread_desc[2].to_f
        }]
    }.to_json
end

# renders infor for client-side charts
# total memory usage info
def mem_usage
    # all usage
    total_used_memory = IO.popen("ps aux").read.split("\n").inject 0 do |a, i|
        a += i.split(' ')[3].to_f
    end
    # mysql usage
    tread_desc = IO.popen("ps aux|grep mysqld").read.split("\n")[0].split " " #get total info about mysql-process
    #form json
    return {
        rows: [{
            type:  "Memory free",
            total: 100
        },{
            type:  "Mysql used",
            total: tread_desc[3].to_f
        },{
            type: 'Other',
            total: total_used_memory-tread_desc[3].to_f
        }]
    }.to_json
end

def start_web_socket
    EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 3003) do |ws|
        ws.onopen {ws.send "hello"}
        ws.onmessage {|m| ws.send m}
        #s = cpu_usage()
        #sleep 1
        #ws.send s
    end
end

start_web_socket()