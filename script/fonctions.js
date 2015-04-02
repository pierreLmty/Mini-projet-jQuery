// Fonctions appelées par le script principal


// Affiche une fenêtre modale contenant le texte passé en paramètre
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


// Affiche la page de résultats dont le numéro est passé en paramètre
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


// Supprime les guillemets et les apostrophes pour éviter les conflits avec les chaînes de caractères JavaScript
function escapeHtml(text)
{
	return text.replace(/["']/g, "");
}


// Change le format de la date MM/DD/AAAA -> AAAA-MM-DDT00:00:00-08:00
function parseDate(date)
{
	var mja = date.split("/");
	return mja[2] + "-" + mja[0] + "-" + mja[1] + "T00:00:00-00:00";
}


// Gestion des évènements du carousel
function actualiserCarousel()
{
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
