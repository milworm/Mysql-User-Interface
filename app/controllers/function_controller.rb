class FunctionController < ApplicationController
  def index
  end

  def drop
  end

  def create
    @routine_code = request[:source_code]
    drop_statement = @routine_code.split("\n").first
    
    ActiveRecord::Base.transaction do
      begin
        ActiveRecord::Base.connection.execute drop_statement
        ActiveRecord::Base.connection.execute @routine_code[drop_statement.length..-1]
        rescue Exception => e
          @result[:success], @result[:msg] = false, e.message
        ensure
          render json: @result
      end
    end
  end

  def get_deterministic
    ActiveRecord::Base.connection.select_all("select IS_DETERMINISTIC from `information_schema`.`routines`
    where `ROUTINE_SCHEMA`='#{@db_name}' and `ROUTINE_NAME`='#{@function_name}' and `ROUTINE_TYPE`='FUNCTION'").first['IS_DETERMINISTIC'].nil? ? '' : 'DETERMINISTIC'
  end

  def content
    @db_name, @function_name = request[:database_name], request[:function_name]
    deterministic = get_deterministic
    @function = ActiveRecord::Base.connection.select_all("SELECT * FROM `mysql`.`proc`
                                                          where `db`='#{@db_name}' and `name` = '#{@function_name}' and `type`='FUNCTION'").first
    @source_code= "DROP FUNCTION IF EXISTS `#{@function['db']}`.`#{@function['name']}`\n"+
                  "CREATE FUNCTION `#{@function['db']}`.`#{@function['name']}`(#{@function['param_list']})\n"+
                  "RETURNS #{@function['returns']} #{deterministic}\n"+
                  "#{@function['body']}\n"
    @result[:rows] = [{ROUTINE_DEFINITION: @source_code}]
    render json: @result
  end
  
  def structure
    change_schema_to 'information_schema'
    @result = {success: true, desc: []}
    @database_name = request[:database_name]
    @function_name = request[:name]
    
    desc = Routine.where(ROUTINE_NAME: @function_name, ROUTINE_TYPE: 'FUNCTION', ROUTINE_SCHEMA: @database_name).first.attributes
    
    desc.keys.length.times do |i|
      key = desc.keys[i]
      next if key.downcase == 'routine_definition'
      @result[:desc].push COLUMN_NAME: key, COLUMN_TYPE: desc[key]
    end
    
    @result[:type] = 'function'
    @result[:name] = request[:name]
    
    render json: @result
  end

end
