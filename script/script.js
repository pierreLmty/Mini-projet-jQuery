const IMAGES_PAR_PAGE = 5;
var nbResultats = 0;
var jcarousel = null;

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
	
	for(var i = 1 ; i <= nbResultats / IMAGES_PAR_PAGE ; i++)
	{
		if(i != numPage)
			$("#page" + i).replaceWith('<a href="#" id="page' + i + '" onclick="afficherPage(' + i + ');">' + i + '</a>');
		else
			$("#page" + numPage).replaceWith('<span id="page' + numPage + '">' + numPage + '</span>');
	}
}


function escapeHtml(text)
{
	return text.replace(/["']/g, "");
}


function parseDate(date)
{
	var mja = date.split("/");
	return mja[2] + "-" + mja[0] + "-" + mja[1] + "T00:00:00-00:00";
}



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
	
	$("#formulaire-recherche").submit(function(event)
	{
		event.preventDefault();
	
		var affichagePhotos = $("#affichage-photos");
		var pages = $("#pages");
		var typeAffichage = $("#affichage").find(":selected").val();
		
		
		// affichage d'une liste pour le carousel ou effacement du contenu présent sinon
		if(typeAffichage == 2)
			var htmlCarousel = '<div class="jcarousel-wrapper"><div class="jcarousel"><ul>';
			
		affichagePhotos.html("");
		
		
		// affichage du numéro des pages ou effacement du contenu présent sinon
		if(typeAffichage == 1)
			pages.html("Pages : ");
		else
			pages.html("");
		
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
	   				
	   				
	   				var date = $("#datepicker").val();
	   				if(date != "")
	   					date = parseDate(date);
	   			
	   			
	   				// affichage des photos et des pages si besoin
				   	$.each(data.items, function(i, item)
				   	{
				   		if((date != "" && date < item.date_taken) || date == "")
				   		{
					   		var detail = "Nom de la photo : " + escapeHtml(item.title) + "<br/>Date de prise de vue : " + escapeHtml(item.date_taken) + "<br/>Identifiant du photographe : " + escapeHtml(item.author);
					   		
					   		if(typeAffichage == 2)
					   			htmlCarousel += '<li><img width="600" height="400" src="' + item.media.m + '" onclick="afficherModal(\'' + detail + '\');"/></li>';
					   		else
								affichagePhotos.append('<span id="image' + i + '"><img src="' + item.media.m + '" onclick="afficherModal(\'' + detail + '\');"/><br/></span>');
						
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
								   		pages.append('<span id="page' + numPage + '">' + numPage + '</span>');
							   		
							   		if(numPage < (nbResultats / IMAGES_PAR_PAGE))
							   			pages.append(" - ");
							   	}
						   	}
						   		
						   	if(i == nbResultats-1)
						   		return false;
					   	}
				   	});
				   	
				   	if(typeAffichage == 2)
				   	{
					   	affichagePhotos.html(htmlCarousel + '</ul></div><a href="#" class="jcarousel-control-prev">&lsaquo;</a><a href="#" class="jcarousel-control-next">&rsaquo;</a><p class="jcarousel-pagination"></p></div>');
					   	// carousel
	jcarousel = $('.jcarousel');
	jcarousel
            .on('jcarousel:reload jcarousel:create', function () {
                var carousel = $(this),
                    width = carousel.innerWidth();

                if (width >= 600) {
                    width = width / 3;
                } else if (width >= 350) {
                    width = width / 2;
                }

                carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
            })
            .jcarousel({
                wrap: 'circular'
            });

        $('.jcarousel-control-prev')
            .jcarouselControl({
                target: '-=1'
            });

        $('.jcarousel-control-next')
            .jcarouselControl({
                target: '+=1'
            });

        $('.jcarousel-pagination')
            .on('jcarouselpagination:active', 'a', function() {
                $(this).addClass('active');
            })
            .on('jcarouselpagination:inactive', 'a', function() {
                $(this).removeClass('active');
            })
            .on('click', function(e) {
                e.preventDefault();
            })
            .jcarouselPagination({
                perPage: 1,
                item: function(page) {
                    return '<a href="#' + page + '">' + page + '</a>';
                }
            });
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
