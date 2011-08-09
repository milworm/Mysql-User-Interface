class SqlFile < ActiveRecord::Base
    def self.save file_name
        name =  file_name.original_filename
        path = File.join("public/data", name)
        res = File.open(path, "wb") { |f| f.write(file_name.read) }
        
        {
            path: path,
            success: res > 0 ? true : false
        }
    end
    
    def self.save_to_mysql database, file
        @rails_config = Rails.configuration.database_configuration[Rails.env]
        @save_result = {success: true}
        database = database =~ /^false$/ ? '' : database
        %x( mysql -u#{@rails_config['username']} -p#{@rails_config['password']} #{database} < #{file} )
        
        if $?.exitstatus == 1
            @save_result[:success] = false
            @save_result[:msg] = 'Error occured while importing sql-statements'
        end
        p @save_result
        @save_result
    end
end
