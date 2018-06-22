/* #######################################  PQ Form Utils  #######################################
	A Doc Ready JQuery function must be added to the JavaScript on the form .html page.

	$(document).ready(function(e) {
		startFormUtils([form id],[country element id],[state/province element id],[market element id],[sub-market element id],[email element id],[first name element id]);
	});

	EXAMPLE:
		startFormUtils('contact', 'country', 'state_province', 'market', 'submarket', 'email', 'firstname');

   ############################################################################################### */


// Function to initialize utilities
//  Call this from within a $(document).ready JQuery function on the form page
function startFormUtils(sfuForm, sfuCountry, sfuStateprov, sfuMarket, sfuSubmarket, sfuEmail, sfuFirstname) {

	if ( $('[name="RECIPIENT_ID_*"]').length )  // there is a cookie for this page
		initFormIdentityLink(sfuForm, sfuFirstname, sfuEmail, sfuCountry, sfuStateprov);

	checkCountryState('init', sfuCountry, sfuStateprov);

	checkMarketSubmarket('init', sfuMarket, sfuSubmarket);

	$('#'+sfuCountry).change(function(e) {
		checkCountryState('change', sfuCountry, sfuStateprov);
	});

	$('#'+sfuMarket).change(function(e) {
		checkMarketSubmarket('change', sfuMarket, sfuSubmarket);
	});

	$('#'+sfuFirstname).focus();						// focus on the first name field

}


// Function to initialize the identity clearing framework if applicable
function initFormIdentityLink(sfuForm, sfuFirstname, sfuEmail, sfuCountry, sfuStateprov) {

	// Build reset text
	resetText = 'Not '+$('#'+sfuFirstname).val()+'? <a href="#" class="clear-identity-action" name="clear_form" xt="SPNOTRACK">Clear the form</a>.';
	resetTag = '<p class="clear-identity">'+resetText+'</p>';
	$('#'+sfuForm).before(resetTag);

	// Bind clearIdentity function to click event on identity links
	$('.clear-identity-action').click(function(e) {
		e.preventDefault();						// don't reload the page
		clearIdentity(sfuForm, sfuEmail);				// clear the form
console.log('Country: ', sfuCountry, '  State: ', sfuStateprov);
		checkCountryState('init', sfuCountry, sfuStateprov);		// reset the State/Province field if needed
console.log('Country: ', sfuCountry, '  State: ', sfuStateprov);
		$('#'+sfuFirstname).focus();					// focus on the first name field
	});

}


// Function to clear the contact form, including cookie and hidden recipient id field
function clearIdentity(sfuForm, sfuEmail) {

	// Clear the cookie
	//var remove_sp_identity = $.removeCookie('SP_IDENTITY');
	//var remove_sp_identity = $.removeCookie('SP_IDENTITY', { path: '/' });
	var remove_sp_identity = true;
	console.log('Cookie removed: ', remove_sp_identity); ////////////////////////////////

	// If cookie removal was successful, finish the job
	if ( remove_sp_identity ) {
		$('[name="RECIPIENT_ID_*"]').remove();				// remove the recipient id field
		$('.clear-identity').html('');					// remove the clear identity link from above the form
		$('#'+sfuForm ).clearForm();					// reset the form (from jquery.form.js)
		$('#'+sfuEmail).prop('disabled', false);			// enable email field
		$('#'+sfuEmail).prop('required', 'required');			// require an email address
	}

}


// Function to check the value of the "Country" field and set the "State/Province" field accordingly
function checkCountryState(mode, sfuCountry, sfuStateprov) {

	// Remember selected state/province
	var currentState = $('#'+sfuStateprov+' option:selected').val();
console.log('currentState: ', currentState);

	// clear existing options from state/province dropdown
	$('#'+sfuStateprov).empty();

	// Get selected country
	var currentCountry = $('#'+sfuCountry).val();
console.log('currentCountry: ', currentCountry);

	// Get country and states from JSON
	var selectedCountry = countryStateList.filter(function(countryState) { return countryState.country == currentCountry });

	if ( selectedCountry.length ) {
		if ( selectedCountry[0].states.length ) {  // this country has states or provinces

			$('#'+sfuStateprov).prop('disabled', false);		// enable state/province field
			$('#'+sfuStateprov).prop('required', 'required');	// require state/province field
			$('#'+sfuStateprov).parent().find('label > span.parsley-required').remove();
			$('#'+sfuStateprov).parent().children('label').append('<span class="parsley-required"> *</span>');

			// Build country's state/province dropdown list
			var blankOption = new Option('', '');
			$('#'+sfuStateprov).append(blankOption);
			$(selectedCountry[0].states).each(function(index, element) {
				var o = new Option(element.name, element.code);
				$('#'+sfuStateprov).append(o);
			});

			// if this is initiating the form, re-set the existing value loaded from contact
			if ( mode == 'init' ) {
				$('#'+sfuStateprov+' option').prop('selected', false);
				$('#'+sfuStateprov+' option[value="'+currentState+'"]').prop('selected', 'selected');
				$('#'+sfuStateprov).val(currentState);
			}

			return;

		}
	}

	// This country does not have states or provinces
	$('#'+sfuStateprov).prop('disabled', 'disabled');	// disable field
	$('#'+sfuStateprov).removeProp('required');		// do not require validation
	$('#'+sfuStateprov).parent().find('label > span.parsley-required').remove();
	$('#'+sfuStateprov).parsley().validate({force: true});	// to remove any Parsley border

}


// Function to check the value of the "Market" field and set the "Submarket" field accordingly
function checkMarketSubmarket(mode, sfuMarket, sfuSubmarket) {

	// Remember selected submarket
	var currentSubmarket = $('#'+sfuSubmarket+' option:selected').val();

	// clear existing options from submarket dropdown
	$('#'+sfuSubmarket).empty();

	// Get selected market
	var currentMarket = $('#'+sfuMarket).val();

	// Get market and submarkets from JSON
	var selectedMarket = marketSubmarketList.filter(function(marketSubmarket) { return marketSubmarket.market == currentMarket });

	if ( selectedMarket.length ) {
		if ( selectedMarket[0].submarkets.length ) {  // this market has submarkets (should always be true)

			$('#'+sfuSubmarket).prop('disabled', false);		// enable submarket field

			// Build market's submarket dropdown list
			var blankOption = new Option('', '');
			$('#'+sfuSubmarket).append(blankOption);
			$(selectedMarket[0].submarkets).each(function(index, element) {
				var o = new Option(element, element);
				$('#'+sfuSubmarket).append(o);
			});

			// if this is initiating the form, re-set the existing value loaded from contact
			if ( mode == 'init') {
				$('#'+sfuSubmarket+' option').prop('selected', false);
				$('#'+sfuSubmarket+' option[value="'+currentSubmarket+'"]').prop('selected', 'selected');
				$('#'+sfuSubmarket).val(currentSubmarket);
			}

		}
		else {  // this market does not have submarkets (should never be true)

			$('#'+sfuSubmarket).prop('disabled', 'disabled');	// disable field (shouldn't be possible for market/submarket)

		}
	}

}


// ###############################################################################################
// #######################################  DATA SECTION  ########################################

// Define JSON for countries and states
var countryStateList = [
{'country' : 'Afghanistan', 'states' : []},
{'country' : 'Aland Islands', 'states' : []},
{'country' : 'Albania', 'states' : []},
{'country' : 'Algeria', 'states' : []},
{'country' : 'American Samoa', 'states' : []},
{'country' : 'Andorra', 'states' : []},
{'country' : 'Angola', 'states' : []},
{'country' : 'Anguilla', 'states' : []},
{'country' : 'Antarctica', 'states' : []},
{'country' : 'Antigua and Barbuda', 'states' : []},
{'country' : 'Argentina', 'states' : []},
{'country' : 'Armenia', 'states' : []},
{'country' : 'Aruba', 'states' : []},
{'country' : 'Australia', 'states' : [
	{'name': "Australian Capital Territory", "code": "ACT"},
	{'name': "New South Wales", "code": "NSW"},
	{'name': "Northern Territory", "code": "NT"},
	{'name': "Queensland", "code": "QLD"},
	{'name': "South Australia", "code": "SA"},
	{'name': "Tasmania", "code": "TAS"},
	{'name': "Victoria", "code": "VIC"},
	{'name': "Western Australia", "code": "WA"}
]},
{'country' : 'Austria', 'states' : []},
{'country' : 'Azerbaijan', 'states' : []},
{'country' : 'Bahamas', 'states' : []},
{'country' : 'Bahrain', 'states' : []},
{'country' : 'Bangladesh', 'states' : []},
{'country' : 'Barbados', 'states' : []},
{'country' : 'Belarus', 'states' : []},
{'country' : 'Belgium', 'states' : []},
{'country' : 'Belize', 'states' : []},
{'country' : 'Benin', 'states' : []},
{'country' : 'Bermuda', 'states' : []},
{'country' : 'Bhutan', 'states' : []},
{'country' : 'Bolivia, Plurinational State of', 'states' : []},
{'country' : 'Bonaire, Sint Eustatius and Saba', 'states' : []},
{'country' : 'Bosnia and Herzegovina', 'states' : []},
{'country' : 'Botswana', 'states' : []},
{'country' : 'Bouvet Island', 'states' : []},
{'country' : 'Brazil', 'states' : [
	{'name': "Acre", "code": "AC"},
	{'name': "Alagoas", "code": "AL"},
	{'name': "AmapÃ¡", "code": "AP"},
	{'name': "Amazonas", "code": "AM"},
	{'name': "Bahia", "code": "BA"},
	{'name': "CearÃ¡", "code": "CE"},
	{'name': "Distrito Federal", "code": "DF"},
	{'name': "EspÃ­rito Santo", "code": "ES"},
	{'name': "GoiÃ¡s", "code": "GO"},
	{'name': "MaranhÃ£o", "code": "MA"},
	{'name': "Mato Grosso", "code": "MT"},
	{'name': "Mato Grosso do Sul", "code": "MS"},
	{'name': "Minas Gerais", "code": "MG"},
	{'name': "ParÃ¡", "code": "PA"},
	{'name': "ParaÃ­ba", "code": "PB"},
	{'name': "ParanÃ¡", "code": "PR"},
	{'name': "Pernambuco", "code": "PE"},
	{'name': "PiauÃ­", "code": "PI"},
	{'name': "Rio de Janeiro", "code": "RJ"},
	{'name': "Rio Grande do Norte", "code": "RN"},
	{'name': "Rio Grande do Sul", "code": "RS"},
	{'name': "RondÃ´nia", "code": "RO"},
	{'name': "Roraima", "code": "RR"},
	{'name': "Santa Catarina", "code": "SC"},
	{'name': "SÃ£o Paulo", "code": "SP"},
	{'name': "Sergipe", "code": "SE"},
	{'name': "Tocantins", "code": "TO"}
]},
{'country' : 'British Indian Ocean Territory', 'states' : []},
{'country' : 'Brunei Darussalam', 'states' : []},
{'country' : 'Bulgaria', 'states' : []},
{'country' : 'Burkina Faso', 'states' : []},
{'country' : 'Burundi', 'states' : []},
{'country' : 'Cambodia', 'states' : []},
{'country' : 'Cameroon', 'states' : []},
{'country' : 'Canada', 'states' : [
	{'name': "Alberta", "code": "AB"},
	{'name': "British Columbia", "code": "BC"},
	{'name': "Manitoba", "code": "MB"},
	{'name': "New Brunswick", "code": "NB"},
	{'name': "Newfoundland and Labrador", "code": "NL"},
	{'name': "Nova Scotia", "code": "NS"},
	{'name': "Northwest Territories", "code": "NT"},
	{'name': "Nunavut", "code": "NU"},
	{'name': "Ontario", "code": "ON"},
	{'name': "Prince Edward Island", "code": "PE"},
	{'name': "Quebec", "code": "QC"},
	{'name': "Saskatchewan", "code": "SK"},
	{'name': "Yukon", "code": "YT"}
]},
{'country' : 'Cape Verde', 'states' : []},
{'country' : 'Cayman Islands', 'states' : []},
{'country' : 'Central African Republic', 'states' : []},
{'country' : 'Chad', 'states' : []},
{'country' : 'Chile', 'states' : []},
{'country' : 'China', 'states' : [
	{'name' : 'Anhui Province', 'code' : 'AH'},
	{'name' : 'Beijing Municipality', 'code' : 'BJ'},
	{'name' : 'Chongqing Municipality', 'code' : 'CQ'},
	{'name' : 'Fujian Province', 'code' : 'FJ'},
	{'name' : 'Gansu Province', 'code' : 'GS'},
	{'name' : 'Guangdong Province', 'code' : 'GD'},
	{'name' : 'Guangxi Zhuang Autonomous Region', 'code' : 'GX'},
	{'name' : 'Guizhou Province', 'code' : 'GZ'},
	{'name' : 'Hainan Province', 'code' : 'HI'},
	{'name' : 'Hebei Province', 'code' : 'HE'},
	{'name' : 'Heilongjiang Province', 'code' : 'HL'},
	{'name' : 'Henan Province', 'code' : 'HA'},
	{'name' : 'Hong Kong Special Administrative Region', 'code' : 'HK'},
	{'name' : 'Hubei Province', 'code' : 'HB'},
	{'name' : 'Hunan Province', 'code' : 'HN'},
	{'name' : 'Inner Mongolia Autonomous Region', 'code' : 'NM'},
	{'name' : 'Jiangsu Province', 'code' : 'JS'},
	{'name' : 'Jiangxi Province', 'code' : 'JX'},
	{'name' : 'Jilin Province', 'code' : 'JL'},
	{'name' : 'Liaoning Province', 'code' : 'LN'},
	{'name' : 'Macau Special Administrative Region', 'code' : 'MC'},
	{'name' : 'Ningxia Hui Autonomous Region', 'code' : 'NX'},
	{'name' : 'Qinghai Province', 'code' : 'QH'},
	{'name' : 'Shaanxi Province', 'code' : 'SN'},
	{'name' : 'Shandong Province', 'code' : 'SD'},
	{'name' : 'Shanghai Municipality', 'code' : 'SH'},
	{'name' : 'Shanxi Province', 'code' : 'SX'},
	{'name' : 'Sichuan Province', 'code' : 'SC'},
	{'name' : 'Taiwan Province', 'code' : 'TW'},
	{'name' : 'Tianjin Municipality', 'code' : 'TJ'},
	{'name' : 'Tibet Autonomous Region', 'code' : 'XZ'},
	{'name' : 'Xinjiang Uyghur Autonomous Region', 'code' : 'XJ'},
	{'name' : 'Yunnan Province', 'code' : 'YN'},
	{'name' : 'Zhejiang Province', 'code' : 'ZJ'}
]},
{'country' : 'Christmas Island', 'states' : []},
{'country' : 'Cocos (Keeling) Islands', 'states' : []},
{'country' : 'Colombia', 'states' : []},
{'country' : 'Comoros', 'states' : []},
{'country' : 'Congo', 'states' : []},
{'country' : 'Congo, The Democratic Republic of the', 'states' : []},
{'country' : 'Cook Islands', 'states' : []},
{'country' : 'Costa Rica', 'states' : []},
{'country' : 'Cote d\'Ivoire', 'states' : []},
{'country' : 'Croatia', 'states' : []},
{'country' : 'Cuba', 'states' : []},
{'country' : 'Curacao', 'states' : []},
{'country' : 'Cyprus', 'states' : []},
{'country' : 'Czech Republic', 'states' : []},
{'country' : 'Denmark', 'states' : []},
{'country' : 'Djibouti', 'states' : []},
{'country' : 'Dominica', 'states' : []},
{'country' : 'Dominican Republic', 'states' : []},
{'country' : 'Ecuador', 'states' : []},
{'country' : 'Egypt', 'states' : []},
{'country' : 'El Salvador', 'states' : []},
{'country' : 'Equatorial Guinea', 'states' : []},
{'country' : 'Eritrea', 'states' : []},
{'country' : 'Estonia', 'states' : []},
{'country' : 'Ethiopia', 'states' : []},
{'country' : 'Falkland Islands (Malvinas)', 'states' : []},
{'country' : 'Faroe Islands', 'states' : []},
{'country' : 'Fiji', 'states' : []},
{'country' : 'Finland', 'states' : []},
{'country' : 'France', 'states' : [
	{'name' : 'AIN', 'code' : 'AIN'},
	{'name' : 'AISNE', 'code' : 'AISNE'},
	{'name' : 'ALLIER', 'code' : 'ALLIER'},
	{'name' : 'ALPES-DE-HAUTE-PROVENCE', 'code' : 'ALPES-DE-HAUTE-PROVENCE'},
	{'name' : 'ALPES-MARITIMES', 'code' : 'ALPES-MARITIMES'},
	{'name' : 'ARDECHE', 'code' : 'ARDECHE'},
	{'name' : 'ARDENNES', 'code' : 'ARDENNES'},
	{'name' : 'ARIEGE', 'code' : 'ARIEGE'},
	{'name' : 'AUBE', 'code' : 'AUBE'},
	{'name' : 'AUDE', 'code' : 'AUDE'},
	{'name' : 'AVEYRON', 'code' : 'AVEYRON'},
	{'name' : 'BAS-RHIN', 'code' : 'BAS-RHIN'},
	{'name' : 'BOUCHES-DU-RHONE', 'code' : 'BOUCHES-DU-RHONE'},
	{'name' : 'CALVADOS', 'code' : 'CALVADOS'},
	{'name' : 'CANTAL', 'code' : 'CANTAL'},
	{'name' : 'CHARENTE', 'code' : 'CHARENTE'},
	{'name' : 'CHARENTE-MARITIME', 'code' : 'CHARENTE-MARITIME'},
	{'name' : 'CHER', 'code' : 'CHER'},
	{'name' : 'CORREZE', 'code' : 'CORREZE'},
	{'name' : 'CORSE-DU-SUD', 'code' : 'CORSE-DU-SUD'},
	{'name' : 'COTE D\'OR', 'code' : 'COTE D\'OR'},
	{'name' : 'COTES-D\'ARMOR', 'code' : 'COTES-D\'ARMOR'},
	{'name' : 'CREUSE', 'code' : 'CREUSE'},
	{'name' : 'DEUX-SEVRES', 'code' : 'DEUX-SEVRES'},
	{'name' : 'DORDOGNE', 'code' : 'DORDOGNE'},
	{'name' : 'DOUBS', 'code' : 'DOUBS'},
	{'name' : 'DROME', 'code' : 'DROME'},
	{'name' : 'ESSONNE', 'code' : 'ESSONNE'},
	{'name' : 'EURE', 'code' : 'EURE'},
	{'name' : 'EURE-ET-LOIR', 'code' : 'EURE-ET-LOIR'},
	{'name' : 'FINISTERE', 'code' : 'FINISTERE'},
	{'name' : 'GARD', 'code' : 'GARD'},
	{'name' : 'GERS', 'code' : 'GERS'},
	{'name' : 'GIRONDE', 'code' : 'GIRONDE'},
	{'name' : 'GUADELOUPE', 'code' : 'GUADELOUPE'},
	{'name' : 'GUYANE', 'code' : 'GUYANE'},
	{'name' : 'HAUTE-CORSE', 'code' : 'HAUTE-CORSE'},
	{'name' : 'HAUTE-GARONNE', 'code' : 'HAUTE-GARONNE'},
	{'name' : 'HAUTE-LOIRE', 'code' : 'HAUTE-LOIRE'},
	{'name' : 'HAUTE-MARNE', 'code' : 'HAUTE-MARNE'},
	{'name' : 'HAUTES-ALPES', 'code' : 'HAUTES-ALPES'},
	{'name' : 'HAUTE-SAONE', 'code' : 'HAUTE-SAONE'},
	{'name' : 'HAUTE-SAVOIE', 'code' : 'HAUTE-SAVOIE'},
	{'name' : 'HAUTES-PYRENEES', 'code' : 'HAUTES-PYRENEES'},
	{'name' : 'HAUTE-VIENNE', 'code' : 'HAUTE-VIENNE'},
	{'name' : 'HAUT-RHIN', 'code' : 'HAUT-RHIN'},
	{'name' : 'HAUTS-DE-SEINE', 'code' : 'HAUTS-DE-SEINE'},
	{'name' : 'HERAULT', 'code' : 'HERAULT'},
	{'name' : 'ILLE-ET-VILAINE', 'code' : 'ILLE-ET-VILAINE'},
	{'name' : 'INDRE', 'code' : 'INDRE'},
	{'name' : 'INDRE-ET-LOIRE', 'code' : 'INDRE-ET-LOIRE'},
	{'name' : 'ISERE', 'code' : 'ISERE'},
	{'name' : 'JURA', 'code' : 'JURA'},
	{'name' : 'LANDES', 'code' : 'LANDES'},
	{'name' : 'LOIRE', 'code' : 'LOIRE'},
	{'name' : 'LOIRE-ATLANTIQUE', 'code' : 'LOIRE-ATLANTIQUE'},
	{'name' : 'LOIRET', 'code' : 'LOIRET'},
	{'name' : 'LOIR-ET-CHER', 'code' : 'LOIR-ET-CHER'},
	{'name' : 'LOT', 'code' : 'LOT'},
	{'name' : 'LOT-ET-GARONNE', 'code' : 'LOT-ET-GARONNE'},
	{'name' : 'LOZERE', 'code' : 'LOZERE'},
	{'name' : 'MAINE-ET-LOIRE', 'code' : 'MAINE-ET-LOIRE'},
	{'name' : 'MANCHE', 'code' : 'MANCHE'},
	{'name' : 'MARNE', 'code' : 'MARNE'},
	{'name' : 'MARTINIQUE', 'code' : 'MARTINIQUE'},
	{'name' : 'MAYENNE', 'code' : 'MAYENNE'},
	{'name' : 'MEURTHE-ET-MOSELLE', 'code' : 'MEURTHE-ET-MOSELLE'},
	{'name' : 'MEUSE', 'code' : 'MEUSE'},
	{'name' : 'MORBIHAN', 'code' : 'MORBIHAN'},
	{'name' : 'MOSELLE', 'code' : 'MOSELLE'},
	{'name' : 'NIEVRE', 'code' : 'NIEVRE'},
	{'name' : 'NORD', 'code' : 'NORD'},
	{'name' : 'OISE', 'code' : 'OISE'},
	{'name' : 'ORNE', 'code' : 'ORNE'},
	{'name' : 'PARIS', 'code' : 'PARIS'},
	{'name' : 'PAS-DE-CALAIS', 'code' : 'PAS-DE-CALAIS'},
	{'name' : 'PUY-DE-DOME', 'code' : 'PUY-DE-DOME'},
	{'name' : 'PYRENEES-ATLANTIQUES', 'code' : 'PYRENEES-ATLANTIQUES'},
	{'name' : 'PYRENEES-ORIENTALES', 'code' : 'PYRENEES-ORIENTALES'},
	{'name' : 'RHONE', 'code' : 'RHONE'},
	{'name' : 'SAONE-ET-LOIRE', 'code' : 'SAONE-ET-LOIRE'},
	{'name' : 'SARTHE', 'code' : 'SARTHE'},
	{'name' : 'SAVOIE', 'code' : 'SAVOIE'},
	{'name' : 'SEINE-ET-MARNE', 'code' : 'SEINE-ET-MARNE'},
	{'name' : 'SEINE-MARITIME', 'code' : 'SEINE-MARITIME'},
	{'name' : 'SEINE-SAINT-DENIS', 'code' : 'SEINE-SAINT-DENIS'},
	{'name' : 'SOMME', 'code' : 'SOMME'},
	{'name' : 'TARN', 'code' : 'TARN'},
	{'name' : 'TARN-ET-GARONNE', 'code' : 'TARN-ET-GARONNE'},
	{'name' : 'TERRITOIRE DE BELFORT', 'code' : 'TERRITOIRE DE BELFORT'},
	{'name' : 'VAL-DE-MARNE', 'code' : 'VAL-DE-MARNE'},
	{'name' : 'VAL-D\'OISE', 'code' : 'VAL-D\'OISE'},
	{'name' : 'VAR', 'code' : 'VAR'},
	{'name' : 'VAUCLUSE', 'code' : 'VAUCLUSE'},
	{'name' : 'VENDEE', 'code' : 'VENDEE'},
	{'name' : 'VIENNE', 'code' : 'VIENNE'},
	{'name' : 'VOSGES', 'code' : 'VOSGES'},
	{'name' : 'YONNE', 'code' : 'YONNE'},
	{'name' : 'YVELINES', 'code' : 'YVELINES'}
]},
{'country' : 'French Guiana', 'states' : []},
{'country' : 'French Polynesia', 'states' : []},
{'country' : 'French Southern Territories', 'states' : []},
{'country' : 'Gabon', 'states' : []},
{'country' : 'Gambia', 'states' : []},
{'country' : 'Georgia', 'states' : []},
{'country' : 'Germany', 'states' : [
	{'name' : 'BADEN-WURTTEMBERG', 'code' : 'BADEN-WURTTEMBERG'},
	{'name' : 'BAVARIA', 'code' : 'BAVARIA'},
	{'name' : 'BERLIN', 'code' : 'BERLIN'},
	{'name' : 'BRANDENBURG', 'code' : 'BRANDENBURG'},
	{'name' : 'BREMEN', 'code' : 'BREMEN'},
	{'name' : 'HAMBURG', 'code' : 'HAMBURG'},
	{'name' : 'HESSE', 'code' : 'HESSE'},
	{'name' : 'LOWER SAXONY', 'code' : 'LOWER SAXONY'},
	{'name' : 'MECKLENBURG-WESTERN POMERANIA', 'code' : 'MECKLENBURG-WESTERN POMERANIA'},
	{'name' : 'NORTH RHINE-WESTPHALIA', 'code' : 'NORTH RHINE-WESTPHALIA'},
	{'name' : 'RHINELAND-PALATINATE', 'code' : 'RHINELAND-PALATINATE'},
	{'name' : 'SAARLAND', 'code' : 'SAARLAND'},
	{'name' : 'SAXONY', 'code' : 'SAXONY'},
	{'name' : 'SAXONY-ANHALT', 'code' : 'SAXONY-ANHALT'},
	{'name' : 'SCHLESWIG-HOLSTEIN', 'code' : 'SCHLESWIG-HOLSTEIN'},
	{'name' : 'THURINGIA', 'code' : 'THURINGIA'}
]},
{'country' : 'Ghana', 'states' : []},
{'country' : 'Gibraltar', 'states' : []},
{'country' : 'Greece', 'states' : []},
{'country' : 'Greenland', 'states' : []},
{'country' : 'Grenada', 'states' : []},
{'country' : 'Guadeloupe', 'states' : []},
{'country' : 'Guam', 'states' : []},
{'country' : 'Guatemala', 'states' : []},
{'country' : 'Guernsey', 'states' : []},
{'country' : 'Guinea', 'states' : []},
{'country' : 'Guinea-Bissau', 'states' : []},
{'country' : 'Guyana', 'states' : []},
{'country' : 'Haiti', 'states' : []},
{'country' : 'Heard Island and McDonald Islands', 'states' : []},
{'country' : 'Holy See (Vatican City State)', 'states' : []},
{'country' : 'Honduras', 'states' : []},
{'country' : 'Hong Kong', 'states' : []},
{'country' : 'Hungary', 'states' : []},
{'country' : 'Iceland', 'states' : []},
{'country' : 'India', 'states' : [
	{'name' : 'Andaman and Nicobar Islands', 'code' : 'AN'},
	{'name' : 'Andhra Pradesh', 'code' : 'AP'},
	{'name' : 'Arunachal Pradesh', 'code' : 'AR'},
	{'name' : 'Assam', 'code' : 'AS'},
	{'name' : 'Bihar', 'code' : 'BR'},
	{'name' : 'Chandigarh', 'code' : 'CH'},
	{'name' : 'Chhattisgarh', 'code' : 'CT'},
	{'name' : 'Dadra and Nagar Haveli', 'code' : 'DN'},
	{'name' : 'Daman and Diu', 'code' : 'DD'},
	{'name' : 'Delhi', 'code' : 'DL'},
	{'name' : 'Goa', 'code' : 'GA'},
	{'name' : 'Gujarat', 'code' : 'GJ'},
	{'name' : 'Haryana', 'code' : 'HR'},
	{'name' : 'Himachal Pradesh', 'code' : 'HP'},
	{'name' : 'Jammu and Kashmir', 'code' : 'JK'},
	{'name' : 'Jharkhand', 'code' : 'JH'},
	{'name' : 'Karnataka', 'code' : 'KA'},
	{'name' : 'Kerala', 'code' : 'KL'},
	{'name' : 'Lakshadweep', 'code' : 'LD'},
	{'name' : 'Madhya Pradesh', 'code' : 'MP'},
	{'name' : 'Maharashtra', 'code' : 'MH'},
	{'name' : 'Manipur', 'code' : 'MN'},
	{'name' : 'Meghalaya', 'code' : 'ML'},
	{'name' : 'Mizoram', 'code' : 'MZ'},
	{'name' : 'Nagaland', 'code' : 'NL'},
	{'name' : 'Odisha', 'code' : 'OR'},
	{'name' : 'Puducherry', 'code' : 'PY'},
	{'name' : 'Punjab', 'code' : 'PB'},
	{'name' : 'Rajasthan', 'code' : 'RJ'},
	{'name' : 'Sikkim', 'code' : 'SK'},
	{'name' : 'Tamil Nadu', 'code' : 'TN'},
	{'name' : 'Telangana', 'code' : 'TG'},
	{'name' : 'Tripura', 'code' : 'TR'},
	{'name' : 'Uttar Pradesh', 'code' : 'UP'},
	{'name' : 'Uttarakhand', 'code' : 'UT'},
	{'name' : 'West Bengal', 'code' : 'WB'}
]},
{'country' : 'Indonesia', 'states' : []},
{'country' : 'Iran, Islamic Republic of', 'states' : []},
{'country' : 'Iraq', 'states' : []},
{'country' : 'Ireland', 'states' : []},
{'country' : 'Isle of Man', 'states' : []},
{'country' : 'Israel', 'states' : []},
{'country' : 'Italy', 'states' : []},
{'country' : 'Jamaica', 'states' : []},
{'country' : 'Japan', 'states' : [
	{'name' : 'AICHI-KEN', 'code' : 'AICHI-KEN'},
	{'name' : 'AKITA-KEN', 'code' : 'AKITA-KEN'},
	{'name' : 'AOMORI-KEN', 'code' : 'AOMORI-KEN'},
	{'name' : 'CHIBA-KEN', 'code' : 'CHIBA-KEN'},
	{'name' : 'EHIME-KEN', 'code' : 'EHIME-KEN'},
	{'name' : 'FUKUI-KEN', 'code' : 'FUKUI-KEN'},
	{'name' : 'FUKUOKA-KEN', 'code' : 'FUKUOKA-KEN'},
	{'name' : 'FUKUSHIMA', 'code' : 'FUKUSHIMA'},
	{'name' : 'GIFU-KEN', 'code' : 'GIFU-KEN'},
	{'name' : 'GUNMA-KEN', 'code' : 'GUNMA-KEN'},
	{'name' : 'HIROSHIMA', 'code' : 'HIROSHIMA'},
	{'name' : 'HOKKAIDO', 'code' : 'HOKKAIDO'},
	{'name' : 'HYOGO-KEN', 'code' : 'HYOGO-KEN'},
	{'name' : 'IBARAKI-KEN', 'code' : 'IBARAKI-KEN'},
	{'name' : 'ISHIKAWA', 'code' : 'ISHIKAWA'},
	{'name' : 'IWATE-KEN', 'code' : 'IWATE-KEN'},
	{'name' : 'KAGAWA-KEN', 'code' : 'KAGAWA-KEN'},
	{'name' : 'KAGOSHIMA', 'code' : 'KAGOSHIMA'},
	{'name' : 'KANAGAWA', 'code' : 'KANAGAWA'},
	{'name' : 'KOCHI-KEN', 'code' : 'KOCHI-KEN'},
	{'name' : 'KUMAMOTO', 'code' : 'KUMAMOTO'},
	{'name' : 'KYOTO-FU', 'code' : 'KYOTO-FU'},
	{'name' : 'MIE-KEN', 'code' : 'MIE-KEN'},
	{'name' : 'MIYAGI-KEN', 'code' : 'MIYAGI-KEN'},
	{'name' : 'MIYAZAKI', 'code' : 'MIYAZAKI'},
	{'name' : 'NAGANO-KEN', 'code' : 'NAGANO-KEN'},
	{'name' : 'NAGASAKI', 'code' : 'NAGASAKI'},
	{'name' : 'NARA-KEN', 'code' : 'NARA-KEN'},
	{'name' : 'NIIGATA-KEN', 'code' : 'NIIGATA-KEN'},
	{'name' : 'OITA-KEN', 'code' : 'OITA-KEN'},
	{'name' : 'OKAYAMA-KEN', 'code' : 'OKAYAMA-KEN'},
	{'name' : 'OKINAWA-KEN', 'code' : 'OKINAWA-KEN'},
	{'name' : 'OSAKA-FU', 'code' : 'OSAKA-FU'},
	{'name' : 'SAGA-KEN', 'code' : 'SAGA-KEN'},
	{'name' : 'SAITAMA-KEN', 'code' : 'SAITAMA-KEN'},
	{'name' : 'SHIGA-KEN', 'code' : 'SHIGA-KEN'},
	{'name' : 'SHIMANE-KEN', 'code' : 'SHIMANE-KEN'},
	{'name' : 'SHIZUOKA', 'code' : 'SHIZUOKA'},
	{'name' : 'TOCHIGI-KEN', 'code' : 'TOCHIGI-KEN'},
	{'name' : 'TOKUSHIMA', 'code' : 'TOKUSHIMA'},
	{'name' : 'TOKYO-TO', 'code' : 'TOKYO-TO'},
	{'name' : 'TOTTORI', 'code' : 'TOTTORI'},
	{'name' : 'TOYAMA-KEN', 'code' : 'TOYAMA-KEN'},
	{'name' : 'WAKAYAMA', 'code' : 'WAKAYAMA'},
	{'name' : 'YAMAGATA', 'code' : 'YAMAGATA'},
	{'name' : 'YAMAGUCHI', 'code' : 'YAMAGUCHI'},
	{'name' : 'YAMANASHI', 'code' : 'YAMANASHI'}
]},
{'country' : 'Jersey', 'states' : []},
{'country' : 'Jordan', 'states' : []},
{'country' : 'Kazakhstan', 'states' : []},
{'country' : 'Kenya', 'states' : []},
{'country' : 'Kiribati', 'states' : []},
{'country' : 'Korea, Democratic People\'s Republic of', 'states' : []},
{'country' : 'Korea, Republic of', 'states' : []},
{'country' : 'Kuwait', 'states' : []},
{'country' : 'Kyrgyzstan', 'states' : []},
{'country' : 'Lao People\'s Democratic Republic', 'states' : []},
{'country' : 'Latvia', 'states' : []},
{'country' : 'Lebanon', 'states' : []},
{'country' : 'Lesotho', 'states' : []},
{'country' : 'Liberia', 'states' : []},
{'country' : 'Libyan Arab Jamahiriya', 'states' : []},
{'country' : 'Liechtenstein', 'states' : []},
{'country' : 'Lithuania', 'states' : []},
{'country' : 'Luxembourg', 'states' : []},
{'country' : 'Macao', 'states' : []},
{'country' : 'Macedonia, The Former Yugoslav Republic of', 'states' : []},
{'country' : 'Madagascar', 'states' : []},
{'country' : 'Malawi', 'states' : []},
{'country' : 'Malaysia', 'states' : []},
{'country' : 'Maldives', 'states' : []},
{'country' : 'Mali', 'states' : []},
{'country' : 'Malta', 'states' : []},
{'country' : 'Marshall Islands', 'states' : []},
{'country' : 'Martinique', 'states' : []},
{'country' : 'Mauritania', 'states' : []},
{'country' : 'Mauritius', 'states' : []},
{'country' : 'Mayotte', 'states' : []},
{'country' : 'Mexico', 'states' : []},
{'country' : 'Micronesia, Federated States of', 'states' : []},
{'country' : 'Moldova, Republic of', 'states' : []},
{'country' : 'Monaco', 'states' : []},
{'country' : 'Mongolia', 'states' : []},
{'country' : 'Montenegro', 'states' : []},
{'country' : 'Montserrat', 'states' : []},
{'country' : 'Morocco', 'states' : []},
{'country' : 'Mozambique', 'states' : []},
{'country' : 'Myanmar', 'states' : []},
{'country' : 'Namibia', 'states' : []},
{'country' : 'Nauru', 'states' : []},
{'country' : 'Nepal', 'states' : []},
{'country' : 'Netherlands', 'states' : []},
{'country' : 'New Caledonia', 'states' : []},
{'country' : 'New Zealand', 'states' : []},
{'country' : 'Nicaragua', 'states' : []},
{'country' : 'Niger', 'states' : []},
{'country' : 'Nigeria', 'states' : []},
{'country' : 'Niue', 'states' : []},
{'country' : 'Norfolk Island', 'states' : []},
{'country' : 'Northern Mariana Islands', 'states' : []},
{'country' : 'Norway', 'states' : []},
{'country' : 'Occupied Palestinian Territory', 'states' : []},
{'country' : 'Oman', 'states' : []},
{'country' : 'Pakistan', 'states' : []},
{'country' : 'Palau', 'states' : []},
{'country' : 'Panama', 'states' : []},
{'country' : 'Papua New Guinea', 'states' : []},
{'country' : 'Paraguay', 'states' : []},
{'country' : 'Peru', 'states' : []},
{'country' : 'Philippines', 'states' : []},
{'country' : 'Pitcairn', 'states' : []},
{'country' : 'Poland', 'states' : []},
{'country' : 'Portugal', 'states' : []},
{'country' : 'Puerto Rico', 'states' : []},
{'country' : 'Qatar', 'states' : []},
{'country' : 'Reunion', 'states' : []},
{'country' : 'Romania', 'states' : []},
{'country' : 'Russian Federation', 'states' : []},
{'country' : 'Rwanda', 'states' : []},
{'country' : 'Saint Barthelemy', 'states' : []},
{'country' : 'Saint Helena, Ascension and Tristan da Cunha', 'states' : []},
{'country' : 'Saint Kitts and Nevis', 'states' : []},
{'country' : 'Saint Lucia', 'states' : []},
{'country' : 'Saint Martin (French part)', 'states' : []},
{'country' : 'Saint Pierre and Miquelon', 'states' : []},
{'country' : 'Saint Vincent and The Grenadines', 'states' : []},
{'country' : 'Samoa', 'states' : []},
{'country' : 'San Marino', 'states' : []},
{'country' : 'Sao Tome and Principe', 'states' : []},
{'country' : 'Saudi Arabia', 'states' : []},
{'country' : 'Senegal', 'states' : []},
{'country' : 'Serbia', 'states' : []},
{'country' : 'Seychelles', 'states' : []},
{'country' : 'Sierra Leone', 'states' : []},
{'country' : 'Singapore', 'states' : []},
{'country' : 'Sint Maarten (Dutch part)', 'states' : []},
{'country' : 'Slovakia', 'states' : []},
{'country' : 'Slovenia', 'states' : []},
{'country' : 'Solomon Islands', 'states' : []},
{'country' : 'Somalia', 'states' : []},
{'country' : 'South Africa', 'states' : []},
{'country' : 'South Georgia and the South Sandwich Islands', 'states' : []},
{'country' : 'South Sudan', 'states' : []},
{'country' : 'Spain', 'states' : [
	{'name' : 'A CORUÃ‘A', 'code' : 'A CORUÃ‘A'},
	{'name' : 'Ã LAVA', 'code' : 'Ã LAVA'},
	{'name' : 'ALBACETE', 'code' : 'ALBACETE'},
	{'name' : 'ALICANTE', 'code' : 'ALICANTE'},
	{'name' : 'ALMERÃ A', 'code' : 'ALMERÃ A'},
	{'name' : 'ASTURIAS', 'code' : 'ASTURIAS'},
	{'name' : 'Ã VILA', 'code' : 'Ã VILA'},
	{'name' : 'BADAJOZ', 'code' : 'BADAJOZ'},
	{'name' : 'BALEARIC ISLANDS', 'code' : 'BALEARIC ISLANDS'},
	{'name' : 'BARCELONA', 'code' : 'BARCELONA'},
	{'name' : 'BISCAY', 'code' : 'BISCAY'},
	{'name' : 'BURGOS', 'code' : 'BURGOS'},
	{'name' : 'CÃ CERES', 'code' : 'CÃ CERES'},
	{'name' : 'CADIZ', 'code' : 'CADIZ'},
	{'name' : 'CANTABRIA', 'code' : 'CANTABRIA'},
	{'name' : 'CASTELLON', 'code' : 'CASTELLON'},
	{'name' : 'CEUTA', 'code' : 'CEUTA'},
	{'name' : 'CIUDAD REAL', 'code' : 'CIUDAD REAL'},
	{'name' : 'CÃ“RDOBA', 'code' : 'CÃ“RDOBA'},
	{'name' : 'CUENCA', 'code' : 'CUENCA'},
	{'name' : 'GIRONA', 'code' : 'GIRONA'},
	{'name' : 'GRANADA', 'code' : 'GRANADA'},
	{'name' : 'GUADALAJARA', 'code' : 'GUADALAJARA'},
	{'name' : 'GUIPÃšZCOA', 'code' : 'GUIPÃšZCOA'},
	{'name' : 'HUELVA', 'code' : 'HUELVA'},
	{'name' : 'HUESCA', 'code' : 'HUESCA'},
	{'name' : 'JAÃ‰N', 'code' : 'JAÃ‰N'},
	{'name' : 'LA RIOJA', 'code' : 'LA RIOJA'},
	{'name' : 'LAS PALMAS', 'code' : 'LAS PALMAS'},
	{'name' : 'LEÃ“N', 'code' : 'LEÃ“N'},
	{'name' : 'LÃ‰RIDA', 'code' : 'LÃ‰RIDA'},
	{'name' : 'LLEIDA', 'code' : 'LLEIDA'},
	{'name' : 'LUGO', 'code' : 'LUGO'},
	{'name' : 'MADRID', 'code' : 'MADRID'},
	{'name' : 'MALAGA', 'code' : 'MALAGA'},
	{'name' : 'MELILLA', 'code' : 'MELILLA'},
	{'name' : 'MURCIA', 'code' : 'MURCIA'},
	{'name' : 'NAVARRA', 'code' : 'NAVARRA'},
	{'name' : 'OURENSE', 'code' : 'OURENSE'},
	{'name' : 'PALENCIA', 'code' : 'PALENCIA'},
	{'name' : 'PONTEVEDRA', 'code' : 'PONTEVEDRA'},
	{'name' : 'SALAMANCA', 'code' : 'SALAMANCA'},
	{'name' : 'SANTA CRUZ DE TENERIFE', 'code' : 'SANTA CRUZ DE TENERIFE'},
	{'name' : 'SEGOVIA', 'code' : 'SEGOVIA'},
	{'name' : 'SEVILLA', 'code' : 'SEVILLA'},
	{'name' : 'SORIA', 'code' : 'SORIA'},
	{'name' : 'TARRAGONA', 'code' : 'TARRAGONA'},
	{'name' : 'TERUEL', 'code' : 'TERUEL'},
	{'name' : 'TOLEDO', 'code' : 'TOLEDO'},
	{'name' : 'VALENCIA', 'code' : 'VALENCIA'},
	{'name' : 'VALLADOLID', 'code' : 'VALLADOLID'},
	{'name' : 'VIZCAYA', 'code' : 'VIZCAYA'},
	{'name' : 'ZAMORA', 'code' : 'ZAMORA'},
	{'name' : 'ZARAGOZA', 'code' : 'ZARAGOZA'}
]},
{'country' : 'Sri Lanka', 'states' : []},
{'country' : 'Sudan', 'states' : []},
{'country' : 'Suriname', 'states' : []},
{'country' : 'Svalbard and Jan Mayen', 'states' : []},
{'country' : 'Swaziland', 'states' : []},
{'country' : 'Sweden', 'states' : []},
{'country' : 'Switzerland', 'states' : []},
{'country' : 'Syrian Arab Republic', 'states' : []},
{'country' : 'Taiwan, Province of China', 'states' : []},
{'country' : 'Tajikistan', 'states' : []},
{'country' : 'Tanzania, United Republic of', 'states' : []},
{'country' : 'Thailand', 'states' : []},
{'country' : 'Timor-Leste', 'states' : []},
{'country' : 'Togo', 'states' : []},
{'country' : 'Tokelau', 'states' : []},
{'country' : 'Tonga', 'states' : []},
{'country' : 'Trinidad and Tobago', 'states' : []},
{'country' : 'Tunisia', 'states' : []},
{'country' : 'Turkey', 'states' : [
	{'name' : 'ADANA', 'code' : 'ADANA'},
	{'name' : 'ADIYAMAN', 'code' : 'ADIYAMAN'},
	{'name' : 'AFYONKARAHISAR', 'code' : 'AFYONKARAHISAR'},
	{'name' : 'AGRI', 'code' : 'AGRI'},
	{'name' : 'AKSARAY', 'code' : 'AKSARAY'},
	{'name' : 'AMASYA', 'code' : 'AMASYA'},
	{'name' : 'ANKARA', 'code' : 'ANKARA'},
	{'name' : 'ANTALYA', 'code' : 'ANTALYA'},
	{'name' : 'ARDAHAN', 'code' : 'ARDAHAN'},
	{'name' : 'ARTVIN', 'code' : 'ARTVIN'},
	{'name' : 'AYDIN', 'code' : 'AYDIN'},
	{'name' : 'BALIKESIR', 'code' : 'BALIKESIR'},
	{'name' : 'BARTIN', 'code' : 'BARTIN'},
	{'name' : 'BATMAN', 'code' : 'BATMAN'},
	{'name' : 'BAYBURT', 'code' : 'BAYBURT'},
	{'name' : 'BILECIK', 'code' : 'BILECIK'},
	{'name' : 'BINGOL', 'code' : 'BINGOL'},
	{'name' : 'BITLIS', 'code' : 'BITLIS'},
	{'name' : 'BOLU', 'code' : 'BOLU'},
	{'name' : 'BURDUR', 'code' : 'BURDUR'},
	{'name' : 'BURSA', 'code' : 'BURSA'},
	{'name' : 'CANAKKALE', 'code' : 'CANAKKALE'},
	{'name' : 'CANKIRI', 'code' : 'CANKIRI'},
	{'name' : 'CORUM', 'code' : 'CORUM'},
	{'name' : 'DENIZLI', 'code' : 'DENIZLI'},
	{'name' : 'DIYARBAKIR', 'code' : 'DIYARBAKIR'},
	{'name' : 'DUZCE', 'code' : 'DUZCE'},
	{'name' : 'EDIRNE', 'code' : 'EDIRNE'},
	{'name' : 'ELAZIG', 'code' : 'ELAZIG'},
	{'name' : 'ERZINCAN', 'code' : 'ERZINCAN'},
	{'name' : 'ERZURUM', 'code' : 'ERZURUM'},
	{'name' : 'ESKISEHIR', 'code' : 'ESKISEHIR'},
	{'name' : 'GAZIANTEP', 'code' : 'GAZIANTEP'},
	{'name' : 'GIRESUN', 'code' : 'GIRESUN'},
	{'name' : 'GUMUSHANE', 'code' : 'GUMUSHANE'},
	{'name' : 'HAKKARI', 'code' : 'HAKKARI'},
	{'name' : 'HATAY', 'code' : 'HATAY'},
	{'name' : 'IGDIR', 'code' : 'IGDIR'},
	{'name' : 'ISPARTA', 'code' : 'ISPARTA'},
	{'name' : 'ISTANBUL', 'code' : 'ISTANBUL'},
	{'name' : 'IZMIR', 'code' : 'IZMIR'},
	{'name' : 'KAHRAMANMARAS', 'code' : 'KAHRAMANMARAS'},
	{'name' : 'KARABUK', 'code' : 'KARABUK'},
	{'name' : 'KARAMAN', 'code' : 'KARAMAN'},
	{'name' : 'KARS', 'code' : 'KARS'},
	{'name' : 'KASTAMONU', 'code' : 'KASTAMONU'},
	{'name' : 'KAYSERI', 'code' : 'KAYSERI'},
	{'name' : 'KILIS', 'code' : 'KILIS'},
	{'name' : 'KIRIKKALE', 'code' : 'KIRIKKALE'},
	{'name' : 'KIRKLARELI', 'code' : 'KIRKLARELI'},
	{'name' : 'KIRSEHIR', 'code' : 'KIRSEHIR'},
	{'name' : 'KOCAELI', 'code' : 'KOCAELI'},
	{'name' : 'KONYA', 'code' : 'KONYA'},
	{'name' : 'KUTAHYA', 'code' : 'KUTAHYA'},
	{'name' : 'MALATYA', 'code' : 'MALATYA'},
	{'name' : 'MANISA', 'code' : 'MANISA'},
	{'name' : 'MARDIN', 'code' : 'MARDIN'},
	{'name' : 'MERSIN', 'code' : 'MERSIN'},
	{'name' : 'MUGLA', 'code' : 'MUGLA'},
	{'name' : 'MUS', 'code' : 'MUS'},
	{'name' : 'NEVSEHIR', 'code' : 'NEVSEHIR'},
	{'name' : 'NIGDE', 'code' : 'NIGDE'},
	{'name' : 'ORDU', 'code' : 'ORDU'},
	{'name' : 'OSMANIYE', 'code' : 'OSMANIYE'},
	{'name' : 'RIZE', 'code' : 'RIZE'},
	{'name' : 'SAKARYA', 'code' : 'SAKARYA'},
	{'name' : 'SAMSUN', 'code' : 'SAMSUN'},
	{'name' : 'SANLIURFA', 'code' : 'SANLIURFA'},
	{'name' : 'SIIRT', 'code' : 'SIIRT'},
	{'name' : 'SINOP', 'code' : 'SINOP'},
	{'name' : 'SIRNAK', 'code' : 'SIRNAK'},
	{'name' : 'SIVAS', 'code' : 'SIVAS'},
	{'name' : 'TEKIRDAG', 'code' : 'TEKIRDAG'},
	{'name' : 'TOKAT', 'code' : 'TOKAT'},
	{'name' : 'TRABZON', 'code' : 'TRABZON'},
	{'name' : 'TUNCELI', 'code' : 'TUNCELI'},
	{'name' : 'USAK', 'code' : 'USAK'},
	{'name' : 'VAN', 'code' : 'VAN'},
	{'name' : 'YALOVA', 'code' : 'YALOVA'},
	{'name' : 'YOZGAT', 'code' : 'YOZGAT'},
	{'name' : 'ZONGULDAK', 'code' : 'ZONGULDAK'}
]},
{'country' : 'Turkmenistan', 'states' : []},
{'country' : 'Turks and Caicos Islands', 'states' : []},
{'country' : 'Tuvalu', 'states' : []},
{'country' : 'Uganda', 'states' : []},
{'country' : 'Ukraine', 'states' : []},
{'country' : 'United Arab Emirates', 'states' : []},
{'country' : 'United Kingdom', 'states' : []},
{'country' : 'United States', 'states' : [
	{'name' : 'Alabama', 'code' : 'AL'},
	{'name' : 'Alaska', 'code' : 'AK'},
	{'name' : 'Arizona', 'code' : 'AZ'},
	{'name' : 'Arkansas', 'code' : 'AR'},
	{'name' : 'California', 'code' : 'CA'},
	{'name' : 'Colorado', 'code' : 'CO'},
	{'name' : 'Connecticut', 'code' : 'CT'},
	{'name' : 'Delaware', 'code' : 'DE'},
	{'name' : 'District of Columbia', 'code' : 'DC'},
	{'name' : 'Florida', 'code' : 'FL'},
	{'name' : 'Georgia', 'code' : 'GA'},
	{'name' : 'Hawaii', 'code' : 'HI'},
	{'name' : 'Idaho', 'code' : 'ID'},
	{'name' : 'Illinois', 'code' : 'IL'},
	{'name' : 'Indiana', 'code' : 'IN'},
	{'name' : 'Iowa', 'code' : 'IA'},
	{'name' : 'Kansas', 'code' : 'KS'},
	{'name' : 'Kentucky', 'code' : 'KY'},
	{'name' : 'Louisiana', 'code' : 'LA'},
	{'name' : 'Maine', 'code' : 'ME'},
	{'name' : 'Maryland', 'code' : 'MD'},
	{'name' : 'Massachusetts', 'code' : 'MA'},
	{'name' : 'Michigan', 'code' : 'MI'},
	{'name' : 'Minnesota', 'code' : 'MN'},
	{'name' : 'Mississippi', 'code' : 'MS'},
	{'name' : 'Missouri', 'code' : 'MO'},
	{'name' : 'Montana', 'code' : 'MT'},
	{'name' : 'Nebraska', 'code' : 'NE'},
	{'name' : 'Nevada', 'code' : 'NV'},
	{'name' : 'New Hampshire', 'code' : 'NH'},
	{'name' : 'New Jersey', 'code' : 'NJ'},
	{'name' : 'New Mexico', 'code' : 'NM'},
	{'name' : 'New York', 'code' : 'NY'},
	{'name' : 'North Carolina', 'code' : 'NC'},
	{'name' : 'North Dakota', 'code' : 'ND'},
	{'name' : 'Ohio', 'code' : 'OH'},
	{'name' : 'Oklahoma', 'code' : 'OK'},
	{'name' : 'Oregon', 'code' : 'OR'},
	{'name' : 'Pennsylvania', 'code' : 'PA'},
	{'name' : 'Rhode Island', 'code' : 'RI'},
	{'name' : 'South Carolina', 'code' : 'SC'},
	{'name' : 'South Dakota', 'code' : 'SD'},
	{'name' : 'Tennessee', 'code' : 'TN'},
	{'name' : 'Texas', 'code' : 'TX'},
	{'name' : 'Utah', 'code' : 'UT'},
	{'name' : 'Vermont', 'code' : 'VT'},
	{'name' : 'Virginia', 'code' : 'VA'},
	{'name' : 'Washington', 'code' : 'WA'},
	{'name' : 'West Virginia', 'code' : 'WV'},
	{'name' : 'Wisconsin', 'code' : 'WI'},
	{'name' : 'Wyoming', 'code' : 'WY'},
	{'name' : 'U.S. Armed Forces â€“ Americas', 'code' : 'AA'},
	{'name' : 'U.S. Armed Forces â€“ Europe', 'code' : 'AE'},
	{'name' : 'U.S. Armed Forces â€“ Pacific', 'code' : 'AP'}
]},
{'country' : 'United States Minor Outlying Islands', 'states' : []},
{'country' : 'Uruguay', 'states' : []},
{'country' : 'Uzbekistan', 'states' : []},
{'country' : 'Vanuatu', 'states' : []},
{'country' : 'Venezuela, Bolivarian Republic of', 'states' : []},
{'country' : 'Viet Nam', 'states' : []},
{'country' : 'Virgin Islands, British', 'states' : []},
{'country' : 'Virgin Islands, U.S.', 'states' : []},
{'country' : 'Wallis and Futuna', 'states' : []},
{'country' : 'Western Sahara', 'states' : []},
{'country' : 'Yemen', 'states' : []},
{'country' : 'Zambia', 'states' : []},
{'country' : 'Zimbabwe', 'states' : []}
];

// Define JSON for market/submarket
var marketSubmarketList = [
{'market' : 'Academic', 'submarkets' : [
	'Associates College',
	'Bacc Associates College',
	'Bacc Colleges Liberal Arts',
	'Baccalaureate Colleges General',
	'Doct Research Univ Extensive',
	'Doct Research Univ Intensive',
	'Further Education',
	'Hospital or Medical Center',
	'Legal (In-house)',
	'Masters Colleges and Univ I',
	'Masters Colleges and Univ II',
	'Medical Schools',
	'Non-PHD Granting',
	'Other Health Profession School',
	'Other Specialized Institutions',
	'PHD Granting',
	'School of Art & Music & Design',
	'Schools of Business & Mgmt',
	'Schools of Engineering & Tech',
	'Schools of Law',
	'Teachers College',
	'Theol & Other Faith Seminaries',
	'Unclassified'
]},
{'market' : 'Consortia', 'submarkets' : [
	'Academic',
	'Government',
	'Schools',
	'Mixed Market',
	'Public Library'
]},
{'market' : 'Corporate', 'submarkets' : [
	'Administrative Services',
	'Agriculture & Forestry',
	'Air Transportation',
	'Arts, Entertainment & Recreation',
	'Biomedical',
	'Biotechnology',
	'Bookstore',
	'Chemical Manufacturing',
	'Construction',
	'Distributor',
	'Educational Services',
	'Financial Services',
	'Food Processing',
	'Genealogy',
	'Health',
	'Hospital or Medical Center',
	'Legal (In-house)',
	'Insurance',
	'Legal Services/Law Firms',
	'Management Services',
	'Manufacturing',
	'Metal Mining',
	'Mining',
	'Motor Vehicle Manufacturing',
	'Museums, Histl Sites & Similar Inst',
	'Other Information Services',
	'Personal & Household Products',
	'Petroleum Industry',
	'Pharmaceutical',
	'Professional Services',
	'Publishing',
	'Real Estate',
	'Religious, Grantmaking, Civic & Similar Orgs',
	'Research Services',
	'Retail Trade - Not Bookstore',
	'Social Assistance',
	'Space Research & Technology',
	'Transportation & Warehousing',
	'Unclassified',
	'Utilities',
	'Wholesale Trade'
]},
{'market' : 'Government', 'submarkets' : [
	'Academic',
	'Academic - Tribal',
	'Central/Federal',
	'Social Health Service',
	'Hospital or Medical Center',
	'Legal Services/Law',
	'Museums, Historical Sites & Similar Inst',
	'National Library',
	'Local',
	'State/Provincial',
	'Schools',
	'Embassy/USIS/USIA',
	'Military',
	'Unclassified'
]},
{'market' : 'Individual', 'submarkets' : [
	'Academic - Faculty',
	'Academic - Student',
	'Non-Academic'
]},
{'market' : 'Non-profit Corporation', 'submarkets' : [
	'Arts, Entertainment & Recreation',
	'Environmental / Natural Science',
	'Financial Services',
	'Hospital or Other Health',
	'Legal Services/Law',
	'Museums, Historical Sites & Similar Inst',
	'Publishing',
	'Religious, Grantmaking, Civic & Similar Orgs',
	'Research Institution / Think Tank',
	'Social Service',
	'Trade Union / Professional Organization',
	'Unclassified'
]},
{'market' : 'Public Library', 'submarkets' : [
	'Branch',
	'Main',
	'National',
	'Other',
	'State',
	'System'
]},
{'market' : 'Schools', 'submarkets' : [
	'Combined School - Private',
	'Combined School - Public',
	'Elementary School - Private',
	'Elementary School - Public',
	'High School - Private',
	'High School - Public',
	'Middle School - Private',
	'Middle School - Public',
	'School District',
	'Primary',
	'Secondary',
	'International Baccalaureate',
	'Unclassified'
]}
];
