class ProcedureController < ApplicationController
  def index
  end
  
  def content
    change_schema_to 'information_schema'
    @db_name, @procedure_name = request[:database_name], request[:procedure_name]
    @procedure = ActiveRecord::Base.connection.select_all("SELECT * FROM `mysql`.`proc`
                                                          where `db`='#{@db_name}' and `name` = '#{@procedure_name}' and `type`='PROCEDURE'").first
    @source_code= "DROP PROCEDURE IF EXISTS `#{@procedure['db']}`.`#{@procedure['name']}`\n"+
                  "CREATE PROCEDURE `#{@procedure['db']}`.`#{@procedure['name']}`(#{@procedure['param_list']})\n"+
                  "#{@procedure['body']}\n"
    @result[:rows] = [{ROUTINE_DEFINITION: @source_code}]
    render json: @result
  end
  
  def structure
    change_schema_to 'information_schema'
    @result = {success: true, desc: []}
    @database_name = request[:database_name]
    @procedure_name = request[:name]
    
    desc = Routine.where(ROUTINE_NAME: @procedure_name, ROUTINE_TYPE: 'PROCEDURE', ROUTINE_SCHEMA: @database_name).first.attributes
    
    desc.keys.length.times do |i|
      key = desc.keys[i]
      next if key.downcase == 'routine_definition'
      @result[:desc].push COLUMN_NAME: key, COLUMN_TYPE: desc[key]
    end
    
    @result[:type] = 'procedure'
    @result[:name] = request[:name]
    
    render json: @result
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

  def modify
  end

end
