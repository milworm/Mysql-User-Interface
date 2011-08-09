class CreateKeyColumnUsages < ActiveRecord::Migration
  def self.up
    create_table :key_column_usages do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :key_column_usages
  end
end
