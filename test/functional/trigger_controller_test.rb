require 'test_helper'

class TriggerControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get drop" do
    get :drop
    assert_response :success
  end

  test "should get content" do
    get :content
    assert_response :success
  end

  test "should get modify" do
    get :modify
    assert_response :success
  end

end
