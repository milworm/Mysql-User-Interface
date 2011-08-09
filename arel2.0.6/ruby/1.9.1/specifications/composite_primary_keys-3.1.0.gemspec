# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{composite_primary_keys}
  s.version = "3.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Dr Nic Williams", "Charlie Savage"]
  s.date = %q{2010-12-17}
  s.description = %q{Composite key support for ActiveRecord 3}
  s.email = ["drnicwilliams@gmail.com"]
  s.files = ["test/abstract_unit.rb", "test/debug.log", "test/hash_tricks.rb", "test/README_tests.txt", "test/test_associations.rb", "test/test_attributes.rb", "test/test_attribute_methods.rb", "test/test_clone.rb", "test/test_composite_arrays.rb", "test/test_create.rb", "test/test_delete.rb", "test/test_equal.rb", "test/test_exists.rb", "test/test_find.rb", "test/test_ids.rb", "test/test_miscellaneous.rb", "test/test_pagination.rb", "test/test_polymorphic.rb", "test/test_santiago.rb", "test/test_suite.rb", "test/test_tutorial_example.rb", "test/test_update.rb", "test/test_validations.rb"]
  s.homepage = %q{http://github.com/cfis/composite_primary_keys}
  s.require_paths = ["lib"]
  s.required_ruby_version = Gem::Requirement.new(">= 1.8.7")
  s.rubyforge_project = %q{compositekeys}
  s.rubygems_version = %q{1.6.1}
  s.summary = %q{Composite key support for ActiveRecord}
  s.test_files = ["test/abstract_unit.rb", "test/debug.log", "test/hash_tricks.rb", "test/README_tests.txt", "test/test_associations.rb", "test/test_attributes.rb", "test/test_attribute_methods.rb", "test/test_clone.rb", "test/test_composite_arrays.rb", "test/test_create.rb", "test/test_delete.rb", "test/test_equal.rb", "test/test_exists.rb", "test/test_find.rb", "test/test_ids.rb", "test/test_miscellaneous.rb", "test/test_pagination.rb", "test/test_polymorphic.rb", "test/test_santiago.rb", "test/test_suite.rb", "test/test_tutorial_example.rb", "test/test_update.rb", "test/test_validations.rb"]

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<activerecord>, [">= 3.0.3"])
      s.add_development_dependency(%q<rspec>, [">= 0"])
    else
      s.add_dependency(%q<activerecord>, [">= 3.0.3"])
      s.add_dependency(%q<rspec>, [">= 0"])
    end
  else
    s.add_dependency(%q<activerecord>, [">= 3.0.3"])
    s.add_dependency(%q<rspec>, [">= 0"])
  end
end
