class Trigger < ActiveRecord::Base
    self.table_name = :TRIGGERS
    self.primary_keys = :TRIGGER_SCHEMA, :EVENT_OBJECT_TABLE, :TRIGGER_NAME
end
