require 'test_helper'

class ViewControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get content" do
    get :content
    assert_response :success
  end

  test "should get drop" do
    get :drop
    assert_response :success
  end

  test "should get create" do
    get :create
    assert_response :success
  end

end
