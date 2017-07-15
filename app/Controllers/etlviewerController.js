var udcDevModule = angular.module('udcDev');

// Config
udcDevModule.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

// Controller
udcDevModule.controller('etlViewer', function ($scope, $http, $sce) {

    $scope.maxFileSize = 5;
    $scope.maxEvents = 120;

    
    $scope.currentIp = '';
    $scope.serverNameOPSV = 'OPSV LOEOP';
    $scope.serverName = 'UDC LOEOP';
    $scope.etlFileName = 'ETL List';
    $scope.cssDisplayOnFileName = {"display":"none"};
    $scope.cssDisplayOnETWDetail = { "display": "none" };

   

    $scope.renderHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    // UDC lab server list request
    $http.post('../data/LabInfo')
            .then(function (res) {
                $scope.envs = res.data;
            }, function (err) {
                console.log(err)
            });

    // OPSV server list request
    $http.post('../data/OPSVInfo')
            .then(function (res) {
                $scope.opsv_envs = res.data;
            }, function (err) {
                console.log(err)
            });

    // UDC lab file list request
    $scope.getFileList = function (ip, serverName) {
        
        $scope.ipOnClicked = ip;
        $scope.serverName = serverName;


    $http.post('/data/FileList', { serverIP: ip})
            .then(function (res) {
                $scope.opsv_envs = res.data.body;
                $scope.fileList = res.data.body;
            var fileList = res.data;
            // Clean
            $scope.serverNameOPSV = 'OPSV LOEOP';
            $scope.cssDisplayOnFileName = {};

            }, function (err) {
                console.log(err)
            });
    };

    // OPSV file list request
    $scope.getFileListForOPSV = function (ip, serverName) {

        $scope.ipOnClicked = ip;
        $scope.serverNameOPSV = serverName;

        $http.post('/data/FileList', {serverIP: ip})
             .then(function(res){
                $scope.fileList = res.data.body;
                var fileList = res.data.body;

                // Clean
                $scope.serverName = 'UDC LOEOP';
                $scope.cssDisplayOnFileName = {};
            }, function(err){
                console.log(err);
            });

        
    };

    // ETL event list request 
    $scope.getETLEventlist = function (ip, fn, ct, ms) {

        $scope.cssDisplayOnETWDetail = { "display": "none" };
        $scope.etlFileName = fn;
        $scope.currentIp = ip;

        $http.post('/data/ProcessETL', {serverIP: ip, fileName: fn})
             .then(function(res){
                
                if (res.data.body[0].charAt(0) == 1 && res.data.body[1].charAt(0) == 1) // Copy and process succeed
                {
                    $http.post('/data/ProcessedETLData', { serverIP: ip, fileName: fn, counts: ct, mbSize: ms })
                         .then(function (res) {
                            $scope.etwData = null;
                            var etwData = res.data.body;

                            $scope.etwData = ManipulatedETLData(etwData);
                        }, function (err) {
                            console.log(err)
                        });

                } 
                else
                {
                    alert("No events for this etl file.");
                }

             }, function(err){

                alert("Exception in getETLEventlist");
             })
    };

    // Display ETL data in the box
    $scope.displayETWData = function (log, index) {



        $scope.selectedIndex = index;

        // ng-click etw class
        if ($scope.etwClickedClass == "" || $scope.etwClickedClass == undefined)
            $scope.etwClickedClass = "etwListClicked";
        else
            $scope.etwClickedClass = "";


        var log = vkbeautify.xml(log);

        var regexRenderXML = '/&lt;.*?&gt;/g';

        var renderLog = log.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        var renderLog = renderLog.replace(/&lt;(.*?)&gt;/g, function (match, p1) {
            return '<span class="etwdata-tag">' + match + "</span>";
        });

        var renderLog = renderLog.replace(/<\/span>(.*?)<span/g, function (match, p1) {
            return '</span><span class="etwdata-tag-value">' + p1 + "</span><span";
        });

        //$scope.etwDataDetailRendered = $sce.trustAsHtml(renderLog);
        $scope.etwDataDetailRendered = renderLog;

        // Dynamically change card box size

        //$scope.cssDisplayOnETWDetail = {};
        //$scope.cssDisplayOnETWDetail = 'width:' + screen.width * 0.64 + 'px;height:' + screen.height * 0.92 + 'px;';
        $scope.cssDisplayOnETWDetail = {
            "width": screen.width * 0.64 + "px",
            "height": screen.height * 0.92 + "px"
        }

    };

    // Download source file
    $scope.downloadFile = function (ip, name)
    {

        //window.open('etlviewer/getETWFile', '_blank', '');

        $http({
            url: 'etlviewer/getETWFile',
            method: "GET",
            params: { serverIP: ip, fileName: name }
        }).then(function (res) {
            console.log(res);
            window.location = '@Url.Action("getETWFile", "ETLViewerController")';
            //$scope.fileList = res.data;
            //var fileList = res.data;
            $scope.cssDisplayOnFileName = {};
        }, function (err) {
            console.log(err)
        });

    }


    // Filter function for .etl extension
    $scope.etlFileNameFilter = function (file) {
        
            var re = /\.etl$/;
            var found = file.match(re);
            if (found == null)
                return false;
            else
                return true;
    };

    // Function - Truncate
    $scope.Truncate = function (log, length) {

        if (log != undefined && length != undefined) {
            if (log.length > length)
                return log.substring(0, length);
            return log;
        }
    };
    
    // Function - Refresh - get latest etl list
    $scope.refresh = function () {
        $scope.getETLEventlist($scope.currentIp, $scope.etlFileName, $scope.maxEvents, $scope.maxFileSize);
    };

    // Set Height For ETL File List
    $scope.setHeightForNavList = function ()
    {
        var opsvEnvListEle = angular.element('#dropdown-loeopserver-ul');
        var etlFileListEle = angular.element('#dropdown-etlfiles-ul');

        if (opsvEnvListEle.length > 0)
        {
            var height = opsvEnvListEle.height();
            if (height >= $(window).height() * 0.88)
                opsvEnvListEle.height($(window).height() * 0.82);
        }

        if (etlFileListEle.length > 0)
        {
            var height = etlFileListEle.height();
            if (height >= $(window).height() * 0.88)
                etlFileListEle.height($(window).height() * 0.82);
        }

    }


    // Manipulated ETL data
    function ManipulatedETLData(etlData)
    {

        var re = new RegExp('<([A-za-z].*?)(Response|Refquest)');

        for(i = 0; i < etlData.length; i++)
        {
            etlData[i].time = etlData[i].time.replace('Etw TimeStamp : ', '');
            var match = re.exec(etlData[i].log);
            if(match!=null)
            {
                if(match[0].charAt(0) == '<')
                    etlData[i]['key'] = match[0].substring(1,30);
                else
                    etlData[i]['key'] = match[0].substring(0,30);
            }
            else
            {
                etlData[i]['key'] = '';
            }
        }

        return etlData;
    }


    // $http.post('/data/QueryEventsFromMongo', {etlName: 'HINWorkflow.etl.txt'})
    //          .then(function(res){
                
    //             //console.log(res.data.body);

    //          }, function(err){

    //          })



    // $scope.etlEventsFromMongo = function EventsFromMongo(etlNa) {
        
    //     console.log(etlNa);

    //     $http.post('/data/QueryEventsFromMongo', {etlName: 'HINWorkflow.etl.txt'})
    //      .then(function(res){
    //         $scope.mongoETLEvents = res.data;
    //         //console.log(res.data.body);

    //      }, function(err){

    //      })
    // }


    $scope.getETLEvents = function EventsFromMongo(etlNa) {
        
        console.log(etlNa);

        $http.post('/data/readETL', {etlName: 'HINWorkflow.etl.txt'})
         .then(function(res){
            $scope.mongoETLEvents = res.data;
            console.log(res.data.body);

         }, function(err){

         })
    }




});
