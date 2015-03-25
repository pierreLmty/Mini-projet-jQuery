const IMAGES_PAR_PAGE = 5;
var nbResultats = 0;

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


function afficherPage(numPage)
{
	for(var i = 0 ; i < nbResultats ; i++)
	{
		if(i >= (numPage - 1) * IMAGES_PAR_PAGE && i < ((numPage - 1) * IMAGES_PAR_PAGE) + IMAGES_PAR_PAGE)
			$("#image" + i).show();
		else
			$("#image" + i).hide();
	}
}


function escapeHtml(text)
{
	return text.replace(/["']/g, "");
}



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
		var pages = $("#pages");
		
		affichagePhotos.html("");
		pages.html("Pages : ");
		
		var nbResultatsDemande = $("#nb-resultats").val();
	
		if(!isNaN(nbResultatsDemande) && nbResultatsDemande > 0)
		{
			$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + $("#commune").val() + "&tagmode=any&format=json&jsoncallback=?", function(data)
	   		{	 
	   			if(data.items.length > nbResultatsDemande)
	   				nbResultats = nbResultatsDemande;
	   			else
	   				nbResultats = data.items.length;
	   		  		
	   			if(data.items.length > 0)
	   			{
				   	$.each(data.items, function(i, item)
				   	{
				   		// trier en fonction de $("#tri").find(":selected").text()
				   	
				   		var detail = "Nom de la photo : " + escapeHtml(item.title) + "<br/>Date de prise de vue : " + escapeHtml(item.date_taken) + "<br/>Identifiant du photographe : " + escapeHtml(item.author);
				   		
						affichagePhotos.append('<span id="image' + i + '"><img src="' + item.media.m + '" onclick="afficherModal(\'' + detail + '\');"/><br/></span>');
						
				   		if(i >= IMAGES_PAR_PAGE)
				   			$("#image" + i).hide();
					   	
					   	if(i % IMAGES_PAR_PAGE == 0)
					   	{
					   		numPage = (i / IMAGES_PAR_PAGE) + 1;
					   		pages.append('<a href="#" onclick="afficherPage(' + numPage + ');">' + numPage + '</a>');
					   		
					   		if(numPage < (nbResultats / IMAGES_PAR_PAGE))
					   			pages.append(" - ");
					   	}
					   		
					   	if(i == nbResultats-1)
					   		return false;
				   	});
			   	}
			   	else
			   		afficherModal("Pas de résultat pour cette recherche");
			});
		}
		else
			afficherModal("Erreur : nombre de résultats demandé invalide");
	});
});
