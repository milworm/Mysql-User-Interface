class AutocompleteController < ApplicationController
    # get mysql-keywords
    # for client-side autocomplete
    #
    def index
        @result[:rows] = ActiveRecord::Base.connection.select_all 'select UPPER(name) name, 0 weight from mysql.help_keyword'
        render json: @result
    end
    
    # requests table and column names
    # for specified database
    #
    def full_structure
        @db_name = request[:database_name]
        @result[:rows] = Column.where(TABLE_SCHEMA: @db_name).
                         select('CONCAT("`",TABLE_NAME,"`",".","`",COLUMN_NAME,"`") name, 3 `weight`')
                         
        @result[:rows] += Table.select('concat("`",TABLE_NAME,"`") name, 4 weight').where(TABLE_SCHEMA: @db_name)
        @result[:rows] += ActiveRecord::Base.connection.select_all 'select UPPER(`name`) `name`, 0 `weight`, 0 `help_category_id`
                                                                    from `mysql`.`help_keyword`
                                                                    union
                                                                    select `name`, 0 `weight`, `help_category_id`
                                                                    from `mysql`.`help_topic`
                                                                    where locate(" ", `name`) = 0'
        #@result[:rows].push name: "`#{@db_name}`", weight: 0
        render json: @result
    end
end
