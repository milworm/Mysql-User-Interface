class CreateColumns < ActiveRecord::Migration
  def self.up
    create_table :columns do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :columns
  end
end
