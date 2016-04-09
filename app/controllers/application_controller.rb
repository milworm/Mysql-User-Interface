class ApplicationController < ActionController::Base
    #protect_from_forgery
    
    # set the default value for @result
    #
    
    def initialize
        super
        @js_files = Dir["public/javascripts/modules/**/*.js"].sort.inject [] {|a,i| a.push i.split('/javascripts/')[1]}
        @result = {success: true}
    end
    
    # change application schema to param schema_name
    #
    
    def change_schema_to schema_name
        ActiveRecord::Base.connection.execute "use `#{schema_name}`"
    end
    
end