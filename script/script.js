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
								label : item.Ville
							}
						}));
					}
				});
			}
		},
		minLength: 3
	});
});
