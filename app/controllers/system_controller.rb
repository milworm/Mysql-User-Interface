class SystemController < ApplicationController
    # renders server information
    #
    def index
        # variables
        @rows = []
        ActiveRecord::Base.connection.select_all('show variables').each do |item|
            @rows.push name: item["Variable_name"], value: item["Value"]
        end
        # status
        ActiveRecord::Base.connection.select_all('show global status').each do |item|
            @rows.push name: item["Variable_name"], value: item["Value"]
        end
        
        render json: {
          rows: @rows
        }
    end
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
        render json: {
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
        }
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
        render json: {
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
        }
    end
    
    def variables
        @result['rows'] = Variable.find :all
        render json: @result
    end
    
    def path
        require 'cgi'
        @pathname = request['pathName']
        
        if File.directory? @pathname
            @pathname = @pathname + '/' unless @pathname == '/'
            @result['rows'] = Dir["#{@pathname}*"].delete_if {|path| ['.', '..', '/'].include? path.chop}.inject([]){
                |a, path|
                    a.push name: path, isDir: (File.directory? path)
            }.sort_by {|h| h[:isDir] == true ? 0 : 1 }
        else
            self.read_file 
        end
        
        render json: @result
    end
    
    def read_file
        @result['rows'] = ''
        @result['overflow'] = false
        File.readlines(@pathname).each do |line|
            if @result['rows'].length < 10000
                @result['rows'] += line
            else
                @result['overflow']=true
                break
            end
        end
        
        @result['rows'] = CGI::escapeHTML @result['rows']
    end
    
end
