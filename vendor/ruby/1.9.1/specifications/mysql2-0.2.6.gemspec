# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{mysql2}
  s.version = "0.2.6"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Brian Lopez"]
  s.date = %q{2010-10-19}
  s.email = %q{seniorlopez@gmail.com}
  s.extensions = ["ext/mysql2/extconf.rb"]
  s.files = ["spec/em/em_spec.rb", "spec/mysql2/client_spec.rb", "spec/mysql2/error_spec.rb", "spec/mysql2/result_spec.rb", "spec/spec_helper.rb", "examples/eventmachine.rb", "examples/threaded.rb", "ext/mysql2/extconf.rb"]
  s.homepage = %q{http://github.com/brianmario/mysql2}
  s.require_paths = ["lib", "ext"]
  s.rubygems_version = %q{1.6.2}
  s.summary = %q{A simple, fast Mysql library for Ruby, binding to libmysql}
  s.test_files = ["spec/em/em_spec.rb", "spec/mysql2/client_spec.rb", "spec/mysql2/error_spec.rb", "spec/mysql2/result_spec.rb", "spec/spec_helper.rb", "examples/eventmachine.rb", "examples/threaded.rb"]

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
