
#
# just a tiny Sinatra application for serving the stuff in public/
#
# start with
#
#   ruby start.rb
#

require 'rubygems'
require 'sinatra'

use Rack::CommonLogger
use Rack::ShowExceptions

set :public, File.expand_path(File.join(File.dirname(__FILE__), 'public'))
#set :views, File.expand_path(File.join(File.dirname(__FILE__), 'views'))

get '/' do

  redirect '/index.html'
end

