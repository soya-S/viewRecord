displist1 = [1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0];
displist2 = [1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,1,1,1];
displist3 = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

mflag = false
offsetX = 0
offsetY = 0

String.prototype.test = function(word){
	return this.indexOf(word) !== -1
}

Array.prototype.test = function(word){
	return this.indexOf(word) !== -1
}

Number.prototype.pad = function(digit){
	return ("          "+this).substr(-digit);
}

String.prototype.pad = function(digit){
	return ("          "+this).substr(-digit);
}

function disp(mode) {
	var displist = [];
	var isdisp;
	var isCustom = false

	if (mode==1){
		displist = displist1;
	}
	else if (mode==2){
		displist = displist2;
	}
	else if (mode==3){
		displist = displist3;
	}
	else if (mode=="load") {
		if (localStorage.displist){
			displist = localStorage.displist.split(',').map(function(x){return parseInt(x)});
		} else {
			displist = window.innerWidth > 800 ? displist1 : displist2
		}
	}
	else {
		isCustom = true;
	}
	displist_new = [] 
	
	$("input[name=chk]").each(function(i,v){
		isdisp = isCustom ? $(v).prop("checked") : displist[i]
		$("#resulttable").toggleClass("invi_"+(i+1), !isdisp)
		$(v).prop("checked",isdisp)
		displist_new.push(isdisp ? "1" : "0")
	})
	localStorage.displist = displist_new.join(",");
}

function checkToggleBySide(side){
	var ischecked,start,stop;
	ischecked = $("input[name=job"+side+"]").prop('checked');
	if(side=="vil"){
		start = 0;
		stop = 5;
	}
	if(side=="wlf"){
		start = 6;
		stop = 7;
	}
	if(side=="fox"){
		start = 8;
		stop = 9;
	}
	for(var i=start; i<=stop; i++){
		$("input[name=job]").eq(i).prop("checked",ischecked).change();
	}
}

function narrowTable() {
	var valuelist = {
		job: ["vil","ura","nec","bgd","fre","cat","wlf","mad","fox","imo","all"],
		result: ["win","draw","lose"],
		type: ["normal","addjob","addfox","addura","deathnote","devil","other"],
	}
	var jobname= ['村　人','占い師','霊能者','狩　人','共有者','猫　又','人　狼','狂　人','妖　狐','背徳者','総　計'];
	var beastjob = ["wlf","mad","fox","imo"]

	Object.keys(valuelist).forEach(function (key) {
		var isshow = $(`input[name=${key}]:checked`).map(
			function(i,v){return $(v).val();}
		).get();

		valuelist[key].forEach(function(x){
			$("#resulttable").toggleClass("invi_"+x, !isshow.test(x));
		})
	});

	var nummin = $("#nummin").val() -0 ;
	var nummax = $("#nummax").val() -0 ;
	for(var i=8; i<=30; i++){
		$("#resulttable").toggleClass("invi_num_"+i,!(i>=nummin && i<=nummax));
	}

	var logs = $("#resulttable tr:visible").not(".menu").map(function(i,v){
		return $(v).attr("class")
	}).get()

	var join = logs.length
	var beast = 0;
	var txt = ""

	valuelist.job.forEach(function(job,i){
		if(job!="all"){
			var logs_job = logs.filter(function(log){return log.test("job_"+job)})
		} else {
			var logs_job = logs
		}


		var battle = logs_job.length
		var win = logs_job.filter(function(log){return log.test("result_win")}).length
		var draw = logs_job.filter(function(log){return log.test("result_draw")}).length
		var lose = logs_job.filter(function(log){return log.test("result_lose")}).length

		if(beastjob.test(job)) beast += battle;

		var win_per = (battle-draw) ? (win * 100 / (battle-draw)).toFixed(1) + "%" : "-";
		var job_per = (battle * 100 / join).toFixed(1) + "%";

		txt += `${jobname[i]}(${job_per.pad(6)})${battle.pad(4)}戦${win.pad(3)}勝${draw.pad(3)}分${lose.pad(3)}敗 勝率${win_per.pad(6)}\n`;

	})
	var tmpbeast=0,tmpwin=0,tmplose=0,contbeast=0,contwin=0,contlose=0;
	logs.forEach(function(log){
		var j = log.split(" ")[0].split("_")[1]
		tmpbeast = (beastjob.test(j)) ? tmpbeast+1 : 0
		if (contbeast < tmpbeast) contbeast = tmpbeast 

		if(log.test("result_win")){
			tmpwin++
			if(contwin < tmpwin) contwin = tmpwin
			tmplose=0
		} else if(log.test("result_lose")){
			tmplose++
			if(contlose < tmplose) contlose = tmplose
			tmpwin=0			
		}
	})

	var beast_per = (beast *100 / join).toFixed(1) + "%";
	txt += "人外率:"+beast_per;
	txt = txt + " 連人外:"+contbeast+"回"
	txt = txt + " 連勝:"+contwin+"回"
	txt = txt + " 連敗:"+contlose+"回"

	txt = txt + "\n"

	var alive = logs.filter( (log)=> {return log.test("alive")}).length
	var alive_per =  (alive *100 / join).toFixed(1) + "%";
	txt = txt + "生存終了:"+alive_per

	var sudden = logs.filter( (log)=> {return log.test("sudden")}).length
	txt = txt + " 突然死:"+sudden+"回"

	$("#txtarea").html(txt);
}

function tagedit(e,vno){
	
	var boxX = e.pageX+10
	if (boxX > window.innerWidth-305)  { boxX = window.innerWidth-305 }
	var boxY = e.pageY+15

	$("#tagedit").css("top",boxY+"px")
	             .css("left",boxX+"px")
	             .show();
	$("#vno_tagedit").text(vno);
	$("#tageditform").empty();
	for(i=2; i<arguments.length; i++){
		if(arguments[i]=="") continue;
		var no = i-2;
		$("#tageditform").append("<span>【"+arguments[i]+"】</span> <label>削除:")
		             .append('<input type="checkbox" name="del'+no+'"></label>')
		             .append('<input type="hidden" name="tag'+no+'" value="'+arguments[i]+'">')
		             .append('<br>');
	}
	$("#tageditform").append('<textarea name="tagadd" rows="3" cols="30"  placeholder="追加したいタグを入力(行区切り)">')
	                 .append('</textarea><br><br>');
	$("#tageditform").append('<input type="hidden" name="vno" value="'+vno+'">');
	$("#tageditform").append('<input type="submit">');
	$("#tageditform").submit(function(){
		window.setTimeout(function(){
			location.reload()
		},2000);
		return true;
	});
}

function tageditclose(){
	$("#tagedit").hide();
}

function mdown(e){
	$("html").on("mousemove",mmove);
	$("#tagedit").on("mouseup",mup);
	offsetX = e.pageX - parseInt( $("#tagedit").css("left") )
	offsetY = e.pageY - parseInt( $("#tagedit").css("top") )
}

function mmove(e){
	$("#tagedit").css("left",e.pageX-offsetX+"px")
	$("#tagedit").css("top",e.pageY-offsetY+"px")
}

function mup(e){
	$("html").off("mousemove")
	$("#tagedit").off("mouseup")
}

function toggleRadio(){
	$("input[type=radio]").each(function(i,chk){
		$(chk).parent().toggleClass("selected",$(chk).prop("checked"))
	})		
}

function setZoom(){
	if($(window).width()<$("#space").width()){
    	var scale = $(window).width() / $("#space").width() * 100 + "%";
    	$('html').css({'zoom' : scale });
	} else {
    	$('html').css({'zoom' : 1 });	
	}
}

$(document).ready(function(){
	narrowTable();
	disp("load");
	$("#vilside").on("change",function(){
		checkToggleBySide("vil");
	});
	$("#wlfside").on("change",function(){
		checkToggleBySide("wlf");
	});
	$("#foxside").on("change",function(){
		checkToggleBySide("fox");
	});
	$("#input input").on("change",narrowTable);
	$("#custom input").on("change",disp);
	$(window).on("resize",function(){
		if(window.innerWidth>960) {
			$("#input_content").show();
		}
	});
	$("#tagedit").on("mousedown",mdown);
	$("#themebutton").on("click",function(){
		togglecss();
	});
	$('#pagetop').click(function () {
        $("html,body").animate({scrollTop:0},"300");
    });
	$(".submit_button").on("click",function(){
		var form = document.createElement('form');
		form.action = 'result.php';
		form.method = 'get';
		var input = document.createElement("textarea");
		input.name = "query";
		input.value = $("#query").val();
		form.appendChild(input);
		var input = document.createElement("input");
		input.name = "operator";
		input.value = $('input[name=operator]:checked').val() == 'OR' ? "OR" : "AND";
		form.appendChild(input);
		var input = document.createElement("input");
		input.name = "reverse";
		input.value = $('input[name=reverse]:checked').val() == 'on' ? "on" : "off";
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	})


	$("#input input[type=checkbox]:checked").each(function(i,chk){
		$(chk).parent().toggleClass("selected",$(chk).checked)
	})
	$("#input input[type=checkbox]").on("change",function(){
		$(this).parent().toggleClass("selected",$(this).prop('checked'))
	})

	toggleRadio()
	$("input[type=radio]").click(function(){
		toggleRadio()
	})	

	$("#fook").click(function(){
		$("#input_content").slideToggle()
	})
    setZoom();
});