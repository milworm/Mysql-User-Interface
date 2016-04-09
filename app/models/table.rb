class Table < ActiveRecord::Base
    self.table_name = :TABLES
    #set_primary_keys :TABLE_SCHEMA,:TABLE_NAME #start composite_primary_keys
    self.primary_keys = :TABLE_SCHEMA, :TABLE_NAME
    has_many :triggers, :foreign_key => [:TRIGGER_SCHEMA, :EVENT_OBJECT_TABLE]
    #scopes
    scope :total_size, lambda {
        select('table_schema, round(sum(data_length+index_length)/1024/1024, 2) mb_size').group('table_schema')
    }
end
