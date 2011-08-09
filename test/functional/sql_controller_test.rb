require 'test_helper'

class SqlControllerTest < ActionController::TestCase
  test "should get execute" do
    get :execute
    assert_response :success
  end

end
