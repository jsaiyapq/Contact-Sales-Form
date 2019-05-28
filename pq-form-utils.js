/* ########################################  PQ Form Utils  ########################################
@title   ProQuest Form Utilities
@author  Jim Saiya
@date    2019-05-28

   A $(document).ready() JQuery function must be added to the JavaScript on the form .html page.

   $(document).ready(function(e) {
     initFormUtils([form id],[default focus element id],[email element id],[country element id],[state/province element id],
      [market element id],[sub-market element id],[job function element id],[other job function element id]);
   });

   EXAMPLE - change these values to match your field ids:
     initFormUtils('pq-contact', 'firstname', 'email', 'country', 'state_province', 'market', 'submarket', 'job_function', 'job_function_other');

   ################################################################################################# */


// *** LEGACY *** Function to initialize utilities
//  This will to be called by deployed Landing Pages that were based on the Base LP Templates
//  New forms will call initFormUtils() (below) instead
function startFormUtils(sfuForm, sfuCountry, sfuStateprov, sfuMarket, sfuSubmarket, sfuEmail, sfuDefaultField) {

	checkMarketSubmarket('init', sfuMarket, sfuSubmarket);
	$('#'+sfuMarket).change(function(e) {
		checkMarketSubmarket('change', sfuMarket, sfuSubmarket);
	});

	checkCountryState('init', sfuCountry, sfuStateprov);
	$('#'+sfuCountry).change(function(e) {
		checkCountryState('change', sfuCountry, sfuStateprov);
	});

	if ( $('[name="RECIPIENT_ID_*"]').length ) {  // there is a cookie for this page

		if ( !$('#'+sfuSubmarket).val() ) {
			console.error('Browser form error. '+sfuSubmarket+' field is empty.');
		}

		// Bind clearIdentity() function to all links that clear the form
		$('.clear-identity-action').click(function(e) {
			e.preventDefault();						// don`t reload the page
			checkCountryState('init', sfuCountry, sfuStateprov);		// reset the State/Province field if needed
		});

	}

}


// Function to initialize utilities
//  Call this from within a $(document).ready() JQuery function on the form page
function initFormUtils(sfuForm, sfuDefaultField, sfuEmail, sfuCountry, sfuStateprov, sfuMarket, sfuSubmarket, sfuJobFunc, sfuOtherJobFunc) {

	checkJobFunction('init', sfuJobFunc, sfuOtherJobFunc);
	$('#'+sfuJobFunc).change(function(e) {
		checkJobFunction('change', sfuJobFunc, sfuOtherJobFunc);
	});

	checkMarketSubmarket('init', sfuMarket, sfuSubmarket);
	$('#'+sfuMarket).change(function(e) {
		checkMarketSubmarket('change', sfuMarket, sfuSubmarket);
	});

	checkCountryState('init', sfuCountry, sfuStateprov);
	$('#'+sfuCountry).change(function(e) {
		checkCountryState('change', sfuCountry, sfuStateprov);
	});

	if ( $('[name="RECIPIENT_ID_*"]').length ) {  // there is a cookie for this page

		// IE sometimes does not pull the data from some of the fields into JavaScript
		//  this happens about half the time
		//  so keep reloading the page until we get good data
		if ( !$('#'+sfuSubmarket).val() ) {
			console.error('Browser form error. '+sfuSubmarket+' field is empty.');
// Fix disabled due to conflicts with other form pages (creating records with missing fields)
//			console.error('Browser form error. Reloading page.');
//			location.reload(true);
		}

		initFormIdentityLink(sfuForm, sfuDefaultField, sfuEmail, sfuCountry, sfuStateprov, sfuJobFunc, sfuOtherJobFunc);

	}

}


// Function to initialize the identity clearing framework if applicable
function initFormIdentityLink(sfuForm, sfuDefaultField, sfuEmail, sfuCountry, sfuStateprov, sfuJobFunc, sfuOtherJobFunc) {

	// disable email field
	$('#'+sfuEmail).prop('disabled', 'disabled');

	// do not require validation on disabled fields
	$('#'+sfuEmail).removeProp('required');

	// enable email field before submitting form, otherwise value will not be sent
	$('#'+sfuForm).submit(function() {
		$('#'+sfuEmail).prop('disabled', false);
	});

	// Show the "Clear the form" prompt
	$('#clear-identity-prompt').show();
	// and because Firefox sometimes doesn`t make the prompt appear...
	$('#clear-identity-prompt').css('display', 'inline-block');

	// Bind clearUserIdentity() function to all links that clear the form
	$('.clear-identity-action').click(function(e) {
		e.preventDefault();						// don`t reload the page
		clearUserIdentity(sfuForm, sfuEmail);				// clear the form
		checkJobFunction('init', sfuJobFunc, sfuOtherJobFunc);		// reset the Other Job Function field
		checkCountryState('init', sfuCountry, sfuStateprov);		// reset the State/Province field if needed
		$('#'+sfuDefaultField).focus();					// focus on the default field for the form
	});

}


// Function to clear the contact form, including cookie and hidden recipient id field
function clearUserIdentity(sfuForm, sfuEmail) {

	// Clear the cookie
//	var remove_sp_identity = $.removeCookie('SP_IDENTITY');
//	var remove_sp_identity = $.removeCookie('SP_IDENTITY', { path: '/' });
	var remove_sp_identity = true;
console.log('Clearing identity...'); ////////////////////////////////

	// If cookie removal was successful, finish the job
	if ( remove_sp_identity ) {
		$('[name="RECIPIENT_ID_*"]').remove();				// remove the recipient id field
		$('#clear-identity-prompt').hide();				// remove the "Clear the form" prompt from above the form
		$('#'+sfuForm ).clearForm();					// reset the form (from jquery.form.js)
		$('#'+sfuEmail).prop('disabled', false);			// enable email field
		$('#'+sfuEmail).prop('required', 'required');			// require an email address
		$('#submit').prop('disabled', true);				// disable the Submit button since the Double OptIn checkbox is cleared
	}

}


// Function to get today`s date for filling out date fields
function getTodaysDateString() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) { dd = '0'+dd };
  if (mm < 10) { mm = '0'+mm };
  today = mm+'/'+dd+'/'+yyyy;

  return today;
}


// Function to check if the value of the "Job Function" field is "Other" and, if so, activate the "Other Job Function" field
function checkJobFunction(mode, sfuJobFunc, sfuOtherJobFunc) {

	// Remember selected job function
	var currentJobFunction = $('#'+sfuJobFunc).val();
console.log('Selected Job Function: ', currentJobFunction); ////////////////////////////////

	if ( currentJobFunction == 'Other' ) {

		$('#'+sfuOtherJobFunc).prop('disabled', false);		// enable other function field
		$('#'+sfuOtherJobFunc).prop('required', 'required');	// require other function value
		// clear any existing "required field" asterisk and add one
		$('#'+sfuOtherJobFunc).parent().find('label > span.parsley-required').remove();
		$('#'+sfuOtherJobFunc).parent().children('label').append('<span class="parsley-required"> *</span>');

		// If freshly selected, focus on "Other" field
		if ( mode == 'change' ) {
			$('#'+sfuOtherJobFunc).focus();
		}

	}
	else {  // The job function has been picked from the list

		// Clear "Other" field
		$('#'+sfuOtherJobFunc).val('');

		$('#'+sfuOtherJobFunc).prop('disabled', 'disabled');				// disable other function field
		$('#'+sfuOtherJobFunc).removeProp('required');					// do not require validation
		$('#'+sfuOtherJobFunc).parent().find('label > span.parsley-required').remove();	// remove asterisk
		$('#'+sfuOtherJobFunc).parsley().validate({force: true});			// remove any Parsley border

	}

}


// Function to check the value of the "Market" field and set the "Submarket" field accordingly
function checkMarketSubmarket(mode, sfuMarket, sfuSubmarket) {

	// Remember selected market
	var currentMarket = $('#'+sfuMarket).val();
console.log('Selected Market:     ', currentMarket); ////////////////////////////////

	// Remember selected submarket
	var currentSubmarket = $('#'+sfuSubmarket+' option:selected').val();
console.log('Selected Submarket:  ', currentSubmarket); ////////////////////////////////

	// Clear existing options from submarket dropdown
	$('#'+sfuSubmarket).empty();

	// Get the market and its submarkets from data structure
	var selectedMarket = marketSubmarketList.filter(function(marketSubmarket) { return marketSubmarket.market == currentMarket });

	if ( selectedMarket.length ) {  // the market was found

		// Build market`s submarket dropdown list
		var opt = new Option('', '');
		$('#'+sfuSubmarket).append(opt);
		$(selectedMarket[0].submarkets).each(function(index, submarket) {
			opt = new Option(submarket, submarket);
			$('#'+sfuSubmarket).append(opt);
		});

		// If this is initiating the form, select the existing submarket loaded from contact
		if ( mode == 'init' ) {
			$('#'+sfuSubmarket+' option').prop('selected', false);
			$('#'+sfuSubmarket+' option[value="'+currentSubmarket+'"]').prop('selected', 'selected');
			$('#'+sfuSubmarket).val(currentSubmarket);
		}

	}

}


// Function to check the value of the "Country" field and set the "State/Province" field accordingly
function checkCountryState(mode, sfuCountry, sfuStateprov) {

	// Remember selected country
	var currentCountry = $('#'+sfuCountry).val();
console.log('Selected Country:    ', currentCountry); ////////////////////////////////

	// Remember selected state/province
	var currentState = $('#'+sfuStateprov+' option:selected').val();
console.log('Selected State:      ', currentState); ////////////////////////////////

	// Clear existing options from state/province dropdown
	$('#'+sfuStateprov).empty();

	$('#'+sfuStateprov).prop('disabled', 'disabled');				// disable state/province field
	$('#'+sfuStateprov).removeProp('required');					// do not require validation
	$('#'+sfuStateprov).parent().find('label > span.parsley-required').remove();	// remove asterisk
	$('#'+sfuStateprov).parsley().validate({force: true});				// remove any Parsley border

	// Get the country and its states (or provinces) from data structure
	var selectedCountry = countryStateList.filter(function(countryState) { return countryState.country == currentCountry });

	if ( selectedCountry.length ) {  // the country was found
		if ( selectedCountry[0].states.length ) {  // this country has states or provinces

			// Build country`s state/province dropdown list
			var opt = new Option('', '');
			$('#'+sfuStateprov).append(opt);
			$(selectedCountry[0].states).each(function(index, state) {
				opt = new Option(state.name, state.code);
				$('#'+sfuStateprov).append(opt);
			});

			// If this is initiating the form, select the existing state or province loaded from contact
			if ( mode == 'init' ) {
				$('#'+sfuStateprov+' option').prop('selected', false);
				$('#'+sfuStateprov+' option[value="'+currentState+'"]').prop('selected', 'selected');
				$('#'+sfuStateprov).val(currentState);
			}

			$('#'+sfuStateprov).prop('disabled', false);			// enable state/province field
			$('#'+sfuStateprov).prop('required', 'required');		// require state/province value
			// clear any existing "required field" asterisk and add one
			$('#'+sfuStateprov).parent().find('label > span.parsley-required').remove();
			$('#'+sfuStateprov).parent().children('label').append('<span class="parsley-required"> *</span>');

		}
	}

}


// ###############################################################################################
// #######################################  DATA SECTION  ########################################

// ============ Markets and Submarkets ============
var marketSubmarketList = [
{market: 'Academic', submarkets: [
	'Associates College',
	'Baccalaureate Colleges General',
	'Bacc Associates College',
	'Bacc Colleges Liberal Arts',
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
{market: 'Consortia', submarkets: [
	'Academic',
	'Government',
	'Mixed Market',
	'Public Library',
	'Schools'
]},
{market: 'Corporate', submarkets: [
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
	'Historical Societies',
	'Hospital or Other Health',
	'Insurance',
	'Legal (In-house)',
	'Legal Services/Law Firms',
	'Management Services',
	'Manufacturing',
	'Metal Mining',
	'Mining',
	'Motor Vehicle Manufacturing',
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
{market: 'Government', submarkets: [
	'Academic',
	'Academic - Tribal',
	'Central/Federal',
	'Embassy/USIS/USIA',
	'Hospital or Medical Center',
	'Legal Services/Law',
	'Local',
	'Military',
	'Museums, Histl Sites & Similar Inst',
	'National Library',
	'Schools',
	'Social Health Service',
	'State/Provincial',
	'Unclassified'
]},
{market: 'Individual', submarkets: [
	'Academic - Faculty',
	'Academic - Student',
	'Non-Academic'
]},
{market: 'Non-profit Corporation', submarkets: [
	'Arts, Entertainment & Recreation',
	'Environmental / Natural Science',
	'Financial Services',
	'Hospital or Other Health',
	'Legal Services/Law',
	'Museums, Histl Sites & Similar Inst',
	'Publishing',
	'Religious, Grantmaking, Civic & Similar Orgs',
	'Research Institution / Think Tank',
	'Social Service',
	'Trade Union / Professional Organization',
	'Unclassified'
]},
{market: 'Public Library', submarkets: [
	'Branch',
	'Main',
	'National',
	'Other',
	'State',
	'System'
]},
{market: 'Schools', submarkets: [
	'Combined School - Private',
	'Combined School - Public',
	'Elementary School - Private',
	'Elementary School - Public',
	'High School - Private',
	'High School - Public',
	'International Baccalaureate',
	'Middle School - Private',
	'Middle School - Public',
	'Primary',
	'School District',
	'Secondary',
	'Unclassified'
]}
];

// ============ Countries and States ============
var countryStateList = [
{country: 'Afghanistan', states: []},
{country: 'Aland Islands', states: []},
{country: 'Albania', states: []},
{country: 'Algeria', states: []},
{country: 'American Samoa', states: []},
{country: 'Andorra', states: []},
{country: 'Angola', states: []},
{country: 'Anguilla', states: []},
{country: 'Antarctica', states: []},
{country: 'Antigua and Barbuda', states: []},
{country: 'Argentina', states: []},
{country: 'Armenia', states: []},
{country: 'Aruba', states: []},
{country: 'Australia', states: [
	{name: 'Australian Capital Territory', code: 'ACT'},
	{name: 'New South Wales', code: 'NSW'},
	{name: 'Northern Territory', code: 'NT'},
	{name: 'Queensland', code: 'QLD'},
	{name: 'South Australia', code: 'SA'},
	{name: 'Tasmania', code: 'TAS'},
	{name: 'Victoria', code: 'VIC'},
	{name: 'Western Australia', code: 'WA'}
]},
{country: 'Austria', states: []},
{country: 'Azerbaijan', states: []},
{country: 'Bahamas', states: []},
{country: 'Bahrain', states: []},
{country: 'Bangladesh', states: []},
{country: 'Barbados', states: []},
{country: 'Belarus', states: []},
{country: 'Belgium', states: []},
{country: 'Belize', states: []},
{country: 'Benin', states: []},
{country: 'Bermuda', states: []},
{country: 'Bhutan', states: []},
{country: 'Bolivia, Plurinational State of', states: []},
{country: 'Bonaire, Sint Eustatius and Saba', states: []},
{country: 'Bosnia and Herzegovina', states: []},
{country: 'Botswana', states: []},
{country: 'Bouvet Island', states: []},
{country: 'Brazil', states: [
	{name: 'Acre', code: 'AC'},
	{name: 'Alagoas', code: 'AL'},
	{name: 'Amapá', code: 'AP'},
	{name: 'Amazonas', code: 'AM'},
	{name: 'Bahia', code: 'BA'},
	{name: 'Ceará', code: 'CE'},
	{name: 'Distrito Federal', code: 'DF'},
	{name: 'Espírito Santo', code: 'ES'},
	{name: 'Goiás', code: 'GO'},
	{name: 'Maranhão', code: 'MA'},
	{name: 'Mato Grosso', code: 'MT'},
	{name: 'Mato Grosso do Sul', code: 'MS'},
	{name: 'Minas Gerais', code: 'MG'},
	{name: 'Pará', code: 'PA'},
	{name: 'Paraíba', code: 'PB'},
	{name: 'Paraná', code: 'PR'},
	{name: 'Pernambuco', code: 'PE'},
	{name: 'Piauí', code: 'PI'},
	{name: 'Rio de Janeiro', code: 'RJ'},
	{name: 'Rio Grande do Norte', code: 'RN'},
	{name: 'Rio Grande do Sul', code: 'RS'},
	{name: 'Rondônia', code: 'RO'},
	{name: 'Roraima', code: 'RR'},
	{name: 'Santa Catarina', code: 'SC'},
	{name: 'São Paulo', code: 'SP'},
	{name: 'Sergipe', code: 'SE'},
	{name: 'Tocantins', code: 'TO'}
]},
{country: 'British Indian Ocean Territory', states: []},
{country: 'Brunei Darussalam', states: []},
{country: 'Bulgaria', states: []},
{country: 'Burkina Faso', states: []},
{country: 'Burundi', states: []},
{country: 'Cambodia', states: []},
{country: 'Cameroon', states: []},
{country: 'Canada', states: [
	{name: 'Alberta', code: 'AB'},
	{name: 'British Columbia', code: 'BC'},
	{name: 'Manitoba', code: 'MB'},
	{name: 'New Brunswick', code: 'NB'},
	{name: 'Newfoundland and Labrador', code: 'NL'},
	{name: 'Nova Scotia', code: 'NS'},
	{name: 'Northwest Territories', code: 'NT'},
	{name: 'Nunavut', code: 'NU'},
	{name: 'Ontario', code: 'ON'},
	{name: 'Prince Edward Island', code: 'PE'},
	{name: 'Quebec', code: 'QC'},
	{name: 'Saskatchewan', code: 'SK'},
	{name: 'Yukon', code: 'YT'}
]},
{country: 'Cape Verde', states: []},
{country: 'Cayman Islands', states: []},
{country: 'Central African Republic', states: []},
{country: 'Chad', states: []},
{country: 'Chile', states: []},
{country: 'China', states: [
	{name: 'Anhui Province', code: 'AH'},
	{name: 'Beijing Municipality', code: 'BJ'},
	{name: 'Chongqing Municipality', code: 'CQ'},
	{name: 'Fujian Province', code: 'FJ'},
	{name: 'Gansu Province', code: 'GS'},
	{name: 'Guangdong Province', code: 'GD'},
	{name: 'Guangxi Zhuang Autonomous Region', code: 'GX'},
	{name: 'Guizhou Province', code: 'GZ'},
	{name: 'Hainan Province', code: 'HI'},
	{name: 'Hebei Province', code: 'HE'},
	{name: 'Heilongjiang Province', code: 'HL'},
	{name: 'Henan Province', code: 'HA'},
	{name: 'Hong Kong Special Administrative Region', code: 'HK'},
	{name: 'Hubei Province', code: 'HB'},
	{name: 'Hunan Province', code: 'HN'},
	{name: 'Inner Mongolia Autonomous Region', code: 'NM'},
	{name: 'Jiangsu Province', code: 'JS'},
	{name: 'Jiangxi Province', code: 'JX'},
	{name: 'Jilin Province', code: 'JL'},
	{name: 'Liaoning Province', code: 'LN'},
	{name: 'Macau Special Administrative Region', code: 'MC'},
	{name: 'Ningxia Hui Autonomous Region', code: 'NX'},
	{name: 'Qinghai Province', code: 'QH'},
	{name: 'Shaanxi Province', code: 'SN'},
	{name: 'Shandong Province', code: 'SD'},
	{name: 'Shanghai Municipality', code: 'SH'},
	{name: 'Shanxi Province', code: 'SX'},
	{name: 'Sichuan Province', code: 'SC'},
	{name: 'Taiwan Province', code: 'TW'},
	{name: 'Tianjin Municipality', code: 'TJ'},
	{name: 'Tibet Autonomous Region', code: 'XZ'},
	{name: 'Xinjiang Uyghur Autonomous Region', code: 'XJ'},
	{name: 'Yunnan Province', code: 'YN'},
	{name: 'Zhejiang Province', code: 'ZJ'}
]},
{country: 'Christmas Island', states: []},
{country: 'Cocos (Keeling) Islands', states: []},
{country: 'Colombia', states: []},
{country: 'Comoros', states: []},
{country: 'Congo', states: []},
{country: 'Congo, The Democratic Republic of the', states: []},
{country: 'Cook Islands', states: []},
{country: 'Costa Rica', states: []},
{country: 'Cote d\'Ivoire', states: []},
{country: 'Croatia', states: []},
{country: 'Cuba', states: []},
{country: 'Curacao', states: []},
{country: 'Cyprus', states: []},
{country: 'Czech Republic', states: []},
{country: 'Denmark', states: []},
{country: 'Djibouti', states: []},
{country: 'Dominica', states: []},
{country: 'Dominican Republic', states: []},
{country: 'Ecuador', states: []},
{country: 'Egypt', states: []},
{country: 'El Salvador', states: []},
{country: 'Equatorial Guinea', states: []},
{country: 'Eritrea', states: []},
{country: 'Estonia', states: []},
{country: 'Ethiopia', states: []},
{country: 'Falkland Islands (Malvinas)', states: []},
{country: 'Faroe Islands', states: []},
{country: 'Fiji', states: []},
{country: 'Finland', states: []},
{country: 'France', states: [
	{name: 'Ain', code: 'Ain'},
	{name: 'Aisne', code: 'Aisne'},
	{name: 'Allier', code: 'Allier'},
	{name: 'Alpes-de-Haute-Provence', code: 'Alpes-de-Haute-Provence'},
	{name: 'Alpes-Maritimes', code: 'Alpes-Maritimes'},
	{name: 'Ardèche', code: 'Ardèche'},
	{name: 'Ardennes', code: 'Ardennes'},
	{name: 'Ariège', code: 'Ariège'},
	{name: 'Aube', code: 'Aube'},
	{name: 'Aude', code: 'Aude'},
	{name: 'Aveyron', code: 'Aveyron'},
	{name: 'Bas-Rhin', code: 'Bas-Rhin'},
	{name: 'Bouches-du-Rhône', code: 'Bouches-du-Rhône'},
	{name: 'Calvados', code: 'Calvados'},
	{name: 'Cantal', code: 'Cantal'},
	{name: 'Charente', code: 'Charente'},
	{name: 'Charente-Maritime', code: 'Charente-Maritime'},
	{name: 'Cher', code: 'Cher'},
	{name: 'Corrèze', code: 'Corrèze'},
	{name: 'Corse-du-Sud', code: 'Corse-du-Sud'},
	{name: 'Côte-d\'Or', code: 'Côte-d\'Or'},
	{name: 'Côtes-d\'Armor', code: 'Côtes-d\'Armor'},
	{name: 'Creuse', code: 'Creuse'},
	{name: 'Deux-Sèvres', code: 'Deux-Sèvres'},
	{name: 'Dordogne', code: 'Dordogne'},
	{name: 'Doubs', code: 'Doubs'},
	{name: 'Drôme', code: 'Drôme'},
	{name: 'Essonne', code: 'Essonne'},
	{name: 'Eure', code: 'Eure'},
	{name: 'Eure-et-Loir', code: 'Eure-et-Loir'},
	{name: 'Finistère', code: 'Finistère'},
	{name: 'Gard', code: 'Gard'},
	{name: 'Gers', code: 'Gers'},
	{name: 'Gironde', code: 'Gironde'},
	{name: 'Guadeloupe', code: 'Guadeloupe'},
	{name: 'Guyane', code: 'Guyane'},
	{name: 'Haute-Corse ', code: 'Haute-Corse '},
	{name: 'Haute-Garonne', code: 'Haute-Garonne'},
	{name: 'Haute-Loire', code: 'Haute-Loire'},
	{name: 'Haute-Marne', code: 'Haute-Marne'},
	{name: 'Hautes-Alpes', code: 'Hautes-Alpes'},
	{name: 'Haute-Saône', code: 'Haute-Saône'},
	{name: 'Haute-Savoie', code: 'Haute-Savoie'},
	{name: 'Hautes-Pyrénées', code: 'Hautes-Pyrénées'},
	{name: 'Haute-Vienne', code: 'Haute-Vienne'},
	{name: 'Haut-Rhin', code: 'Haut-Rhin'},
	{name: 'Hauts-de-Seine', code: 'Hauts-de-Seine'},
	{name: 'Hérault', code: 'Hérault'},
	{name: 'Ille-et-Vilaine', code: 'Ille-et-Vilaine'},
	{name: 'Indre', code: 'Indre'},
	{name: 'Indre-et-Loire', code: 'Indre-et-Loire'},
	{name: 'Isère', code: 'Isère'},
	{name: 'Jura', code: 'Jura'},
	{name: 'Landes', code: 'Landes'},
	{name: 'Loire', code: 'Loire'},
	{name: 'Loire-Atlantique', code: 'Loire-Atlantique'},
	{name: 'Loiret', code: 'Loiret'},
	{name: 'Loir-et-Cher', code: 'Loir-et-Cher'},
	{name: 'Lot', code: 'Lot'},
	{name: 'Lot-et-Garonne', code: 'Lot-et-Garonne'},
	{name: 'Lozère', code: 'Lozère'},
	{name: 'Maine-et-Loire', code: 'Maine-et-Loire'},
	{name: 'Manche', code: 'Manche'},
	{name: 'Marne', code: 'Marne'},
	{name: 'Martinique', code: 'Martinique'},
	{name: 'Mayenne', code: 'Mayenne'},
	{name: 'Meurthe-et-Moselle', code: 'Meurthe-et-Moselle'},
	{name: 'Meuse', code: 'Meuse'},
	{name: 'Morbihan', code: 'Morbihan'},
	{name: 'Moselle', code: 'Moselle'},
	{name: 'Nièvre', code: 'Nièvre'},
	{name: 'Nord', code: 'Nord'},
	{name: 'Oise', code: 'Oise'},
	{name: 'Orne', code: 'Orne'},
	{name: 'Paris', code: 'Paris'},
	{name: 'Pas-de-Calais', code: 'Pas-de-Calais'},
	{name: 'Puy-de-Dôme', code: 'Puy-de-Dôme'},
	{name: 'Pyrénées-Atlantiques', code: 'Pyrénées-Atlantiques'},
	{name: 'Pyrénées-Orientales', code: 'Pyrénées-Orientales'},
	{name: 'Rhône', code: 'Rhône'},
	{name: 'Saône-et-Loire', code: 'Saône-et-Loire'},
	{name: 'Sarthe', code: 'Sarthe'},
	{name: 'Savoie', code: 'Savoie'},
	{name: 'Seine-et-Marne', code: 'Seine-et-Marne'},
	{name: 'Seine-Maritime', code: 'Seine-Maritime'},
	{name: 'Seine-Saint-Denis', code: 'Seine-Saint-Denis'},
	{name: 'Somme', code: 'Somme'},
	{name: 'Tarn', code: 'Tarn'},
	{name: 'Tarn-et-Garonne', code: 'Tarn-et-Garonne'},
	{name: 'Territoire de Belfort', code: 'Territoire de Belfort'},
	{name: 'Val-de-Marne', code: 'Val-de-Marne'},
	{name: 'Val-d\'Oise', code: 'Val-d\'Oise'},
	{name: 'Var', code: 'Var'},
	{name: 'Vaucluse', code: 'Vaucluse'},
	{name: 'Vendée', code: 'Vendée'},
	{name: 'Vienne', code: 'Vienne'},
	{name: 'Vosges', code: 'Vosges'},
	{name: 'Yonne', code: 'Yonne'},
	{name: 'Yvelines', code: 'Yvelines'},
]},
{country: 'French Guiana', states: []},
{country: 'French Polynesia', states: []},
{country: 'French Southern Territories', states: []},
{country: 'Gabon', states: []},
{country: 'Gambia', states: []},
{country: 'Georgia', states: []},
{country: 'Germany', states: [
	{name: 'Baden-Württemberg', code: 'Baden-Württemberg'},
	{name: 'Bavaria', code: 'Bavaria'},
	{name: 'Berlin', code: 'Berlin'},
	{name: 'Brandenburg', code: 'Brandenburg'},
	{name: 'Bremen', code: 'Bremen'},
	{name: 'Hamburg', code: 'Hamburg'},
	{name: 'Hessen', code: 'Hessen'},
	{name: 'Lower Saxony', code: 'Lower Saxony'},
	{name: 'Mecklenburg-Western Pomerania', code: 'Mecklenburg-Western Pomerania'},
	{name: 'North Rhine-Westphalia', code: 'North Rhine-Westphalia'},
	{name: 'Rhineland-Palatinate', code: 'Rhineland-Palatinate'},
	{name: 'Saarland', code: 'Saarland'},
	{name: 'Saxony', code: 'Saxony'},
	{name: 'Saxony-Anhalt', code: 'Saxony-Anhalt'},
	{name: 'Schleswig-Holstein', code: 'Schleswig-Holstein'},
	{name: 'Thuringia', code: 'Thuringia'},
]},
{country: 'Ghana', states: []},
{country: 'Gibraltar', states: []},
{country: 'Greece', states: []},
{country: 'Greenland', states: []},
{country: 'Grenada', states: []},
{country: 'Guadeloupe', states: []},
{country: 'Guam', states: []},
{country: 'Guatemala', states: []},
{country: 'Guernsey', states: []},
{country: 'Guinea', states: []},
{country: 'Guinea-Bissau', states: []},
{country: 'Guyana', states: []},
{country: 'Haiti', states: []},
{country: 'Heard Island and McDonald Islands', states: []},
{country: 'Holy See (Vatican City State)', states: []},
{country: 'Honduras', states: []},
{country: 'Hong Kong', states: []},
{country: 'Hungary', states: []},
{country: 'Iceland', states: []},
{country: 'India', states: [
	{name: 'Andaman and Nicobar Islands', code: 'AN'},
	{name: 'Andhra Pradesh', code: 'AP'},
	{name: 'Arunachal Pradesh', code: 'AR'},
	{name: 'Assam', code: 'AS'},
	{name: 'Bihar', code: 'BR'},
	{name: 'Chandigarh', code: 'CH'},
	{name: 'Chhattisgarh', code: 'CT'},
	{name: 'Dadra and Nagar Haveli', code: 'DN'},
	{name: 'Daman and Diu', code: 'DD'},
	{name: 'Delhi', code: 'DL'},
	{name: 'Goa', code: 'GA'},
	{name: 'Gujarat', code: 'GJ'},
	{name: 'Haryana', code: 'HR'},
	{name: 'Himachal Pradesh', code: 'HP'},
	{name: 'Jammu and Kashmir', code: 'JK'},
	{name: 'Jharkhand', code: 'JH'},
	{name: 'Karnataka', code: 'KA'},
	{name: 'Kerala', code: 'KL'},
	{name: 'Lakshadweep', code: 'LD'},
	{name: 'Madhya Pradesh', code: 'MP'},
	{name: 'Maharashtra', code: 'MH'},
	{name: 'Manipur', code: 'MN'},
	{name: 'Meghalaya', code: 'ML'},
	{name: 'Mizoram', code: 'MZ'},
	{name: 'Nagaland', code: 'NL'},
	{name: 'Odisha', code: 'OR'},
	{name: 'Puducherry', code: 'PY'},
	{name: 'Punjab', code: 'PB'},
	{name: 'Rajasthan', code: 'RJ'},
	{name: 'Sikkim', code: 'SK'},
	{name: 'Tamil Nadu', code: 'TN'},
	{name: 'Telangana', code: 'TG'},
	{name: 'Tripura', code: 'TR'},
	{name: 'Uttar Pradesh', code: 'UP'},
	{name: 'Uttarakhand', code: 'UT'},
	{name: 'West Bengal', code: 'WB'}
]},
{country: 'Indonesia', states: []},
{country: 'Iran, Islamic Republic of', states: []},
{country: 'Iraq', states: []},
{country: 'Ireland', states: []},
{country: 'Isle of Man', states: []},
{country: 'Israel', states: []},
{country: 'Italy', states: []},
{country: 'Jamaica', states: []},
{country: 'Japan', states: [
	{name: 'Aichi-ken', code: 'Aichi-ken'},
	{name: 'Akita-ken', code: 'Akita-ken'},
	{name: 'Aomori-ken', code: 'Aomori-ken'},
	{name: 'Chiba-ken', code: 'Chiba-ken'},
	{name: 'Ehime-ken', code: 'Ehime-ken'},
	{name: 'Fukui-ken', code: 'Fukui-ken'},
	{name: 'Fukuoka-ken', code: 'Fukuoka-ken'},
	{name: 'Fukushima', code: 'Fukushima'},
	{name: 'Gifu-ken', code: 'Gifu-ken'},
	{name: 'Gunma-ken', code: 'Gunma-ken'},
	{name: 'Hiroshima', code: 'Hiroshima'},
	{name: 'Hokkaidō', code: 'Hokkaidō'},
	{name: 'Hyogo-ken', code: 'Hyogo-ken'},
	{name: 'Ibaraki-ken', code: 'Ibaraki-ken'},
	{name: 'Ishikawa', code: 'Ishikawa'},
	{name: 'Iwate-ken', code: 'Iwate-ken'},
	{name: 'Kagawa-ken', code: 'Kagawa-ken'},
	{name: 'Kagoshima', code: 'Kagoshima'},
	{name: 'Kanagawa', code: 'Kanagawa'},
	{name: 'Kochi-ken', code: 'Kochi-ken'},
	{name: 'Kumamoto', code: 'Kumamoto'},
	{name: 'Kyoto-fu', code: 'Kyoto-fu'},
	{name: 'Mie-ken', code: 'Mie-ken'},
	{name: 'Miyagi-ken', code: 'Miyagi-ken'},
	{name: 'Miyazaki', code: 'Miyazaki'},
	{name: 'Nagano-ken', code: 'Nagano-ken'},
	{name: 'Nagasaki', code: 'Nagasaki'},
	{name: 'Nara-ken', code: 'Nara-ken'},
	{name: 'Niigata-ken', code: 'Niigata-ken'},
	{name: 'Oita-ken', code: 'Oita-ken'},
	{name: 'Okayama-ken', code: 'Okayama-ken'},
	{name: 'Okinawa-ken', code: 'Okinawa-ken'},
	{name: 'Osaka-fu', code: 'Osaka-fu'},
	{name: 'Saga-ken', code: 'Saga-ken'},
	{name: 'Saitama-ken', code: 'Saitama-ken'},
	{name: 'Shiga-ken', code: 'Shiga-ken'},
	{name: 'Shimane-ken', code: 'Shimane-ken'},
	{name: 'Shizuoka-ken', code: 'Shizuoka-ken'},
	{name: 'Tochigi-ken', code: 'Tochigi-ken'},
	{name: 'Tokushima-ken', code: 'Tokushima-ken'},
	{name: 'Tokyo-to', code: 'Tokyo-to'},
	{name: 'Tottori-ken', code: 'Tottori-ken'},
	{name: 'Toyama-ken', code: 'Toyama-ken'},
	{name: 'Wakayama-ken', code: 'Wakayama-ken'},
	{name: 'Yamagata-ken', code: 'Yamagata-ken'},
	{name: 'Yamaguchi-ken', code: 'Yamaguchi-ken'},
	{name: 'Yamanashi-ken', code: 'Yamanashi-ken'},
]},
{country: 'Jersey', states: []},
{country: 'Jordan', states: []},
{country: 'Kazakhstan', states: []},
{country: 'Kenya', states: []},
{country: 'Kiribati', states: []},
{country: 'Korea, Democratic People\'s Republic of', states: []},
{country: 'Korea, Republic of', states: []},
{country: 'Kuwait', states: []},
{country: 'Kyrgyzstan', states: []},
{country: 'Lao People\'s Democratic Republic', states: []},
{country: 'Latvia', states: []},
{country: 'Lebanon', states: []},
{country: 'Lesotho', states: []},
{country: 'Liberia', states: []},
{country: 'Libyan Arab Jamahiriya', states: []},
{country: 'Liechtenstein', states: []},
{country: 'Lithuania', states: []},
{country: 'Luxembourg', states: []},
{country: 'Macao', states: []},
{country: 'Macedonia, The Former Yugoslav Republic of', states: []},
{country: 'Madagascar', states: []},
{country: 'Malawi', states: []},
{country: 'Malaysia', states: []},
{country: 'Maldives', states: []},
{country: 'Mali', states: []},
{country: 'Malta', states: []},
{country: 'Marshall Islands', states: []},
{country: 'Martinique', states: []},
{country: 'Mauritania', states: []},
{country: 'Mauritius', states: []},
{country: 'Mayotte', states: []},
{country: 'Mexico', states: []},
{country: 'Micronesia, Federated States of', states: []},
{country: 'Moldova, Republic of', states: []},
{country: 'Monaco', states: []},
{country: 'Mongolia', states: []},
{country: 'Montenegro', states: []},
{country: 'Montserrat', states: []},
{country: 'Morocco', states: []},
{country: 'Mozambique', states: []},
{country: 'Myanmar', states: []},
{country: 'Namibia', states: []},
{country: 'Nauru', states: []},
{country: 'Nepal', states: []},
{country: 'Netherlands', states: []},
{country: 'New Caledonia', states: []},
{country: 'New Zealand', states: []},
{country: 'Nicaragua', states: []},
{country: 'Niger', states: []},
{country: 'Nigeria', states: []},
{country: 'Niue', states: []},
{country: 'Norfolk Island', states: []},
{country: 'Northern Mariana Islands', states: []},
{country: 'Norway', states: []},
{country: 'Occupied Palestinian Territory', states: []},
{country: 'Oman', states: []},
{country: 'Pakistan', states: []},
{country: 'Palau', states: []},
{country: 'Panama', states: []},
{country: 'Papua New Guinea', states: []},
{country: 'Paraguay', states: []},
{country: 'Peru', states: []},
{country: 'Philippines', states: []},
{country: 'Pitcairn', states: []},
{country: 'Poland', states: []},
{country: 'Portugal', states: []},
{country: 'Puerto Rico', states: []},
{country: 'Qatar', states: []},
{country: 'Reunion', states: []},
{country: 'Romania', states: []},
{country: 'Russian Federation', states: []},
{country: 'Rwanda', states: []},
{country: 'Saint Barthelemy', states: []},
{country: 'Saint Helena, Ascension and Tristan da Cunha', states: []},
{country: 'Saint Kitts and Nevis', states: []},
{country: 'Saint Lucia', states: []},
{country: 'Saint Martin (French part)', states: []},
{country: 'Saint Pierre and Miquelon', states: []},
{country: 'Saint Vincent and The Grenadines', states: []},
{country: 'Samoa', states: []},
{country: 'San Marino', states: []},
{country: 'Sao Tome and Principe', states: []},
{country: 'Saudi Arabia', states: []},
{country: 'Senegal', states: []},
{country: 'Serbia', states: []},
{country: 'Seychelles', states: []},
{country: 'Sierra Leone', states: []},
{country: 'Singapore', states: []},
{country: 'Sint Maarten (Dutch part)', states: []},
{country: 'Slovakia', states: []},
{country: 'Slovenia', states: []},
{country: 'Solomon Islands', states: []},
{country: 'Somalia', states: []},
{country: 'South Africa', states: []},
{country: 'South Georgia and the South Sandwich Islands', states: []},
{country: 'South Sudan', states: []},
{country: 'Spain', states: [
	{name: 'A Coruña', code: 'A Coruña'},
	{name: 'Álava', code: 'Álava'},
	{name: 'Albacete', code: 'Albacete'},
	{name: 'Alicante', code: 'Alicante'},
	{name: 'Almería', code: 'Almería'},
	{name: 'Asturias', code: 'Asturias'},
	{name: 'Ávila', code: 'Ávila'},
	{name: 'Badajoz', code: 'Badajoz'},
	{name: 'Balearic Islands', code: 'Balearic Islands'},
	{name: 'Barcelona', code: 'Barcelona'},
	{name: 'Biscay', code: 'Biscay'},
	{name: 'Burgos', code: 'Burgos'},
	{name: 'Cáceres', code: 'Cáceres'},
	{name: 'Cádiz', code: 'Cádiz'},
	{name: 'Cantabria', code: 'Cantabria'},
	{name: 'Castellón', code: 'Castellón'},
	{name: 'Ceuta', code: 'Ceuta'},
	{name: 'Ciudad Real', code: 'Ciudad Real'},
	{name: 'Córdoba', code: 'Córdoba'},
	{name: 'Cuenca', code: 'Cuenca'},
	{name: 'Girona', code: 'Girona'},
	{name: 'Granada', code: 'Granada'},
	{name: 'Guadalajara', code: 'Guadalajara'},
	{name: 'Guipúzcoa', code: 'Guipúzcoa'},
	{name: 'Huelva', code: 'Huelva'},
	{name: 'Huesca', code: 'Huesca'},
	{name: 'Jaén', code: 'Jaén'},
	{name: 'La Rioja', code: 'La Rioja'},
	{name: 'Las Palmas', code: 'Las Palmas'},
	{name: 'León', code: 'León'},
	{name: 'Lérida', code: 'Lérida'},
	{name: 'Lleida', code: 'Lleida'},
	{name: 'Lugo', code: 'Lugo'},
	{name: 'Madrid', code: 'Madrid'},
	{name: 'Málaga', code: 'Málaga'},
	{name: 'Melilla', code: 'Melilla'},
	{name: 'Murcia', code: 'Murcia'},
	{name: 'Navarra', code: 'Navarra'},
	{name: 'Ourense', code: 'Ourense'},
	{name: 'Palencia', code: 'Palencia'},
	{name: 'Pontevedra', code: 'Pontevedra'},
	{name: 'Salamanca', code: 'Salamanca'},
	{name: 'Santa Cruz De Tenerife', code: 'Santa Cruz De Tenerife'},
	{name: 'Segovia', code: 'Segovia'},
	{name: 'Sevilla', code: 'Sevilla'},
	{name: 'Soria', code: 'Soria'},
	{name: 'Tarragona', code: 'Tarragona'},
	{name: 'Teruel', code: 'Teruel'},
	{name: 'Toledo', code: 'Toledo'},
	{name: 'València', code: 'València'},
	{name: 'Valladolid', code: 'Valladolid'},
	{name: 'Vizcaya', code: 'Vizcaya'},
	{name: 'Zamora', code: 'Zamora'},
	{name: 'Zaragoza', code: 'Zaragoza'},
]},
{country: 'Sri Lanka', states: []},
{country: 'Sudan', states: []},
{country: 'Suriname', states: []},
{country: 'Svalbard and Jan Mayen', states: []},
{country: 'Swaziland', states: []},
{country: 'Sweden', states: []},
{country: 'Switzerland', states: []},
{country: 'Syrian Arab Republic', states: []},
{country: 'Taiwan, Province of China', states: []},
{country: 'Tajikistan', states: []},
{country: 'Tanzania, United Republic of', states: []},
{country: 'Thailand', states: []},
{country: 'Timor-Leste', states: []},
{country: 'Togo', states: []},
{country: 'Tokelau', states: []},
{country: 'Tonga', states: []},
{country: 'Trinidad and Tobago', states: []},
{country: 'Tunisia', states: []},
{country: 'Turkey', states: [
	{name: 'Adana', code: 'Adana'},
	{name: 'Adiyaman', code: 'Adiyaman'},
	{name: 'Afyonkarahisar', code: 'Afyonkarahisar'},
	{name: 'Ağrı', code: 'Ağrı'},
	{name: 'Aksaray', code: 'Aksaray'},
	{name: 'Amasya', code: 'Amasya'},
	{name: 'Ankara', code: 'Ankara'},
	{name: 'Antalya', code: 'Antalya'},
	{name: 'Ardahan', code: 'Ardahan'},
	{name: 'Artvin', code: 'Artvin'},
	{name: 'Aydin', code: 'Aydin'},
	{name: 'Balıkesir', code: 'Balıkesir'},
	{name: 'Bartın', code: 'Bartın'},
	{name: 'Batman', code: 'Batman'},
	{name: 'Bayburt', code: 'Bayburt'},
	{name: 'Bilecik', code: 'Bilecik'},
	{name: 'Bingöl', code: 'Bingöl'},
	{name: 'Bitlis', code: 'Bitlis'},
	{name: 'Bolu', code: 'Bolu'},
	{name: 'Burdur', code: 'Burdur'},
	{name: 'Bursa', code: 'Bursa'},
	{name: 'Çanakkale', code: 'Çanakkale'},
	{name: 'Çankırı', code: 'Çankırı'},
	{name: 'Çorum', code: 'Çorum'},
	{name: 'Denizli', code: 'Denizli'},
	{name: 'Diyarbakir', code: 'Diyarbakir'},
	{name: 'Düzce', code: 'Düzce'},
	{name: 'Edirne', code: 'Edirne'},
	{name: 'Elazığ', code: 'Elazığ'},
	{name: 'Erzincan', code: 'Erzincan'},
	{name: 'Erzurum', code: 'Erzurum'},
	{name: 'Eskişehir', code: 'Eskişehir'},
	{name: 'Gaziantep', code: 'Gaziantep'},
	{name: 'Giresun', code: 'Giresun'},
	{name: 'Gümüşhane', code: 'Gümüşhane'},
	{name: 'Hakkâri', code: 'Hakkâri'},
	{name: 'Hatay', code: 'Hatay'},
	{name: 'Iğdır', code: 'Iğdır'},
	{name: 'Isparta', code: 'Isparta'},
	{name: 'Istanbul', code: 'Istanbul'},
	{name: 'Izmir', code: 'Izmir'},
	{name: 'Kahramanmaraş', code: 'Kahramanmaraş'},
	{name: 'Karabük', code: 'Karabük'},
	{name: 'Karaman', code: 'Karaman'},
	{name: 'Kars', code: 'Kars'},
	{name: 'Kastamonu', code: 'Kastamonu'},
	{name: 'Kayseri', code: 'Kayseri'},
	{name: 'Kilis', code: 'Kilis'},
	{name: 'Kirikkale', code: 'Kirikkale'},
	{name: 'Kirklareli', code: 'Kirklareli'},
	{name: 'Kırşehir', code: 'Kırşehir'},
	{name: 'Kocaeli', code: 'Kocaeli'},
	{name: 'Konya', code: 'Konya'},
	{name: 'Kütahya', code: 'Kütahya'},
	{name: 'Malatya', code: 'Malatya'},
	{name: 'Manisa', code: 'Manisa'},
	{name: 'Mardin', code: 'Mardin'},
	{name: 'Mersin', code: 'Mersin'},
	{name: 'Muğla', code: 'Muğla'},
	{name: 'Muş', code: 'Muş'},
	{name: 'Nevşehir', code: 'Nevşehir'},
	{name: 'Niğde', code: 'Niğde'},
	{name: 'Ordu', code: 'Ordu'},
	{name: 'Osmaniye', code: 'Osmaniye'},
	{name: 'Rize', code: 'Rize'},
	{name: 'Sakarya', code: 'Sakarya'},
	{name: 'Samsun', code: 'Samsun'},
	{name: 'Sanliurfa', code: 'Sanliurfa'},
	{name: 'Siirt', code: 'Siirt'},
	{name: 'Sinop', code: 'Sinop'},
	{name: 'Şırnak', code: 'Şırnak'},
	{name: 'Sivas', code: 'Sivas'},
	{name: 'Tekirdağ', code: 'Tekirdağ'},
	{name: 'Tokat', code: 'Tokat'},
	{name: 'Trabzon', code: 'Trabzon'},
	{name: 'Tunceli', code: 'Tunceli'},
	{name: 'Uşak', code: 'Uşak'},
	{name: 'Van', code: 'Van'},
	{name: 'Yalova', code: 'Yalova'},
	{name: 'Yozgat', code: 'Yozgat'},
	{name: 'Zonguldak', code: 'Zonguldak'},
]},
{country: 'Turkmenistan', states: []},
{country: 'Turks and Caicos Islands', states: []},
{country: 'Tuvalu', states: []},
{country: 'Uganda', states: []},
{country: 'Ukraine', states: []},
{country: 'United Arab Emirates', states: []},
{country: 'United Kingdom', states: []},
{country: 'United States', states: [
	{name: 'Alabama', code: 'AL'},
	{name: 'Alaska', code: 'AK'},
	{name: 'Arizona', code: 'AZ'},
	{name: 'Arkansas', code: 'AR'},
	{name: 'California', code: 'CA'},
	{name: 'Colorado', code: 'CO'},
	{name: 'Connecticut', code: 'CT'},
	{name: 'Delaware', code: 'DE'},
	{name: 'District of Columbia', code: 'DC'},
	{name: 'Florida', code: 'FL'},
	{name: 'Georgia', code: 'GA'},
	{name: 'Hawaii', code: 'HI'},
	{name: 'Idaho', code: 'ID'},
	{name: 'Illinois', code: 'IL'},
	{name: 'Indiana', code: 'IN'},
	{name: 'Iowa', code: 'IA'},
	{name: 'Kansas', code: 'KS'},
	{name: 'Kentucky', code: 'KY'},
	{name: 'Louisiana', code: 'LA'},
	{name: 'Maine', code: 'ME'},
	{name: 'Maryland', code: 'MD'},
	{name: 'Massachusetts', code: 'MA'},
	{name: 'Michigan', code: 'MI'},
	{name: 'Minnesota', code: 'MN'},
	{name: 'Mississippi', code: 'MS'},
	{name: 'Missouri', code: 'MO'},
	{name: 'Montana', code: 'MT'},
	{name: 'Nebraska', code: 'NE'},
	{name: 'Nevada', code: 'NV'},
	{name: 'New Hampshire', code: 'NH'},
	{name: 'New Jersey', code: 'NJ'},
	{name: 'New Mexico', code: 'NM'},
	{name: 'New York', code: 'NY'},
	{name: 'North Carolina', code: 'NC'},
	{name: 'North Dakota', code: 'ND'},
	{name: 'Ohio', code: 'OH'},
	{name: 'Oklahoma', code: 'OK'},
	{name: 'Oregon', code: 'OR'},
	{name: 'Pennsylvania', code: 'PA'},
	{name: 'Rhode Island', code: 'RI'},
	{name: 'South Carolina', code: 'SC'},
	{name: 'South Dakota', code: 'SD'},
	{name: 'Tennessee', code: 'TN'},
	{name: 'Texas', code: 'TX'},
	{name: 'Utah', code: 'UT'},
	{name: 'Vermont', code: 'VT'},
	{name: 'Virginia', code: 'VA'},
	{name: 'Washington', code: 'WA'},
	{name: 'West Virginia', code: 'WV'},
	{name: 'Wisconsin', code: 'WI'},
	{name: 'Wyoming', code: 'WY'},
	{name: 'U.S. Armed Forces - Americas', code: 'AA'},
	{name: 'U.S. Armed Forces - Europe', code: 'AE'},
	{name: 'U.S. Armed Forces - Pacific', code: 'AP'}
]},
{country: 'United States Minor Outlying Islands', states: []},
{country: 'Uruguay', states: []},
{country: 'Uzbekistan', states: []},
{country: 'Vanuatu', states: []},
{country: 'Venezuela, Bolivarian Republic of', states: []},
{country: 'Viet Nam', states: []},
{country: 'Virgin Islands, British', states: []},
{country: 'Virgin Islands, U.S.', states: []},
{country: 'Wallis and Futuna', states: []},
{country: 'Western Sahara', states: []},
{country: 'Yemen', states: []},
{country: 'Zambia', states: []},
{country: 'Zimbabwe', states: []}
];
