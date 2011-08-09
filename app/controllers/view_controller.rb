class ViewController < ApplicationController
    
    def index
        self.init
        @result[:rows] = [{:views => Table.where(%[TABLE_SCHEMA='#{@database_name}' and TABLE_TYPE like "%VIEW%"]).
                                     select(%[TABLE_NAME view_name]).
                                     inject([]) { |a,item| a.push [item[:view_name]] }
        }]
        
        @result[:single_request] = true
        @result[:single_type] = :viewRoot
        render json: @result
    end
    
    def content
        self.init
        self.change_schema_to @database_name
        @result[:count] = ActiveRecord::Base.connection.select_one("SELECT count(*) c FROM `#{@view_name}` #{@filter}")['c']
        #set profiling
        ActiveRecord::Base.connection.execute 'set profiling = 1';
        sql = "select * from `#{@view_name}` #{@filter} #{@order} limit #{request['start']},#{request['limit']}"
        @result[:rows] = ActiveRecord::Base.connection.select_all sql
        self.change_schema_to 'information_schema'
        
        @result[:executed_time] = ActiveRecord::Base.connection.select_one('show profiles')['Duration'];
        ActiveRecord::Base.connection.execute 'set profiling = 0';
        render json: @result
    end
    def structure
        @database_name = request[:database_name]
        @view_name = request[:name]
        @result = {success: true}
        @result[:columns] = Column.where TABLE_SCHEMA: @database_name, TABLE_NAME: @view_name
        @result[:desc] = Table.where(TABLE_SCHEMA: @database_name, TABLE_NAME: @view_name).inject [] do |a, i|
            a.push COLUMN_NAME: 'ENGINE', COLUMN_TYPE: i[:ENGINE]
            a.push COLUMN_NAME: 'ROW_FORMAT', COLUMN_TYPE: i[:ROW_FORMAT]
            a.push COLUMN_NAME: 'TABLE_ROWS', COLUMN_TYPE: i[:TABLE_ROWS]
            a.push COLUMN_NAME: 'AVG_ROW_LENGTH', COLUMN_TYPE: i[:AVG_ROW_LENGTH]
            a.push COLUMN_NAME: 'DATA_LENGTH', COLUMN_TYPE: i[:DATA_LENGTH]
            a.push COLUMN_NAME: 'MAX_DATA_LENGTH', COLUMN_TYPE: i[:MAX_DATA_LENGTH]
            a.push COLUMN_NAME: 'INDEX_LENGTH',COLUMN_TYPE: i[:INDEX_LENGTH]
            a.push COLUMN_NAME: 'DATA_FREE',COLUMN_TYPE: i[:DATA_FREE]
            a.push COLUMN_NAME: 'AUTO_INCREMENT',COLUMN_TYPE: i[:AUTO_INCREMENT]
            a.push COLUMN_NAME: 'CREATE_TIME',COLUMN_TYPE: i[:CREATE_TIME]
            a.push COLUMN_NAME: 'UPDATE_TIME',COLUMN_TYPE: i[:UPDATE_TIME]
            a.push COLUMN_NAME: 'TABLE_COLLATION',COLUMN_TYPE: i[:TABLE_COLLATION]
            a.push COLUMN_NAME: 'CREATE_OPTIONS',COLUMN_TYPE: i[:CREATE_OPTIONS]
            a.push COLUMN_NAME: 'TABLE_COMMENT',COLUMN_TYPE: i[:TABLE_COMMENT]
        end
        
        ActiveRecord::Base.connection.execute %[use information_schema]
        @result[:type] = 'view'
        @result[:name] = @view_name
        @result[:database_name] = @database_name
        
        render json: @result
    end
    #drop view
    def drop
    end
    #create new view
    def create
    end
    #set database_name and view_name
    #initialize result
    def init
        @filter = ''
        @database_name = request[:database_name] unless request[:database_name].nil?
        @view_name = request[:view_name] unless request[:view_name].nil?
        @filter = ' where '+request[:filter] unless request[:filter] == '' || request[:filter].nil?
        @order = !(request['dir'].nil?) ? 'order by `'+request['sort']+'` '+request['dir'] : ''
        @result = {
            success: true,
            rows:    []
        }
    end
end
