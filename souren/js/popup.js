$(document).ready(function(){
	var setHistory = function(func, params) {
		// save back & forward list
		if(localStorage.backList)
			backList = JSON.parse(localStorage.backList)
		else
			backList = [];

		// save history show in the main page
		if(localStorage.historyList)
			historyList = JSON.parse(localStorage.historyList)
		else
			historyList = [];

		var curPos = parseInt(localStorage.curPos);
		backList.splice(curPos + 1);
		backList.push({"func": func, "params": params});
		if(func == "search")
		{
			$.each(historyList, function(index, value) {
				if(value == params)
					historyList.splice(index, 1);
			})
			historyList.push(params);
		}
		while(historyList.length > 10) 
			historyList.shift();
		localStorage.backList = JSON.stringify(backList)
		localStorage.historyList = JSON.stringify(historyList)

		localStorage.curPos = backList.length - 1;
		$(".history-action .back").addClass("disabled");
		$(".history-action .forward").addClass("disabled");
		if(localStorage.curPos > 0)
			$(".history-action .back").removeClass("disabled");
	}

	var getHistory = function() {
		if(localStorage.historyList)
			historyList = JSON.parse(localStorage.historyList)
		else
		{
			historyList = [];
		}

		$(".history-action .back").addClass("disabled");
		$(".history-action .forward").addClass("disabled");
		localStorage.removeItem("curPos");
		localStorage.removeItem("backList");

		historyList.reverse();
		$(".history-content").html("");
		$(".history-none").removeClass("hide");
		$.each(historyList, function(index, info) {
			$(".history-content").append("<li><a href='#'>" + info + "</a></li>")
			$(".history-none").addClass("hide");
		})
	}

	var changeTab = function(tab) {
		$(".loading-bar").addClass("hide");
		$(".history-list").addClass("hide");
		$(".result-list").addClass("hide");
		$(".no-result").addClass("hide");	
		$(".need-login").addClass("hide");	

		switch (tab)
		{
		case "history":
			$(".history-list").removeClass("hide");	
			getHistory();
			break;
		case "result":
			$(".result-list").removeClass("hide");	
			break;
		case "no-result":
			$(".no-result").removeClass("hide");	
			break;
		case "login":
			$(".need-login").removeClass("hide");	
			break;
		default:
			$(".loading-bar").removeClass("hide");	
			break;
		}
	}

	var makeWangwang = function(site, account) {
		if(site && account)
		{
			// $.ajax({
			// 	url: "https://amos.im.alisoft.com/mullidstatus.aw",
			// 	dataType: "jsonp",
			// 	data: {"charset":"utf-8", "uids": site + account}
			// }).done(function(data){
			// 	var icon = $("span[name=" + site + account + "]")
			// 	if(data["data"][0] == 1)
			// 		if(site == "cntaobao")
			// 			icon.addClass("tbww-online")
			// 		else
			// 			icon.addClass("aliww-online")
			// 	else
			// 		icon.addClass("ww-offline");
			// })
			var type = (site == 'cnalichn') ? '6' : '2';
			return '<a target="_blank" href="aliim:sendmsg?touid=' + site + account + '&siteid=' + site + '">'
				+ '<img class="ww-img" border="0" src="http://amos.alicdn.com/realonline.aw?v=2&uid=' + account + '&site=' + site + '&s=' + type + '&charset=utf-8" /> '
				+ '<span name="' + site + account + '"></span><span>' + account + '</span></a>';
		}
		return "";
	}

	var fillMoreInfo = function(item, empid) {
		$.XService.getMoreInfo(empid, function(data){
			item.find(".cellphone").html("<a href='#'>" + data.cellphone + "</a>")
				.data("number", data.cellphone).data("name", data.lastName)
			if(data.gender)
				item.find(".gender").text((data.gender == "M") ? "男" : "女")
		}, function(jqXHR) {
			console.error('get more info error with empid: ' + empid)
		});	
	}

	var getCellphone = function(cellPhoneTag, empid, name) {
		$.XService.getMoreInfo(empid, function(data){
			cellPhoneTag.html("<a href='#'>" + data.cellphone + "</a>")
				.data("number", data.cellphone).data("name", name);
		}, function(jqXHR){
			console.error('get cellphone error with empid: ' + empid)
		});		
	}


	// show history list after popup is opened.
	getHistory();

	//get _csrf_token from work.alibaba-inc.com
	$.support.cors = true;
	$.get("https://work.alibaba-inc.com/work/home", function(data) {
		localStorage.csrfToken = $("<div>" + data + "</div>").find("[name=_csrf_token]").val()
	})

        // fix bug: get phone number failed at first time
	$.get("https://u-console.alibaba-inc.com/rpc/enhancedUserQuery/getUserByEmpId.jsonp")

	$(".search-input").on("search", function(event, isBack) {
		if(!$(this).val())
		{
			changeTab("history");
			return true;
		}

		changeTab("loading");
		if(!isBack)
			setHistory("search", $(this).val());

		$.XService.search($(this).val(), function(data){
			$(".result-list").html("");
			if(data.totalNumbers > 0)
			{
				$.each(data.results, function(index, info) {
					var item = $(".result-item-template .result-item-wrap").clone(true);
					var avatarImg = item.find(".avatar img").attr("src", "http://work.alibaba-inc.com/photo/" + info.emplId + ".40x40.jpg");
					item.find(".realname").text(info.lastName);
					item.find(".nickname").text(info.chineseNickname);
					if(!info.chineseNickname)
						item.find(".nickname").addClass("hide");
					item.find(".empid").html("<a href='http://work.alibaba-inc.com/work/u/" + info.emplId + "' target='_blank'>" + info.emplId + "</a>");
					if(info.gender)
						item.find(".gender").text((info.gender == "M") ? "男" : "女");
					item.find(".job-desc").text(info.jobDesc);
					item.find(".department").html("<a href='#'>" + info.deptDesc + "</a>").data("empid", info.emplId);
					item.find(".birthday").text(info.birthday);
					item.find(".hiredate").text(info.lastEmpDate);
					item.find(".hrg").html("<a href='#'>" + info.hrg_name + "</a>").data("empid", info.hrg_id);
					item.find(".supervisorname").html("<a href='#'>" + info.supervisorName + "</a>").data("empid", info.supervisorEmpid);
					item.find(".busnphone").html("<a href='#'>" + info.phoneExtension + "</a>")
						.data("number", info.phoneExtension).data("name", info.lastName);
					if(info.phoneExtension)
						item.find(".quick-call").data("number", info.phoneExtension).data("name", info.lastName);
					else
						item.find(".quick-call").addClass("hide");
					item.find(".cellphone").html("<a href='#'>" + info.mobilePhone + "</a>")
						.data("number", info.mobilePhone).data("name", info.lastName);
					item.find(".aliww").html(makeWangwang('cnalichn', info.aliWangwang));
					item.find(".tbww").html(makeWangwang('cntaobao', info.taobaoWangwang));
					item.find(".email").html("<a href='mailto:" + info.email + "' target='_blank'>" + info.email + "</a>");
					if(data.totalNumbers == 1)
					{
						fillMoreInfo(item, info.emplId)
						item.find(".inner-item-layout").addClass("expanded");
					}
					$(".result-list").append(item);
				})
				changeTab("result");
			}
			else
				changeTab("no-result");
		}, function(jqXHR){
			changeTab("login");
		});
	})

	$(".department").on("click", function(event, isBack, empId) {
		changeTab("loading");
		var empid = $(this).data("empid");
		if(isBack)
			empid = empId;
		else
			setHistory("teamView", $(this).data("empid"));

		$.XService.teamView(empid, function(data){
			$(".result-list").html("");
			if(data.totalNumbers > 0)
			{
				$.each(data.results, function(index, info) {
					var item = $(".result-item-template .result-item-wrap").clone(true);
					var avatarImg = item.find(".avatar img").attr("src", "http://work.alibaba-inc.com/photo/" + info.emplId + ".40x40.jpg");
					item.find(".realname").text(info.lastName);
					item.find(".nickname").text(info.chineseNickname);
					if(!info.chineseNickname)
						item.find(".nickname").addClass("hide");
					item.find(".empid").html("<a href='http://work.alibaba-inc.com/work/u/" + info.emplId + "' target='_blank'>" + info.emplId + "</a>");
					if (info.gender)
						item.find(".gender").text((info.gender == "M") ? "男" : "女");
					item.find(".job-desc").text(info.jobDesc);
					item.find(".department").html("<a href='#'>" + info.deptDesc + "</a>").data("empid", info.emplId);
					item.find(".birthday").text(info.birthday);
					item.find(".hiredate").text(info.lastEmpDate);
					item.find(".hrg").html("<a href='#'>" + info.hrg_name + "</a>").data("empid", info.hrg_id);
					item.find(".supervisorname").html("<a href='#'>" + info.supervisorName + "</a>").data("empid", info.supervisorEmpid);
					item.find(".busnphone").html("<a href='#'>" + info.phoneExtension + "</a>")
						.data("number", info.phoneExtension).data("name", info.lastName);
					if(info.phoneExtension)
						item.find(".quick-call").data("number", info.phoneExtension).data("name", info.lastName);
					else
						item.find(".quick-call").addClass("hide");
					item.find(".cellphone").html("<a href='#'>" + info.mobilePhone + "</a>")
						.data("number", info.mobilePhone).data("name", info.lastName);
					item.find(".aliww").html(makeWangwang('cnalichn', info.aliWangwang));
					item.find(".tbww").html(makeWangwang('cntaobao', info.taobaoWangwang));
					item.find(".email").html("<a href='mailto:" + info.email + "' target='_blank'>" + info.email + "</a>");
					if(data.totalNumbers == 1)
					{
						fillMoreInfo(item, info.emplId)
						item.find(".inner-item-layout").addClass("expanded");
					}
					$(".result-list").append(item);
				})

				changeTab("result");
			}
			else
				changeTab("no-result");
		}, function(jqXHR){
			changeTab("login");
		});

		event.preventDefault();
		event.stopPropagation();
	})

	$(".hrg, .supervisorname").on("click", function(event, isBack, empId) {
		changeTab("loading");
		var empid = $(this).data("empid");
		if(isBack)
			empid = empId;
		else
			setHistory("getPerson", $(this).data("empid"));

		$.XService.getPerson(empid, function(data){
			$(".result-list").html("");
			var info = data;
			var item = $(".result-item-template .result-item-wrap").clone(true);
			var avatarImg = item.find(".avatar img").attr("src", "http://work.alibaba-inc.com/photo/" + info.emplId + ".40x40.jpg");
			item.find(".realname").text(info.lastName);
			item.find(".nickname").text(info.nickNameCn);
			if(!info.nickNameCn)
				item.find(".nickname").addClass("hide");
			item.find(".empid").html("<a href='http://work.alibaba-inc.com/work/u/" + info.emplId + "' target='_blank'>" + info.emplId + "</a>");
			if(info.gender)
				item.find(".gender").text((info.gender == "M") ? "男" : "女");
			item.find(".job-desc").text(info.jobDesc);
			item.find(".department").html("<a href='#'>" + info.deptDesc + "</a>").data("empid", info.emplId);
			item.find(".birthday").text(info.birthday);
			item.find(".hiredate").text(info.hireDate);
			item.find(".hrg").html("<a href='#'>" + info.hrgName + "</a>").data("empid", info.hrgId);
			item.find(".supervisorname").html("<a href='#'>" + info.supervisorName + "</a>").data("empid", info.supervisorEmplId);
			item.find(".busnphone").html("<a href='#'>" + info.extensionPhone + "</a>")
				.data("number", info.extensionPhone).data("name", info.lastName);
			if(info.extensionPhone)
				item.find(".quick-call").data("number", info.extensionPhone).data("name", info.lastName);
			else
				item.find(".quick-call").addClass("hide");
			item.find(".cellphone").html("<a href='#'>" + info.cellphone + "</a>")
				.data("number", info.cellphone).data("name", info.lastName);
			item.find(".aliww").html(makeWangwang('cnalichn', info.aliWW));
			item.find(".tbww").html(makeWangwang('cntaobao', info.tbWW));
			item.find(".email").html("<a href='mailto:" + info.emailAddr + "' target='_blank'>" + info.emailAddr + "</a>");
			item.find(".inner-item-layout").addClass("expanded");
			fillMoreInfo(item, info.emplId)
			$(".result-list").append(item);
			changeTab("result");
		}, function(jqXHR){
			changeTab("login");
		});
		event.preventDefault();
	})

	$(".main-variant-wrap").on("click", function(event) {
		var itemTag = $(this).parent()
		if (!itemTag.find(".cellphone").data("number"))
			fillMoreInfo(itemTag, itemTag.find(".empid a").text())
		itemTag.toggleClass("expanded")
	})

	$(".history-list .history-content").on("click", "li", function(event) {
		$(".search-input").val($(this).text()).trigger("search");
		event.stopPropagation();
	})

	$("#clean-history").on("click", function(event) {
		localStorage.removeItem("historyList");
		$(".history-content").html("");
		$(".history-none").removeClass("hide");
	})

	$(".history-action .back").on("click", function(event) {
		if(localStorage.backList && localStorage.curPos)
			backList = JSON.parse(localStorage.backList)
		else
		{
			$(".history-action .back").addClass("disabled");
			$(".history-action .forward").addClass("disabled");
			return false
		}
		var curPos = parseInt(localStorage.curPos);
		var curAction = backList[curPos - 1];
		if(curAction["func"] == "search")
			$(".search-input").val(curAction["params"]).trigger("search", true);
		else if(curAction["func"] == "teamView")
			$(".result-item-template .department").trigger("click", [true, curAction["params"]]);
		else if(curAction["func"] == "getPerson")
			$(".result-item-template .hrg").trigger("click", [true, curAction["params"]]);

		localStorage.curPos = curPos - 1;
		$(".history-action .back").removeClass("disabled");
		$(".history-action .forward").removeClass("disabled");
		if(localStorage.curPos <= 0)
			$(".history-action .back").addClass("disabled");
	})

	$(".history-action .forward").on("click", function(event) {
		if(localStorage.backList)
			backList = JSON.parse(localStorage.backList)
		else
		{
			$(".history-action .back").addClass("disabled");
			$(".history-action .forward").addClass("disabled");
			return false;
		}
		var curPos = parseInt(localStorage.curPos);
		var curAction = backList[curPos + 1];
		if(curAction["func"] == "search")
			$(".search-input").val(curAction["params"]).trigger("search", true);
		else if(curAction["func"] == "teamView")
			$(".result-item-template .department").trigger("click", [true, curAction["params"]]);
		else if(curAction["func"] == "getPerson")
			$(".result-item-template .hrg").trigger("click", [true, curAction["params"]]);

		localStorage.curPos = curPos + 1;
		$(".history-action .back").removeClass("disabled");
		$(".history-action .forward").removeClass("disabled");
		if(localStorage.curPos >= backList.length - 1)
			$(".history-action .forward").addClass("disabled");
	})

	$(".quick-call, .busnphone, .cellphone").on("click", function(event) {
		$(".call-info .call-name").text($(this).data("name"));
		$(".call-info .call-number").text($(this).data("number"));
		$(".call-error").addClass("hide");
		$(".phone-calling, .phone-mask").slideDown("fast");

		var number = $(this).data("number");
		var makeCall = function(number, ismobile)
		{
			$.XService.makePhoneCall(number, ismobile, function(data){
				console.log(data);
				if(data.content.indexOf("uuid:") == 0)
					localStorage.phoneUUID = data.content.substr(5);
				else
					$(".call-error").text(data.content).removeClass("hide");
			}, function(jqXHR) {
				$(".phone-calling, .phone-mask").slideDown("fast");
				changeTab("login");
			})
		}

		makeCall(number, $(this).hasClass("cellphone"));

		event.preventDefault();
		event.stopPropagation();
	})

	$(".end-call").on("click", function(event) {
		$(".phone-calling, .phone-mask").slideUp("fast");
		if(localStorage.phoneUUID)
		{
			$.XService.stopPhoneCall(localStorage.phoneUUID, function(data){
				console.log(data);
			}, function(jqXHR) {
				changeTab("login");
			})
		}
	})

	$(".end-call").on("keydown", function(event) {
		// prevent tabbing out of the call-mask when calling
		if ( event.keyCode === 9 ) {
			event.preventDefault();
		}
	})

	$("body").on("click", "a", function(event) {
		var href = $(this).attr("href");
		if(href && href != "#") {
			chrome.tabs.create({"url": href});
			event.preventDefault();
		}
	})
})
