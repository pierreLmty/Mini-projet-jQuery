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
	
	$("#formulaire-recherche").submit(function(event)
	{
		event.preventDefault();
	
		var affichagePhotos = $("#affichage-photos");
		affichagePhotos.html("");
		
		var nbResultats = $("#nb-resultats").val();
	
		if(!isNaN(nbResultats) && nbResultats > 0)
		{
			$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + $("#commune").val() + "&tagmode=any&format=json&jsoncallback=?", function(data)
	   		{
	   			if(data.items.length > 0)
	   			{
				   	$.each(data.items, function(i, item)
				   	{
					   	affichagePhotos.append('<img src="' + item.media.m + '"/><br/>');
					   	if (i == nbResultats-1) return false;
				   	});
			   	}
			   	else
			   		afficherModal("Pas de résultat pour cette recherche");
			});
		}
		else
			afficherModal("Erreur : nombre de résultats demandé invalide");
	});
	
	
	function afficherModal(texte)
	{
		var modal = $("#modal");
		modal.html('<span id="modal-close">&#215;</span><h1>' + texte + '</h1>');
	
		$("#modal-close").on("click", function()
		{
			$("#modal").hide();
			$('#modalbg').hide();
		});
	
		modal.show();
		$('#modalbg').show();
	}
});
