sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/Device",
	'jquery.sap.global',
	"iotpush/constants/URLContants"
], function(JSONModel, ODATAModel, Device, jQuery, URLContants) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createModelForIoT: function(){
			var oModel = new JSONModel({});
			return oModel;
		},
		
		getIoTPush: function(){
			var sUrl = URLContants.GET_IOT_PUSH;
			return this.doCall({url: sUrl});
		},
		
		doCall: function(oProperties){
			return jQuery.get({
				url: oProperties.url
			});
		}

	};
});