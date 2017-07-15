udcDevModule.filter('eventListFilter', function () {
    return function (items, search) {

        var filtered = [];

        var timeSeriesFilter = [];

        let timeSeriesSet = new Set();

        angular.forEach(items, function (item) {

            var tempItem = item;
            // Truncate function
            //if (item.log.length > 190)
            //    tempItemLog = item.log.substring(0, 190);
            //else
            //    tempItemLog = item.log;

            if (search == undefined || search == "") {
                timeSeriesSet.add(tempItem.time.substring(0,16));
                filtered.push(item);
            }
            else {
                //tempItem.log = tempItem.log.toLowerCase();
                if (tempItem.log.toLowerCase().indexOf(search.toLowerCase()) > -1)
                    filtered.push(item);
            }
            lastItem = item;
        });

        return filtered;
    }
});


udcDevModule.filter('eventDetailHightLightFilter', function ($sce) {
    return function (text, search) {

        if (search == undefined || search == "")
        {
            return $sce.trustAsHtml(text);
        }
        else
        {
            
            var textRendered = text.toLowerCase().replace(new RegExp(search, 'g'), function (match) {
                return '<span class="eventdetail-hightlight">' + match + '</span>';
            });
            return $sce.trustAsHtml(textRendered);
        }
            

    }
});


