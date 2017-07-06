var requireContext = require.context("/Users/chenqingwei/Desktop/jd-tiny/projects/test", true, /.(css|html|js|scss)$/i);
requireContext.keys().forEach(function(key){requireContext(key);});