class Variable < ActiveRecord::Base
    self.table_name = :SESSION_VARIABLES
    self.primary_key = :VARIABLE_NAME
end
