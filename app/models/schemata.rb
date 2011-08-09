class Schemata < ActiveRecord::Base
    set_table_name :SCHEMATA
    set_primary_key :SCHEMA_NAME
    #
    #def self.routine_list
    #    joins('left join ROUTINES on SCHEMATA.SCHEMA_NAME = ROUTINES.ROUTINE_SCHEMA')
    #end
    #
    #def self.table_list
    #    joins('left join TABLES on SCHEMATA.SCHEMA_NAME = TABLES.TABLE_SCHEMA')
    #end
    #
    #def self.trigger_list
    #    joins('LEFT JOIN TRIGGERS ON TABLES.TABLE_NAME = TRIGGERS.EVENT_OBJECT_TABLE AND TRIGGERS.TRIGGER_SCHEMA = TABLES.TABLE_SCHEMA')
    #end
    
    scope :routines, lambda {joins('left join ROUTINES on SCHEMATA.SCHEMA_NAME = ROUTINES.ROUTINE_SCHEMA')}
    scope :tables,   lambda {joins('left join TABLES on SCHEMATA.SCHEMA_NAME = TABLES.TABLE_SCHEMA')}
    scope :triggers, lambda {joins('LEFT JOIN TRIGGERS ON TABLES.TABLE_NAME = TRIGGERS.EVENT_OBJECT_TABLE AND TRIGGERS.TRIGGER_SCHEMA = TABLES.TABLE_SCHEMA')}
end
