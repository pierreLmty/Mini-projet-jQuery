/////////////////////////////////////////////////
//
// Script principal qui gère les évènements
//
/////////////////////////////////////////////////


const IMAGES_PAR_PAGE = 5;
var nbResultats = 0;
var jcarousel = null;


$(document).ready(function()
{
	// calendrier
	$("#datepicker").datepicker();
	

	// autocomplétion
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
	
	
	// Évènement appelé lors d'une recherche
	$("#formulaire-recherche").submit(function(event)
	{
		event.preventDefault();
	
		var affichagePhotos = $("#affichage-photos");
		var affichagePhotosCarrousel = $("#affichage-photos-carrousel");
		var pages = $("#pages");
		var typeAffichage = $("#affichage").find(":selected").val();
		
		
		// affichage d'une liste pour le carousel ou effacement du contenu présent sinon
		if(typeAffichage == 2)
			var htmlCarousel = '<div class="jcarousel-wrapper"><div class="jcarousel"><ul>';
			
		affichagePhotos.html("");
		affichagePhotosCarrousel.html("");
		
		
		// affichage du numéro des pages ou effacement du contenu présent sinon
		if(typeAffichage == 1)
			pages.html("Pages : ");
		else
			pages.html("");
		
		var nbResultatsDemande = $("#nb-resultats").val();
	
		if(!isNaN(nbResultatsDemande) && nbResultatsDemande > 0)
		{
			// on récupère les résultats
			$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + $("#commune").val() + "&tagmode=any&format=json&jsoncallback=?", function(data)
	   		{
	   			// sauvegarde du nombre de résultats pour des traitements futurs
	   			if(data.items.length > nbResultatsDemande)
	   				nbResultats = nbResultatsDemande;
	   			else
	   				nbResultats = data.items.length;
	   				
	   		  		
	   			if(data.items.length > 0)
	   			{	   			
		   			// tri si besoin
	   				var tri = $("#tri").find(":selected").val();
	   				if(tri == 1)
	   				{
		   				data.items = data.items.sort(function(a, b)
		   				{
		   					return (a["date_taken"] < b["date_taken"]) ? 1 : ((a["date_taken"] > b["date_taken"]) ? -1 : 0);
		   				});
	   				}
	   				else if(tri == 2)
	   				{
	   					data.items = data.items.sort(function(a, b)
		   				{
		   					return (a["title"] > b["title"]) ? 1 : ((a["title"] < b["title"]) ? -1 : 0);
		   				});
	   				}
	   				else if(tri == 3)
	   				{
	   					data.items = data.items.sort(function(a, b)
		   				{
		   					return (a["author"] > b["author"]) ? 1 : ((a["author"] < b["author"]) ? -1 : 0);
		   				});
	   				}
	   				
	   				
	   				// prise en compte de la date minimum de prise de vue
	   				var date = $("#datepicker").val();
	   				if(date != "")
	   					date = parseDate(date);
	   			
	   			
	   				// affichage des photos et éventuellement des pages (si demandé)
				   	$.each(data.items, function(i, item)
				   	{
				   		if((date != "" && date < item.date_taken) || date == "")
				   		{
					   		var detail = "Nom de la photo : " + escapeHtml(item.title) + "<br/>Date de prise de vue : " + escapeHtml(item.date_taken) + "<br/>Identifiant du photographe : " + escapeHtml(item.author);
					   		
					   		if(typeAffichage == 2)
					   			htmlCarousel += '<li><img class="carrousel" src="' + item.media.m + '" onclick="afficherModal(\'' + detail + '\');"/></li>';
					   		else
								affichagePhotos.append('<span id="image' + i + '"><img class="general" src="' + item.media.m + '" onclick="afficherModal(\'' + detail + '\');"/><br/></span>');
						
							if(typeAffichage == 1)
							{
						   		if(i >= IMAGES_PAR_PAGE)
						   			$("#image" + i).hide();
							   	
							   	if(i % IMAGES_PAR_PAGE == 0)
							   	{
							   		numPage = (i / IMAGES_PAR_PAGE) + 1;
							   		if(numPage != 1)
								   		pages.append('<a href="#" id="page' + numPage + '" onclick="afficherPage(' + numPage + ');">' + numPage + '</a>');
								   	else
								   		pages.append('<span id="page' + numPage + '" class="page-courante">' + numPage + '</span>');
							   		
							   		if(numPage < (nbResultats / IMAGES_PAR_PAGE))
							   			pages.append(" - ");
							   	}
						   	}
						   		
						   	if(i == nbResultats-1)
						   		return false;
					   	}
				   	});
				   	
				   	// Affichage du carrousel
				   	if(typeAffichage == 2)
				   	{
					   	affichagePhotosCarrousel.html(htmlCarousel + '</ul></div><a href="#" class="jcarousel-control-prev">&lsaquo;</a><a href="#" class="jcarousel-control-next">&rsaquo;</a><p class="jcarousel-pagination"></p></div>');/**/
					   	actualiserCarousel();
				   	}
			   	}
			   	else
			   		afficherModal("Pas de résultat pour cette recherche");
			});
		}
		else
			afficherModal("Erreur : nombre de résultats demandé invalide");
	});
});
