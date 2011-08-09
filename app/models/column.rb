class Column < ActiveRecord::Base
    set_table_name :COLUMNS
    
    set_primary_keys :TABLE_SCHEMA, :TABLE_NAME, :COLUMN_NAME
    
end
