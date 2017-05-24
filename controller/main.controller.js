sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment',
	'jquery.sap.global',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	'sap/ui/model/json/JSONModel',
	'iotpush/model/models',
	'iotpush/xmlhandler/xmlhandler'
], function(Controller, Fragment, jQuery,  Filter, Sorter, JSONModel, Models, XmlHandler) {
	"use strict";
	
	//Example taken from Responsive Table --> View Settings 
	//Maybe change for Column example
	
	return Controller.extend("iotpush.controller.main", {
		
		_oDialog: null,
		_aData: [],
		_oModelData: null,
		
		_getData: function(){
			return this._aData;
		},
		
		_addData: function(oValue){
			this._aData.push(oValue);
		},
		
		_cleanData: function(){
			this._aData = [];
		},
 
		onInit: function () {
			this._oModelData = Models.createModelForIoT();
			this.getView().setModel(this._oModelData, 'iot');
		},
		
		onAfterRendering: function(){
			this._setTimerToFetchData();
		},
		
		_setTimerToFetchData: function(){
			window.setInterval(function(){
				this._loadMessageData();
			}.bind(this), 1000);
		},
		
		_loadMessageData: function(){
			var oPromise = Models.getIoTPush();
			oPromise.done(function(xmlResponse){
				var oResponse = XmlHandler.convertXmlToJson(xmlResponse);
				this._getRelevantInfoFromResponse(oResponse);
				//explicitly update bindings
				this._oModelData.updateBindings();
			}.bind(this));
			oPromise.fail(function(oError){
				jQuery.sap.log.error("Failed: /n", oError);
			});
		},
		
		_getRelevantInfoFromResponse: function(oJsonObject){
			this._cleanData();
			try {
				var aEntries = oJsonObject.feed.entries;
				aEntries.forEach(function(oEntry){
					var oProperties = oEntry.content.properties,
						oMessageString = oProperties.c_messages,
						oMessage = JSON.parse(oMessageString),
						oResponse = oMessage.messages[0];
						oResponse.date = oProperties.g_created;
						this._addData(oResponse);
				}.bind(this));
				this._oModelData.setData({ entries: this._getData() });
			} catch (e){
				jQuery.sap.log.error("Something happened in the getRelevantInfoFromResponse: /n" + e);
				return [];
			}
		},
		
		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("iotpush.fragments.Dialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		
		handleConfirm: function(oEvent) {
 
			var oView = this.getView();
			var oTable = oView.byId("idIoTTable");
 
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
 
			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
 
			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPaths = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPaths, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);
 
			// update filter bar
			oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			oView.byId("vsdFilterLabel").setText(mParams.filterString);
		}

	});
});