class CreateSchematas < ActiveRecord::Migration
  def self.up
    create_table :schematas do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :schematas
  end
end
