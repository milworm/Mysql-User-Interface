class Trigger < ActiveRecord::Base
    set_table_name :TRIGGERS
    set_primary_keys :TRIGGER_SCHEMA, :EVENT_OBJECT_TABLE, :TRIGGER_NAME
    #set_primary_key :EVENT_OBJECT_TABLE
    #belongs_to :table, :foreign_key => [:TABLE_SCHEMA, :TABLE_NAME]
    #belongs_to :table, :foreign_key => :TABLE_NAME
end
