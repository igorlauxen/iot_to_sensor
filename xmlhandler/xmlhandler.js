sap.ui.define([], function(){

	function parse(node, j){
		var nodeName = node.nodeName.replace(/^.+:/, '').toLowerCase();
		var cur = null;
		var text = $(node).contents().filter(function(x) {
			return this.nodeType === 3;
		});
	    if (text[0] && text[0].nodeValue.trim()) {
	    	cur = text[0].nodeValue;
	    } else {
	    	cur = {};
	    	$.each(node.attributes, function() {
	        	if (this.name.indexOf('xmlns:') !== 0) {
	        		cur[this.name.replace(/^.+:/, '')] = this.value;
	        	}
	    	});
	    	$.each(node.children, function() {
	        	parse(this, cur);
	    	});
	    }
	    //entries are going to repeat themselves since each entry is a different data
	    //since we need to display them all we need to create an array to group them!
	    if (nodeName === "entry"){
	    	if (!j["entries"]){
	    		j["entries"] = [];
	    	}
	    	j["entries"].push(cur);
	    } else {
	    	j[nodeName] = cur;		
	    }
	}

	return {
		
		convertXmlToJson: function(xml){
			var roots = $(xml);
			var root = roots[roots.length-1];
			var json = {};
			//ignore #content and start from feed
			parse(root.children[0], json);
			return json;
		}
	};

});