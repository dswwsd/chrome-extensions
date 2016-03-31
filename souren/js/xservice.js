(function($) {
	$.extend({XService: {
		getPerson: function(empid, doneFunc, failFunc) {
			$.ajax({
				url: "https://work.alibaba-inc.com/work/xservice/getPersonPage.jsonp",
				dataType: "jsonp",
				data: {"emplId": empid, "_csrf_token": localStorage.csrfToken}
			}).done(function(data){
				if(doneFunc)
				{
					if(data.content && data.content.person)
						doneFunc(data.content.person);
					else
						doneFunc(null);
				}
			}).fail(function(jqXHR) {
				if(failFunc)
					failFunc(jqXHR);
			})
		},
		teamView: function(empid, doneFunc, failFunc) {
			$.ajax({
				url: "https://work.alibaba-inc.com/work/xservice/teamView.jsonp",
				dataType: "jsonp",
				data: {"emplId": empid, "_csrf_token": localStorage.csrfToken}
			}).done(function(data){
				console.log(data)
				if(doneFunc)
				{
					var results = data.content.items.all_results["person.mydata"].results;
					results = results.concat(data.content.items.all_results["person.d"].results)
					doneFunc({"totalNumbers":results.length, "results":results});
				}
			}).fail(function(jqXHR) {
				if(failFunc)
					failFunc(jqXHR);
			})
		},
		search: function(condition, doneFunc, failFunc) {
			$.ajax({
				url: "https://work.alibaba-inc.com/work/xservice/suggestionSearch.jsonp",
				dataType: "jsonp",
				data: {"condition":condition, "itemNumbers":20, "_csrf_token": localStorage.csrfToken}
			}).done(function(data){
				if(doneFunc && data.content)
					doneFunc(data.content.items.all_results.person);
				else if(failFunc)
					failFunc(data);
			}).fail(function(jqXHR) {
				if(failFunc)
					failFunc(jqXHR);
			})			
		},
		makePhoneCall: function(number, ismobile, doneFunc, failFunc) {
			if(localStorage.csrfToken)
			{
				$.ajax({
					url: "https://work.alibaba-inc.com/work/xservice/makePhoneCall.jsonp",
					dataType: "jsonp",
					data: {"number":number, "isMobileNumber":ismobile, "_csrf_token": localStorage.csrfToken}
				}).done(function(data){
					if(doneFunc)
						doneFunc(data);
				}).fail(function(jqXHR) {
					if(failFunc)
						failFunc(jqXHR);
				})			
			}
			else
				return false;
		},
		stopPhoneCall: function(uuid, doneFunc, failFunc) {
			if(localStorage.csrfToken && localStorage.phoneUUID)
			{
				$.ajax({
					url: "https://work.alibaba-inc.com/work/xservice/stopPhoneCall.jsonp",
					dataType: "jsonp",
					data: {"uuid":localStorage.phoneUUID, "_csrf_token": localStorage.csrfToken}
				}).done(function(data){
					if(doneFunc)
						doneFunc(data);
				}).fail(function(jqXHR) {
					if(failFunc)
						failFunc(jqXHR);
				})
				localStorage.removeItem("phoneUUID");
			}
			else
				return false;
		},
		getMoreInfo: function(empid, doneFunc, failFunc) {
			$.ajax({
				url: "https://u-console.alibaba-inc.com/rpc/enhancedUserQuery/getUserByEmpId.jsonp",
				dataType: "jsonp",
				data: {"empId": empid}
			}).done(function(data){
				if(doneFunc)
				{
					if(data.content)
						doneFunc(data.content);
					else
						doneFunc(null);
				}
			}).fail(function(jqXHR) {
				if(failFunc)
					failFunc(jqXHR);
			})
		}	
		
	}});
})(jQuery);    
