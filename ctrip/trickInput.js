



$(function(){

	var strArr = ['皇家加勒比.海洋量子号 5天3晚','友情链接：神州租车网易旅游爱奇艺旅','(Original Motion Picture Soundtrack)'];

	var bannerIndex = 0;
	var timer,timer2;

	function texInput (){
		$('strong').hide();
		var texArr = [];

		var inputVal = '';

		for(var i=0;i<strArr[bannerIndex].length;i++){
			texArr[i] = strArr[bannerIndex].charAt(i);
		}

		var arrIndex = 0;

		timer = setInterval(function(){

			inputVal += texArr[arrIndex];

			arrIndex++;
			if(arrIndex >= texArr.length){
				clearInterval(timer);
				$('strong').show();
			}
			$('input').focus().val(inputVal);

		}, 100)

		bannerIndex++;

		if(bannerIndex >= strArr.length){
			bannerIndex = 0;
		}

	}

	texInput();
	clearInterval(timer2);
	timer2 = setInterval(texInput, 5000);

	

	$('input').click(function(event){

		event.stopPropagation();
		$(this).focus();
		clearInterval(timer);
		clearInterval(timer2);
		$(this).val('');
	})

	$(document).click(function(event) {
		$('input').val(strArr[bannerIndex-1]);
		clearInterval(timer2);
		timer2 = setInterval(texInput, 5000);
	});

	$('input').hover(function() {
		$(this).css('background','#f1f1f1');
	}, function() {
		$(this).css('background','#fff');
	});
})






