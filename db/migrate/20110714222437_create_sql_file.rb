class CreateSqlFile < ActiveRecord::Migration
  def self.up
    create_table :sql_file do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :sql_file
  end
end
