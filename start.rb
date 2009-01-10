
#
# just a tiny Ruby Rack application for serving the stuff in public/
#
# start with
#
#   ruby start.rb
#
# (don't forget to
#
#   sudo gem install rack mongrel
#
# if necessary)
#

require 'rubygems'
require 'rack'

class App
  def initialize
    @rfapp = Rack::File.new('public')
  end
  def call (env)
    env['PATH_INFO'] = '/index.html' if env['PATH_INFO'] == '/'
    @rfapp.call(env)
  end
end

b = Rack::Builder.new do

  use Rack::CommonLogger
  use Rack::ShowExceptions
  run App.new
end

port = 4567

puts ".. [#{Time.now}] listening on port #{port}"

Rack::Handler::Mongrel.run(b, :Port => port) do |server|
  trap(:INT) do
    puts ".. [#{Time.now}] stopped."
    server.stop
  end
end

