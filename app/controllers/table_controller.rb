    class TableController < ApplicationController
    # renders table list
    #
    def index
        self.change_schema_to 'information_schema';
        @database_name = request[:database_name]
        #this hash will be returned to client
        @result = {
            success: true,
            rows:    [{
                tables: Table.where(TABLE_SCHEMA: @database_name,TABLE_TYPE: 'BASE TABLE').
                        select(%[TABLE_NAME table_name,ENGINE engine]).
                        inject([]) {|a,item| a.push [item[:table_name],item[:engine]]}
            }]
        }
        
        @result[:single_request] = true
        @result[:single_type] = :tableRoot
        
        render json: @result
    end
    # renders table-content
    #
    def content
        self.change_schema_to 'information_schema';
        self.init_controller
        order = !(request['sortOrder'].nil?) ? 'ORDER BY '+request['sortOrder'] : ' '
        #use new database
        ActiveRecord::Base.connection.execute 'use '+@database_name
        @result[:count] = ActiveRecord::Base.connection.select_one('SELECT count(*) c FROM `'+@table_name+'` '+@filter)['c']
        #set profiling
        ActiveRecord::Base.connection.execute 'set profiling = 1';
        sql = 'select * from `'+@table_name+'`'+@filter+' '+order+' limit '+request['start']+','+request['limit']
        
        @result[:rows] = ActiveRecord::Base.connection.select_all sql
        ActiveRecord::Base.connection.execute 'set profiling = 0';
        @result[:executed_time] = ActiveRecord::Base.connection.select_one('show profiles')['Duration'];
        ActiveRecord::Base.connection.execute 'use information_schema'
        
        render json: @result
    end
    # get info about table structure
    # with all foreign_keys if exists
    #
    def structure
        self.change_schema_to 'information_schema';
        @database_name, @table_name = request[:database_name], request[:name]
        @result = Hash.new success: true
        @result[:columns] = Column.where TABLE_SCHEMA: @database_name, TABLE_NAME: @table_name
        structure = Table.where(TABLE_SCHEMA: @database_name, TABLE_NAME: @table_name).first.attributes
        @result[:desc] = []
        structure.keys.length.times do |i|
            key = structure.keys[i]
            @result[:desc].push COLUMN_NAME: key, COLUMN_TYPE: structure[key]
        end
        
        @result[:type] = 'table'
        @result[:name] = @table_name
        
        render json: @result
    end
    #method parse table-columns
    #and apply valid type of datatype
    #and valid editor
    def createJsColumnModel
        @columns = ActiveRecord::Base.connection.select_all 'show columns from `'+@table_name+'`'
        @columns.each do |column_info|
            case column_info['Type']
                #string
                when /varchar/,/char/
                    type = column_info['Type']
                    len = type[type.index('(')+1...type.index(')')].to_i
                    column_info['Type'] = 'string'
                    
                    if len < 100
                        column_info['editor'] = {:xtype => 'textfield'} 
                    else
                        column_info['editor'] = {
                            :xtype     => 'textarea',
                            :minHeight => 100
                        } 
                    end
                #int
                when /int/,/binary/,/decimal/,/numeric/,/bit/,/timestamp/
                    column_info['Type'] = 'int'
                    column_info['editor'] = {
                        :xtype => 'numberfield'
                    }
                #real
                when /float/,/double/
                    column_info['Type'] = 'float'
                    column_info['editor'] = {:xtype => 'numberfield'}
                #enumeric
                when /enum/,/set/
                    values = column_info['Type']
                    values = values[values.index('(')+1...values.index(')')].split(',').map do |v|
                        {:p => (v[0] == "'" && v[v.length-1] == "'") ? v[1...-1] : v}
                    end
                    
                    column_info['editor'] = {
                        :xtype          => 'combo',
                        :triggerAction  => 'all',
                        :forceSelection => true,
                        :store => {
                            :xtype  => 'jsonstore',
                            :fields => ['p'],
                            :data   => values
                        },
                        :mode         => 'local',
                        :valueField   => 'p',
                        :displayField => 'p'
                    }
                    column_info['Type'] = 'string'
                #date
                when /date/i,/time/i,/year/i
                    date_desc = self.date_desc column_info
                    column_info['Type'] = date_desc[:type]
                    column_info['editor'] = date_desc[:editor]
                #text
                when /text/i
                    column_info['editor'] = {
                        :xtype => 'textarea',
                        :minHeight => 100
                    }
                    column_info['Type'] = 'string'
                else
                    column_info['Type'] = 'string'
                    column_info['editor'] = {
                        :xtype     => 'textarea',
                        :minHeight => 100
                    }
            end
        end
    end
    

    # create new table
    #
    def create
    end
    
    # drop all or single table from database
    #
    def drop
		ActiveRecord::Base.connection.execute "SET AUTOCOMMIT=0"
		ActiveRecord::Base.connection.execute "SET FOREIGN_KEY_CHECKS=0"

        self.change_schema_to 'information_schema';
        @result[:deleted] = []
        
        if request[:remove_all]
            #remove all tables
            @tables = ActiveRecord::Base.connection.select_all "select TABLE_NAME table_name from `TABLES` where `TABLE_SCHEMA`='#{request[:db_name]}'"
            self.change_schema_to request[:db_name];
            
            @tables.each do |table|
                ActiveRecord::Base.connection.execute "drop table `#{table["table_name"]}`"
                @result[:deleted].push table["table_name"];
            end
        else
            self.change_schema_to request[:db_name];
            ActiveRecord::Base.connection.execute "drop table `#{request[:key]}`";
            @result[:deleted].push request[:key];
        end
        
        self.change_schema_to 'information_schema';
        @result[:type] = 'table'
        render json: @result
    end
    
    def modify
    end
    
    def update
    end
    # function initialize
    # @database_name, @table_name, @result
    def init_controller
        @database_name, @table_name = request[:database_name], request[:table_name]
        @filter = ''
        @filter = ' where '+request[:filter] unless request[:filter] == '' || request[:filter].nil?
        @result = Hash.new success: true
    end
    
end
