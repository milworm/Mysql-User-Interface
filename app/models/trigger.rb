class Trigger < ActiveRecord::Base
    set_table_name :TRIGGERS
    set_primary_keys :TRIGGER_SCHEMA, :EVENT_OBJECT_TABLE, :TRIGGER_NAME
end
