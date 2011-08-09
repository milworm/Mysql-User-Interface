class TriggerController < ApplicationController
    def content
        
    end
    #list of triggers for spec db or table
    def index
        conditions = ''; @records = {}
        conditions += ('EVENT_OBJECT_TABLE="'+request[:table_name]+'"') unless request[:table_name].nil?
        conditions += ('TRIGGER_SCHEMA="'+request[:database_name]+'"') unless request[:database_name].nil?
        @triggers = Trigger.where(conditions).select(%[
            TRIGGER_NAME trigger_name,
            EVENT_OBJECT_TABLE table_name,
            EVENT_MANIPULATION event_type,
            ACTION_TIMING action_timing
        ]).all
        
        if @triggers.size > 0
            current_table_name = @triggers[0][:table_name]
            @buffer = []; count = 0
            @triggers = @triggers.inject({}) do |a, item|
                if current_table_name != item[:table_name]
                    a[current_table_name] =  @buffer
                    @buffer = []; current_table_name = item[:table_name]
                end
                @buffer.push [item.trigger_name, item.action_timing, item.event_type]
                count+=1
                a[current_table_name] = @buffer if count == @triggers.size
                a
            end
        end
        
        render :json => {
            :success => true,
            :rows => [{
                :triggers => @triggers
            }],
            :single_request => true,
            :single_type => :triggerRoot
        }
    end
    
    def get_trigger_header trigger
        db_name = trigger['TRIGGER_SCHEMA']
        name = trigger['TRIGGER_NAME']
        event = trigger['EVENT_MANIPULATION']
        time = trigger['ACTION_TIMING']
        table = trigger['EVENT_OBJECT_TABLE']
        
        "DROP TRIGGER IF EXISTS `#{db_name}`.`#{name}`\nCREATE TRIGGER `#{db_name}`.`#{name}` #{time} #{event} ON `#{table}`\nFOR EACH ROW "
    end
    
    def content
        @database_name, @trigger_name = request[:database_name], request[:trigger_name]
        trigger = Trigger.where(TRIGGER_NAME: @trigger_name, TRIGGER_SCHEMA: @database_name).first.attributes
        trigger_header = get_trigger_header trigger
        @result[:rows] = [{
            ACTION_STATEMENT: trigger_header + trigger['ACTION_STATEMENT']
        }]
        
        render json: @result
    end
  
    def structure
        @result = {success: true, desc: []}
        @database_name = request['database_name']
        @trigger_name = request['name']
        
        desc = Trigger.where(TRIGGER_NAME: @trigger_name, TRIGGER_SCHEMA: @database_name).first.attributes
        desc.keys.length.times do |i|
            key = desc.keys[i]
            next if key.downcase == 'action_statement'
            @result[:desc].push COLUMN_NAME: key, COLUMN_TYPE: desc[key]
        end
        
        @result[:type] = 'trigger'
        @result[:name] = @trigger_name
        render json: @result
    end
    
    def drop
        @database_name, remove_all, trigger_name = request['db_name'], request['remove_all'], request['trigger_name']
        
        Trigger.select('TRIGGER_NAME `name`').where(TRIGGER_SCHEMA: @database_name).each do |trigger|
            ActiveRecord::Base.connection.execute "drop trigger `#{@database_name}`.`#{trigger["name"]}`"
        end unless remove_all.nil?
        
        ActiveRecord::Base.connection.execute "drop trigger `#{@database_name}`.`#{trigger_name}`" unless trigger_name.nil?
        render json: @result
    end
    
    def modify
    end
    
    def create
        @source_code = request['source_code']
        drop_statement = @source_code.split("\n").first
        ActiveRecord::Base.transaction do
            begin
                ActiveRecord::Base.connection.execute drop_statement
                ActiveRecord::Base.connection.execute @source_code[drop_statement.length..-1]
            rescue Exception => e
                @result[:success], @result[:msg] = false, e.message
            ensure
                render json: @result
            end
        end
    end
end
