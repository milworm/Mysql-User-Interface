require 'test_helper'

class TableControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get create" do
    get :create
    assert_response :success
  end

  test "should get drop" do
    get :drop
    assert_response :success
  end

  test "should get modify" do
    get :modify
    assert_response :success
  end

  test "should get update" do
    get :update
    assert_response :success
  end

end
