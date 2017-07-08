var requireContext = require.context("../projects/618Pay", true, /.(css|html|js|scss)$/i);
requireContext.keys().forEach(function(key){requireContext(key);});