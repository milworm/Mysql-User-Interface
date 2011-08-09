class CreateCharset < ActiveRecord::Migration
  def self.up
    create_table :charset do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :charset
  end
end
