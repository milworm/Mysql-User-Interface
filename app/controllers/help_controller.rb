class HelpController < ApplicationController
    def index
       sql = "select distinct c.name, c.help_category_id
              from mysql.help_topic t
              inner join mysql.help_category c on t.help_category_id = c.help_category_id
              order by c.name"
       @result[:rows] = ActiveRecord::Base.connection.select_all sql #get all category names
       render json: @result
    end
    
    # performs searching
    # title of func, proc etc by typeed value
    #
    
    def search
        fields, where = '`name`, `description`, `example`',"'#{request[:query]}%'"
        
        if request['selected'] == true.to_s
            fields, where = '`description`, `example`', "'#{request[:query]}'"
        end
        
        sql = "select #{fields}
               from mysql.help_topic
               where name like #{where}"
        @result[:rows] = ActiveRecord::Base.connection.select_all sql
        render json: @result
    end
    
    # find all functions and procedures
    # for requested category
    
    def content
        sql = "select name, description,`example`
               from mysql.help_topic
               where `help_category_id`=#{request[:category_id]}"
        @result[:rows] = ActiveRecord::Base.connection.select_all sql
        render json: @result
    end
end
