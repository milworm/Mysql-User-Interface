class Column < ActiveRecord::Base
    self.table_name = :COLUMNS
    self.primary_keys = :TABLE_SCHEMA, :TABLE_NAME, :COLUMN_NAME  
end
