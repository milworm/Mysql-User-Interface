# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
RorAdminSite::Application.initialize!
#disable name of model as root
ActiveRecord::Base.include_root_in_json = false
