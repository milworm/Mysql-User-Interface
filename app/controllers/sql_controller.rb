class SqlController < ApplicationController
  def execute
      return if request[:query].nil?
      
      query = request[:query]
      @connection = ActiveRecord::Base.connection
      @connection.execute "use `#{request[:database_name]}`"
          
      begin
        unless (query.gsub(/\n/,' ') =~ /^(select|show|describe|help|call)/i).nil?
          @result[:rows] = @connection.select_all query
          @result[:fields] = @result[:rows].first.keys unless @result[:rows].first.nil?
        else
          @connection.execute query
          @result[:rows] = []
        end
      rescue Exception => e 
        @result[:success] = false
        @result[:msg] = e.message
      end
          
      @connection.execute 'use `information_schema`'
      render json: @result
  end
end
