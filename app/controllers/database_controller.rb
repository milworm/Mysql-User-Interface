# performs operations with database
# such as 'drop','create', 'view', 'view_all'
#
class DatabaseController < ApplicationController
    # gets information about all databases
    # or for specified database unless request[:databaseName].nil?
    #
    
    def index
        self.change_schema_to 'information_schema'
        # if databaseName is specified find info about it
        # else for all
        @result[:single_request] = !request[:database_name].nil?
        query = @result[:single_request] ? Schemata.where(SCHEMA_NAME: request[:database_name]) : Schemata
        #join to triggers routines
        @database_list = query.routines.tables.triggers #get all triggers, routines, tables
        .select('SCHEMATA.SCHEMA_NAME database_name, TABLES.TABLE_NAME table_name, TABLES.ENGINE table_engine,
                 ROUTINES.ROUTINE_NAME routine_name, ROUTINES.ROUTINE_TYPE routine_type, TRIGGERS.EVENT_MANIPULATION event_type, TRIGGERS.ACTION_TIMING action_timing,
                 TRIGGERS.TRIGGER_NAME trigger_name, TABLES.TABLE_TYPE table_type').
            order('database_name', 'table_name')
        self.clr_buff ''
        @result[:rows] = @database_list.inject [] do |acc, item|
            self.clr_buff item.database_name if @buffer[:db_name] == ''
            # push to result all info about database if database if changed
            if item.database_name != @buffer[:db_name] && @buffer[:db_name] != ''
                acc.push @buffer
                self.clr_buff item.database_name
            end
            # push to result view if it is exists
            @buffer[:views].push [item.table_name, item.table_type] if (item.table_type == 'VIEW' || item.table_type == 'SYSTEM VIEW')
            # if table has a trigger and there are any trigger for this table set it as []
            # push table to tables
            if @buffer[:triggers][item.table_name].nil? && item.trigger_name
                @buffer[:triggers][item.table_name] = []
                @buffer[:tables] |= [ [item.table_name, item.table_engine] ]
            end
            # if table has a trigger, in buffer there is already a way, just add new trigger
            if item.trigger_name
                @buffer[:triggers][item.table_name] |= [[item.trigger_name, item.action_timing, item.event_type]]
            else #trigger doesn't exists add table
                @buffer[:tables] |= [ [item.table_name, item.table_engine] ] if item.table_type == 'BASE TABLE'
            end
            # |=
            
            @buffer[:routines][:functions] |= [item.routine_name] if not item.routine_type.nil? and item.routine_type == 'FUNCTION'
            @buffer[:routines][:procedures] |= [item.routine_name] if not item.routine_type.nil? and item.routine_type == 'PROCEDURE'
            acc
        end
        # last database
        @result[:rows].push @buffer
        @result[:size] = Table.total_size.inject({}) do |acc, item|
            acc[item[:table_schema]] = item[:mb_size]; acc
        end
        
        render json: @result
    end
    
    # tries to create new database
    # if not success, set to result json
    # "message" - error-message
    #
    
    def create
        @result[:database_name] = request['db_name']
        ActiveRecord::Base.connection.create_database request['db_name'], charset: request['char_set']
            rescue Exception => e
                @result[:success] = false
                @result[:message] = e.message
            # always render
            ensure
                render json: @result
    end
    
    # drop database
    #
    def drop
        @connection = ActiveRecord::Base.connection
        
        @connection.transaction do
            begin
                Schemata.select('SCHEMA_NAME').each {|item| @connection.execute "drop database `#{item[:SCHEMA_NAME]}`"}
            rescue Exception => e
                @result[:success],@result[:message] = false, e.message
            end
            
            return render json: @result
        end if request['all']
        
        begin
            @connection.execute "drop database `#{request['db_name']}`"
        rescue Exception => e
            @result[:success],@result[:message] = false, e.message
        end
        
        render json: @result
    end
    
    # clear @buffer
    # @param db_name {string} default value for @buffer[:db_name]
    
    def clr_buff db_name
        @buffer = { tables:   [],
                    db_name:  db_name,
                    triggers: {},
                    routines: {
                        functions: [],
                        procedures: []
                    },
                    views:    [] }
    end
    
    def charlist
        @charsets = Charset.select('CHARACTER_SET_NAME name,
                                    DEFAULT_COLLATE_NAME collation,
                                    DESCRIPTION description,
                                    MAXLEN maxlen').all
        
        render json: {
            success: true,
            items:   @charsets
        }
    end
    
    def entry
        @result = SqlFile.save_to_mysql request[:databaseName], request[:fileName]
        render json: @result
    end
    
    def upload
        @saved = SqlFile.save request[:filename]
        return render text: @saved.to_json if not @saved[:success]
        
        @result = SqlFile.save_to_mysql request[:databaseName], @saved[:path]
        render text: @result.to_json
    end
    
end
