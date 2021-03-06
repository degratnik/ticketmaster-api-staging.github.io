import widgetAnalytics, {
  EVENT_CATEGORY,
  CUSTOM_DIMENSIONS,
  EVENT_NAME,
} from 'helpers/widgets-analytics';
import universePlugin from 'helpers/universe-plugin';

widgetAnalytics.initialize(EVENT_CATEGORY.MAP_WIDGET);

class TicketmasterMapWidget {

    set config(attrs) { this.widgetConfig = this.loadConfig(attrs); }
    get config() { return this.widgetConfig; }

    set events(responce){ this.eventsList = this.parseEvents(responce);}
    get events(){ return this.eventsList;}

    get isSimpleProportionM() { return this.config.proportion === 'm'}
    get borderSize(){ return this.config.border || 0;}
    get widgetHeight(){ return this.config.height || 600;}

    get widgetContentHeight() {
        // return this.widgetHeight - (this.isListView || this.isSimpleProportionM ? 0 : 39) || 600;
        return this.widgetHeight;
    }

    get eventUrl(){ return "https://www.ticketmaster.com/event/"; }

    get apiUrl(){ return "https://app.ticketmaster.com/discovery-widgets/v2/events.json"; }

    get themeUrl() {
        return (window.location.host === 'developer.ticketmaster.com')
            ? `https://developer.ticketmaster.com/products-and-docs/widgets/map/1.0.0/theme/`
            : `https://ticketmaster-api-staging.github.io/products-and-docs/widgets/map/1.0.0/theme/`;
    }

    get portalUrl(){
        return (window.location.host === 'developer.ticketmaster.com')
            ? `https://developer.ticketmaster.com/`
            : `https://ticketmaster-api-staging.github.io/`;
    }

    get logoUrl() { return "https://www.ticketmaster.com/"; }

    get legalNoticeUrl() { return "http://developer.ticketmaster.com/support/terms-of-use/"; }

    get questionUrl() { return "http://developer.ticketmaster.com/support/faq/"; }

    get widgetVersion() { return `${__VERSION__}`; }

    get geocodeUrl() { return "https://maps.googleapis.com/maps/api/geocode/json"; }

    get updateExceptions() { return ["width", "height", "border", "borderradius", "colorscheme", "layout", "affiliateid", "propotion", "googleapikey", "latlong"]}

    get hideMessageDelay(){ return 5000; }

    get controlHiddenClass(){ return "events_control-hidden"; }

    get tmWidgetWhiteList(){ return ["2200504BAD4C848F", "00005044BDC83AE6", "1B005068DB60687F", "1B004F4DBEE45E47", "3A004F4ED7829D5E", "3A004F4ED1FC9B63", "1B004F4FF83289C5", "1B004F4FC0276888", "0E004F4F3B7DC543", "1D004F4F09C61861", "1600505AC9A972A1", "22004F4FD82795C6", "01005057AFF54574", "01005056FAD8793A", "3A004F4FB2453240", "22004F50D2149AC6", "01005059AD49507A", "01005062B4236D5D"]; }

    get countriesWhiteList() {
        return [
            'Australia',
            'Austria',
            'Belgium',
            'Canada',
            'Denmark',
            'Finland',
            'France',
            'Germany',
            'Ireland',
            'Mexico',
            'Netherlands',
            'New Zealand',
            'Norway',
            'Spain',
            'Sweden',
            'Turkey',
            'UAE',
            'United Kingdom',
            'United States'
        ]
    }

    isConfigAttrExistAndNotEmpty(attr) {
        if( !this.config.hasOwnProperty(attr) || this.config[attr] === "undefined"){
            return false;
        }else if( this.config[attr] === ""){
            return false;
        }
        return true;
    }

    get eventReqAttrs(){
        let mapWidgetRoot = this.eventsRootContainer.parentNode;
        let attrs = {},
            params = [
                {
                    attr: 'tmapikey',
                    verboseName: 'apikey'
                },
                {
                    attr: 'latlong',
                    verboseName: 'latlong'
                },
                {
                    attr: 'postalcode',
                    verboseName: 'postalCode'
                },
                {
                    attr: 'keyword',
                    verboseName: 'keyword'
                },
                {
                    attr: 'size',
                    verboseName: 'size'
                },
                {
                    attr: 'radius',
                    verboseName: 'radius'
                },
                {
                    attr: 'attractionid',
                    verboseName: 'attractionId'
                },
                {
                    attr: 'promoterid',
                    verboseName: 'promoterId'
                },
                {
                    attr: 'venueid',
                    verboseName: 'venueId'
                },
                {
                    attr: 'classificationname',
                    verboseName: 'classificationName'
                },
                {
                    attr: 'city',
                    verboseName: 'city'
                },
                {
                    attr: 'countrycode',
                    verboseName: 'countryCode'
                },
                {
                    attr: 'source',
                    verboseName: 'source'
                }
            ];

        for(let i in params){
            let item = params[i];
            if(this.isConfigAttrExistAndNotEmpty(item.attr))
                attrs[item.verboseName] = this.config[item.attr];
        }

        if(this.config.latlong){
            attrs.latlong = this.config.latlong;
        }

        if(this.config.postalcode) {
            attrs.postalcode = this.config.postalcode;
        }

        if(this.isConfigAttrExistAndNotEmpty("period")){
            let period = this.getDateFromPeriod(this.config.period);
            attrs.startDateTime = period[0];
            attrs.endDateTime = period[1];
        }

        if (this.config.tmapikey == '') {
            attrs.apikey = apiKeyService.checkApiKeyCookie() || apiKeyService.getApiWidgetsKey();
        }

        if (mapWidgetRoot.getAttribute("w-latlong") != '') {
            attrs.latlong = mapWidgetRoot.getAttribute("w-latlong");
        }

        if (attrs.latlong == ',') {
            delete attrs.latlong;
        }

        if (attrs.latlong == null) {
            delete attrs.latlong;
        }

        return attrs;
    }

    constructor(root) {
        if(!root) return;
        this.widgetRoot = root;
        if (this.widgetRoot.querySelector('.events-root-container') === null) {
            this.eventsRootContainer = document.createElement("div");
            this.eventsRootContainer.classList.add("events-root-container");
            this.widgetRoot.appendChild(this.eventsRootContainer);

            this.config = this.widgetRoot.attributes;

            this.eventsRoot = document.createElement("div");
            this.eventsRoot.classList.add("map");
            // this.eventsRoot.style.height = parseInt(parseInt(this.widgetHeight) + 25) + "px";
            this.eventsRoot.style.height = this.widgetHeight + "px";
            this.eventsRoot.style.width = this.config.width + "px";
            this.eventsRootContainer.appendChild(this.eventsRoot);

            if (this.config.theme !== null && !document.getElementById(`widget-theme-${this.config.theme}`)) {
                this.addStylesheetForWidgetTheme();
            }

            this.eventsRootContainer.classList.remove("border");
            if (this.config.border) {
                this.eventsRootContainer.classList.add("border");
            }

            this.widgetRoot.style.height = `${this.widgetHeight}px`;
            this.widgetRoot.style.width = `${this.config.width}px`;
            this.eventsRootContainer.style.height = `${this.widgetHeight}px`;
            this.eventsRootContainer.style.width = `${this.config.width}px`;
            this.eventsRootContainer.style.borderRadius = `${this.config.borderradius}px`;
            this.eventsRootContainer.style.borderWidth = `${this.borderSize}px`;

            //this.clear();

            this.AdditionalElements();

            this.useGeolocation();

            this.getCoordinates(() => {
                this.makeRequest(this.eventsLoadingHandler, this.apiUrl, this.eventReqAttrs);
            });
            /*plugins for 'buy button'*/
            universePlugin.embedUniversePlugin();
            this.initMessage();

            this.defaultAnalyticsProperties = {
              eventCategory: EVENT_CATEGORY.MAP_WIDGET,
              [CUSTOM_DIMENSIONS.API_KEY]: this.eventReqAttrs.apikey,
            };

            widgetAnalytics.sendEvent({
              eventAction: EVENT_NAME.RENDERED,
              ...this.defaultAnalyticsProperties,
            });
        }
    }

    getCoordinates(cb){
        let widget = this;
        if(this.config.postalcode) {
            widget.config.postalcode = this.config.postalcode;
            cb(widget.config.postalcode);
        }else{
            // Used in builder
            if(widget.onLoadCoordinate) widget.onLoadCoordinate(null);
            widget.config.latlong = '';
            // widget.config.countrycode = '';
            cb(widget.config.latlong);
        }
    }

    // Message
    initMessage(){
        this.messageDialog = document.createElement('div');
        this.messageDialog.classList.add("event-message");
        this.messageContent = document.createElement('div');
        this.messageContent.classList.add("event-message__content");

        let messageClose = document.createElement('div');
        messageClose.classList.add("event-message__btn");
        messageClose.addEventListener("click", ()=> {
            this.hideMessage();
        });

        this.messageDialog.appendChild(this.messageContent);
        this.messageDialog.appendChild(messageClose);
        this.eventsRootContainer.appendChild(this.messageDialog);
    }

    showMessage(message, hideMessageWithoutDelay){
        if(message.length){
            this.hideMessageWithoutDelay = hideMessageWithoutDelay;
            this.messageContent.innerHTML = message;
            this.messageDialog.classList.add("event-message-visible");
            if (this.messageTimeout) {
                clearTimeout(this.messageTimeout); // Clear timeout if before 'hideMessageWithDelay' was called
            }
        }
    }

    hideMessageWithDelay(delay){
        if(this.messageTimeout) clearTimeout(this.messageTimeout); // Clear timeout if this method was called before
        this.messageTimeout = setTimeout(()=>{
            this.hideMessage();
        }, delay);
    }

    hideMessage(){
        if(this.messageTimeout) clearTimeout(this.messageTimeout); // Clear timeout and hide message immediately.
        this.messageDialog.classList.remove("event-message-visible");
    }
    // End message

    useGeolocation() {
        var widget = this;
        var clickNearMe = function(e) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    e.target.parentNode.setAttribute('w-latlong', latitude + ',' + longitude);
                    widget.update();
                });

            }
        };

        var buttons = document.getElementsByClassName("near-me-btn");
        for (var i = 0; i < buttons.length; i++) {
            var current = buttons[i];
            current.addEventListener('click', clickNearMe, false);
            current.addEventListener('touchstart', clickNearMe, false);
        }
    }

    AdditionalElements(){
        var nearMeBtn = document.createElement("span");
        nearMeBtn.classList.add('near-me-btn');
        if (this.widgetRoot.getAttribute("w-geoposition") !== 'on') nearMeBtn.classList.add('dn');
        nearMeBtn.setAttribute('title', 'Show events near me');
        this.widgetRoot.appendChild(nearMeBtn);

        var legalNoticeContent = document.createTextNode('Legal Notice'),
            legalNotice = document.createElement("a");
        legalNotice.appendChild(legalNoticeContent);
        legalNotice.classList.add("legal-notice");
        legalNotice.target = '_blank';
        legalNotice.href = this.legalNoticeUrl;
        this.widgetRoot.appendChild(legalNotice);

        var logo = document.createElement('a');
        logo.classList.add("event-logo","centered-logo");
        logo.target = '_blank';
        logo.href = this.logoUrl;
        logo.innerHTML = 'Powered by ';

        var logoBox = document.createElement('div');
        logoBox.classList.add("event-logo-box");
        logoBox.appendChild(logo);
        this.eventsRootContainer.appendChild(logoBox);

        let question = document.createElement('span');
        question.classList.add("event-question");
        question.target = '_blank';
        question.href = this.questionUrl;
        question.addEventListener('click', toolTipHandler);
        this.eventsRootContainer.appendChild(question);

        let toolTip = document.createElement('div'),
            tooltipHtml = `
              <div class="tooltip-inner"> 
                <a href="${this.questionUrl}" target = "_blank" >About widget</a>
                <div class="place">version: <b>${this.widgetVersion}</b></div>
              </div>`;
        toolTip.classList.add("tooltip-version");
        toolTip.classList.add("left");
        toolTip.innerHTML = tooltipHtml;
        this.eventsRootContainer.appendChild(toolTip);

        function toolTipHandler(e) {
            e.preventDefault();
            e.target.nextSibling.classList.toggle('show-tip');
        }
    }

    formatDate(date) {
        var result = '';
        if(!date.day) return result; // Day is required

        function LZ(x) {
            return (x < 0 || x > 9 ? "" : "0") + x
        }
        var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            dayArray = date.day.split('-'),
            d = parseInt(dayArray[2]),
            M = parseInt(dayArray[1]);

        // var E = new Date(date.day).getDay();
        var E = new Date(+date.day.split('-')[0],(+date.day.split('-')[1])-1,+date.day.split('-')[2]).getDay();
        result = DAY_NAMES[E] + ', ' + MONTH_NAMES[M - 1] + ' ' + d + ', ' + dayArray[0];

        if(!date.time) return result;

        var timeArray = date.time.split(':'),
            H = parseInt(timeArray[0]),
            m = timeArray[1],
            a = "AM";

        if (H > 11) a = "PM";
        if (H == 0) {
            H = 12;
        } else if (H > 12) {
            H = H - 12;
        }

        return result + ' ' + LZ(H) + ':' + m + ' ' + a;
    }

    clearEvents(){
        this.eventsRoot.innerHTML = "";
    }

    clear(){
        var modificatorList = this.widgetRoot.getElementsByClassName('modificator');
        while (modificatorList.length) {
            let el = modificatorList[0],
                parent = el.parentNode;
            parent.removeChild(el);
        }
        this.clearEvents();
    }

    update() {

        let oldTheme = this.config.constructor();
        for (let attr in this.config) {
            if (this.config.hasOwnProperty(attr)) oldTheme[attr] = this.config[attr];
        }

        this.config = this.widgetRoot.attributes;

        this.widgetRoot.style.height = `${this.widgetHeight}px`;
        this.widgetRoot.style.width  = `${this.config.width}px`;
        this.eventsRootContainer.style.height = `${this.widgetContentHeight}px`;
        this.eventsRootContainer.style.width  = `${this.config.width}px`;
        this.eventsRootContainer.style.borderRadius = `${this.config.borderradius}px`;
        this.eventsRootContainer.style.borderWidth = `${this.borderSize}px`;

        this.eventsRootContainer.classList.remove("border");
        if( this.config.hasOwnProperty("border") ){
            this.eventsRootContainer.classList.add("border");
        }

        this.clear();
        this.getCoordinates(() => {
            this.makeRequest( this.eventsLoadingHandler, this.apiUrl, this.eventReqAttrs );
        });

        let events = this.eventsRoot.getElementsByClassName("event-wrapper");
        this.useGeolocation();

    }

    needToUpdate(newTheme, oldTheme, forCheck = []){
        return Object.keys(newTheme).map(function(key){
                if(forCheck.indexOf(key) > -1) return true;
                //console.warn([key, newTheme[key], oldTheme[key], newTheme[key] === oldTheme[key]])
                return newTheme[key] === oldTheme[key] ;
            }).indexOf(false) > -1
    }

    loadConfig(NamedNodeMap){
        var config = {};
        Object.keys(NamedNodeMap).map(function(value){
            if( typeof(NamedNodeMap[value].name) !== "undefined" && NamedNodeMap[value].name.indexOf("w-") !== -1){
                config[ NamedNodeMap[value].name.replace(/w-/g, "").replace(/-/g, "") ] = NamedNodeMap[value].value;
            }
        });
        return config;
    }

    addStylesheetForWidgetTheme() {
      const styleLinkElem = document.createElement('link');
      styleLinkElem.setAttribute('rel', 'stylesheet');
      styleLinkElem.setAttribute('type', 'text/css');
      styleLinkElem.setAttribute('href', `${this.themeUrl}${this.config.theme}.css`);
      styleLinkElem.setAttribute('id', `widget-theme-${this.config.theme}`);
      document.getElementsByTagName('head')[0].appendChild(styleLinkElem);
    }

    groupEventsByName(){
        let groups = {};
        this.events.map(function(event){
            if (groups[event.name] === undefined) groups[event.name] = [];
            groups[event.name].push(event);
        });

        this.eventsGroups = [];
        for (let groupName in groups) {
            this.eventsGroups.push(groups[groupName]);
        }
    }

    resetReduceParamsOrder(){
        this.reduceParamsOrder = 0;
    }

    reduceParamsAndReloadEvents(){
        let eventReqAttrs = {},
            reduceParamsList = [
                ['classificationName'],
                ['city'],
                ['countryCode'],
                ['source'],
                ['startDateTime', 'endDateTime', 'country'],
                ['radius'],
                ['postalCode', 'latlong'],
                ['attractionId'],
                ['promoterId'],
                // ['segmentId'],
                ['venueId'],
                ['keyword'],
                ['size']
            ];

        // make copy of params
        for(let key in this.eventReqAttrs){
            eventReqAttrs[key] = this.eventReqAttrs[key]
        }

        if(!this.reduceParamsOrder) this.reduceParamsOrder = 0;
        if(reduceParamsList.length > this.reduceParamsOrder){
            for(let item in reduceParamsList){
                if(this.reduceParamsOrder >= item){
                    for(let i in reduceParamsList[item]){
                        delete eventReqAttrs[reduceParamsList[item][i]];
                    }
                }
            }

            if(this.reduceParamsOrder === 0) this.showMessage("No results were found.<br/>Here other options for you.");
            this.reduceParamsOrder++;
            this.makeRequest( this.eventsLoadingHandler, this.apiUrl, eventReqAttrs );
        }else{
            // We haven't any results
            this.showMessage("No results were found.", true);
            this.reduceParamsOrder = 0;
        }
    }

    setMarkers(map, markers) {

        var infowindow = new google.maps.InfoWindow({
            content: " ",
        });

        var image = {
            url: 'https://ticketmaster-api-staging.github.io/assets/widgets/1.0.0/img/marker.svg',
            size: new google.maps.Size(22, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(22, 32)
        };

        var imageActive = {
            url: 'https://ticketmaster-api-staging.github.io/assets/widgets/1.0.0/img/marker-active.svg',
            size: new google.maps.Size(22, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(22, 32)
        };

        for (var i = 0; i < markers.length; i++) {
            let sites = markers[i];
            if (sites !== undefined) {
                var siteLatLng = new google.maps.LatLng(sites[1], sites[2]);
                var marker = new google.maps.Marker({
                    position: siteLatLng,
                    map: map,
                    icon: image,
                    title: sites[0],
                    zIndex: sites[3],
                    html: sites[4]
                });
            }
            google.maps.event.addListener(marker, "click", function () {
                infowindow.setContent(this.html);
                infowindow.open(map, this);
            });
            google.maps.event.addListener(marker, 'mouseover', function() {
                this.setIcon(imageActive);
            });
            google.maps.event.addListener(marker, 'mouseout', function() {
                this.setIcon(image);
            });
        }
    }

    eventsLoadingHandler(){
        let widget = this.widget;
        var markers = [];
        widget.clearEvents(); // Additional clearing after each loading
        if (this && this.readyState == XMLHttpRequest.DONE ) {
            if(this.status == 200){
                widget.events = JSON.parse(this.responseText);
                if(widget.events.length){

                    var myLatLng = {lat: 34.0390107, lng: -118.2672801};

                    var map = new google.maps.Map(widget.widgetRoot.firstChild.firstChild, {
                        zoom: 4,
                        center: myLatLng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        panControl: false,
                        streetViewControl: false,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        },
                    });

                    var latlngbounds = new google.maps.LatLngBounds();

                    widget.groupEventsByName.call(widget);

                    for (let e=0; e < widget.events.length; e++) {

                        if (widget.events[e].location !== undefined) {
                            let place = '';
                            let address = '';
                            let date = widget.formatDate({
                                day: widget.events[e].date.day,
                                time: widget.events[e].date.time
                            });
                            if (widget.events[e].address.hasOwnProperty('name')) {
                                place = widget.events[e].address.name + ', ';
                            }
                            else {
                                place = '';
                            }
                            if (widget.events[e].address.hasOwnProperty('line1')) {
                                address = widget.events[e].address.line1;
                            } else {
                                address = '';
                            }

                            let buyBtn = '';
                            const devPortBuyButtonClick = widgetAnalytics.getStringEventHandler({
                              eventAction: EVENT_NAME.BUY_BUTTON_CLICK,
                              eventLabel: widget.events[e].url,
                              ...widget.defaultAnalyticsProperties,
                            });
                            const buyButtonClickHandler = `ga('send', 'event', 'DiscoveryClickBuyButton', 'click'); ${devPortBuyButtonClick}`;

                            buyBtn = `
                              <a class="buybtn" href="${widget.events[e].url}" onclick="${buyButtonClickHandler}" target="_blank">
                                BUY NOW
                              </a>
                            `;
                            const devPortEventNameClick = widgetAnalytics.getStringEventHandler({
                              eventAction: EVENT_NAME.EVENT_NAME_CLICK,
                              eventLabel: widget.events[e].url,
                              ...widget.defaultAnalyticsProperties,
                            });
                            const eventNameClickHandler = `ga('send', 'event', 'DiscoveryClickeventName', 'click'); ${devPortEventNameClick}`;

                            let eventMarkup = `
                              <div class="infowindow" style="width:220px!important;padding-right:5px!important;line-height:normal;overflow:auto;">
                                <a class="an" href="${widget.events[e].url}" onclick="${eventNameClickHandler}" target="_blank">
                                  <span class="img" style="background:url('${widget.events[e].img}') center center no-repeat"></span>
                                  <span class="name">${widget.events[e].name}</span>
                                </a>
                                ${buyBtn}
                                <div class="dateplace"><span class="date">${date}</span><span class="place">${place + address}</span></div>
                              </div>
                            `;

                            markers[e] = [
                                widget.events[e].name,
                                widget.events[e].location.lat,
                                widget.events[e].location.lng,
                                e,
                               eventMarkup,
                            ];
                            latlngbounds.extend(new google.maps.LatLng(widget.events[e].location.lat, widget.events[e].location.lng));
                        }
                    }
                    map.fitBounds( latlngbounds );

                    widget.setMarkers(map ,markers);


                    widget.resetReduceParamsOrder();
                    if(widget.hideMessageWithoutDelay)
                        widget.hideMessage();
                    else
                        widget.hideMessageWithDelay(widget.hideMessageDelay);
                }else{
                    widget.reduceParamsAndReloadEvents.call(widget);
                }
            }
            else if(this.status == 400) {
                widget.reduceParamsAndReloadEvents.call(widget);
                console.log('There was an error 400');
            }
            else {
                widget.reduceParamsAndReloadEvents.call(widget);
                console.log('something else other than 200 was returned');
            }
        }
    }

    getImageForEvent(images){
        let imgWidth;
        let idx;
        images.forEach(function (img, i) {
            if (i == 0) imgWidth = img.width;
            if (imgWidth > img.width) {
                imgWidth = img.width;
                idx = i;
            }
        });
        return (idx === undefined) ? '' : images[idx].url;
    }

    parseEvents(eventsSet){
        if(!eventsSet._embedded){
            if(typeof($widgetModalNoCode) !== "undefined"){
                $widgetModalNoCode.modal();
            }
            return [];
        }
        eventsSet = eventsSet._embedded.events;
        var tmpEventSet = [];

        for(var key in eventsSet){
            if(eventsSet.hasOwnProperty(key)){
                let currentEvent = {};

                currentEvent.id = eventsSet[key].id;
                currentEvent.url = eventsSet[key].url;
                currentEvent.name = eventsSet[key].name;

                /* Change URL [START] */
                var parser = document.createElement("a");
                parser.href = currentEvent.url;
                var expr= "/ticketmaster.evyy.net/";
                if (parser.href.match(expr) !== null) {
                    var changeURL = parser.pathname.split('/');
                    changeURL[3] = '330564';
                    currentEvent.url = parser.origin + changeURL.join('/') + parser.search + parser.hash;
                }
                /* Change URL [END] */

                currentEvent.date = {
                    day: eventsSet[key].dates.start.localDate,
                    time: eventsSet[key].dates.start.localTime
                };

                if(eventsSet[key].hasOwnProperty('_embedded') && eventsSet[key]._embedded.hasOwnProperty('venues')){
                    let venue = eventsSet[key]._embedded.venues[0];
                    if(venue){
                        if(venue.address)
                            currentEvent.address = venue.address;

                        if(venue.name) {
                            if(!currentEvent.address) currentEvent.address = {};
                            currentEvent.address.name = venue.name;
                        }

                        if (venue.location) {
                            currentEvent.location = {
                                lat: parseFloat(venue.location.latitude),
                                lng: parseFloat(venue.location.longitude)
                            };
                        }
                    }
                }

                // Remove this comment to get categories
                /*if(eventsSet[key]._embedded.hasOwnProperty('categories')){
                 currentEvent.categories = [];
                 let eventCategories = eventsSet[key]._embedded.categories;
                 currentEvent.categories = Object.keys(eventCategories).map(function(category){
                 return eventCategories[category].name
                 });
                 }*/

                currentEvent.img = this.getImageForEvent(eventsSet[key].images);
                tmpEventSet.push(currentEvent);

            }
        }
        return tmpEventSet;
    }

    makeRequest(handler, url=this.apiUrl, attrs={}, method="GET"){
        attrs = Object.keys(attrs).map(function(key){
            return `${key}=${attrs[key]}`;
        }).join("&");

        url = [url,attrs].join("?");

        this.xmlHTTP = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        if(method == "POST") {
            this.xmlHTTP.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        }
        this.xmlHTTP.widget = this;
        this.xmlHTTP.onreadystatechange = handler;
        this.xmlHTTP.open(method, url, true);
        this.xmlHTTP.send();
    }

    initPretendedLink(el, url, isBlank){
        if(el && url){
            el.setAttribute('data-url', url);
            el.classList.add("event-pretended-link");
            el.addEventListener('click', function(){
                let url = this.getAttribute('data-url');
                if(url){
                    let win = window.open(url, (isBlank ? '_blank' : '_self'));
                    win.focus();
                }
            });
            el.addEventListener('touchstart', function(){
                let url = this.getAttribute('data-url');
                if(url){
                    let win = window.open(url, (isBlank ? '_blank' : '_self'));
                    win.focus();
                }
            });
        }
        return el;
    }

    makeImageUrl(id){
        return `https://app.ticketmaster.com/discovery-widgets/v2/events/${id}/images.json`;
    }

    /*
     * Config block
     */

    decConfig(config){
        return JSON.parse(window.atob(config));
    }

    encConfig(config){
        return window.btoa(config);
    }

    toShortISOString(dateObj){
        return dateObj.getFullYear() +
            "-" + (dateObj.getMonth() + 1 < 10 ? "0"+ (dateObj.getMonth()+ 1): dateObj.getMonth() + 1) +
            "-" + (dateObj.getDate() < 10 ? "0"+ dateObj.getDate(): dateObj.getDate()) +
            "T" + (dateObj.getHours() < 10 ? "0"+dateObj.getHours(): dateObj.getHours()) +
            ":" + (dateObj.getMinutes() < 10 ? "0"+dateObj.getMinutes(): dateObj.getMinutes()) +
            ":" + (dateObj.getSeconds() < 10 ? "0"+dateObj.getSeconds(): dateObj.getSeconds()) +
            "Z";
    }

    getDateFromPeriod(period){

        var period = period.toLowerCase(),
            firstDay, lastDay;

        if(period == "year" ) {
            // firstDay = new Date( new Date(new Date()).toISOString() );
            // lastDay = new Date( new Date(new Date().valueOf()+24*365*60*60*1000).toISOString() );
            firstDay = new Date().toISOString().slice(0,19) + 'Z';
            lastDay = new Date(new Date().valueOf()+24*365*60*60*1000).toISOString().slice(0,19) + 'Z';
        }
        else if(period == "month") {
            // firstDay = new Date( new Date(new Date()).toISOString() );
            // lastDay = new Date( new Date(new Date().valueOf()+24*31*60*60*1000).toISOString() );
            firstDay = new Date().toISOString().slice(0,19) + 'Z';
            lastDay = new Date(new Date().valueOf()+24*31*60*60*1000).toISOString().slice(0,19) + 'Z';
        }
        else if(period == "week") {
            // firstDay = new Date( new Date(new Date()).toISOString() );
            // lastDay = new Date( new Date(new Date().valueOf()+24*7*60*60*1000).toISOString() );
            firstDay = new Date().toISOString().slice(0,19) + 'Z';
            lastDay = new Date(new Date().valueOf()+24*7*60*60*1000).toISOString().slice(0,19) + 'Z';
        } else {
            // firstDay = new Date( new Date(new Date()).toISOString() );
            // lastDay = new Date( new Date(new Date().valueOf()+24*60*60*1000).toISOString() );
            firstDay = new Date().toISOString().slice(0,19) + 'Z';
            lastDay = new Date(new Date().valueOf()+24*60*60*1000).toISOString().slice(0,19) + 'Z';
        }

        // return [this.toShortISOString(firstDay), this.toShortISOString(lastDay)];
        return [firstDay, lastDay];
    }

}
let widgetsMap = [];
(function () {
    let widgetContainers = document.querySelectorAll("div[w-type='map']");
    for (let i = 0; i < widgetContainers.length; ++i) {
        widgetsMap.push(new TicketmasterMapWidget(widgetContainers[i]));
    }

})();



if(typeof module !== "undefined") {
    module.exports = { TicketmasterMapWidget, widgetsMap };
}
