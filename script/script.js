$(document).ready(function()
{
	$("#commune").autocomplete(
	{
		source: function(requete, reponse)
		{
			if(requete.term.length >= 3)
			{
				$.ajax(
				{
					type: "POST",
					dataType: "json",
					url: "http://infoweb-ens/~jacquin-c/codePostal/commune.php",
					data: "commune=" + requete.term + "&maxRows=10",
					success: function(villes)
					{
						reponse($.map(villes, function(item)
						{
							return {
								label : item.Ville,
								value : item.Ville
							}
						}));
					}
				});
			}
		},
		minLength: 3
	});
	
	$("#envoyer").on("click", function()
	{
		var affichagePhotos = $("#affichage-photos");
		affichagePhotos.html("");
	
		$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + $("#commune").val() + "&tagmode=any&format=json&jsoncallback=?", function(data)
   		{
		   	$.each(data.items, function(i, item)
		   	{
			   	affichagePhotos.append('<img src="' + item.media.m + '"/><br/>');
			   	if (i == 6) return false;
		   	});
		});
	});
});
