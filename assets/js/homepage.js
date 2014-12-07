var congress_API_Key = "7ed7b4fc1a55c0fe13d052fd45b182e8:8:63556623";
var article_API_Key = "03d4d30364e0db2f88e8411bbf771227:0:63556623";


$(window).on("resize", function() {
    var aspect = 960 / 500,
    chart = $("#statesvg");
    var targetWidth = chart.parent().width();
    chart.attr("width", targetWidth);
    chart.attr("height", targetWidth / aspect);
});


function stateNameHtml(n){  /* function to create html content string in tooltip div. */
        return "<p>"+n+"</p>"
}

function getRecentSenateBills(){
    $.ajax({
        url:"http://api.nytimes.com/svc/politics/v3/us/legislative/congress/113/senate/bills/major.json?api-key="+congress_API_Key,
        dataType: 'json',
        success:function(json){
            //console.log(json);
            showSenateBills(json);
        },
    });
}

function getRecentHouseBills(){
    $.ajax({
        url:"http://api.nytimes.com/svc/politics/v3/us/legislative/congress/113/house/bills/major.json?api-key="+congress_API_Key,
        dataType: 'json',
        success:function(json){
            //console.log(json);
            showHouseBills(json);
        },
    });
}

function showSenateBills(json){
    var recentBillsList = document.createElement('ol');
    $("#recentSenateBills").html("");

    for(var i = 0; i < json.results[0].bills.length; i++){
        var billListElement = document.createElement('li');
        var billDiv = document.createElement('div');
        var billTitle = document.createElement('button');
        billTitle.setAttribute("class", "btn btn-info");
        billTitle.textContent = json.results[0].bills[i].title;

        $(billDiv).append(billTitle);
        $(billListElement).append(billDiv);
        $(recentBillsList).append(billListElement);
        $("#recentSenateBills").append(recentBillsList);

        (function (bills, i) {
            var bill_id = billURIToID(bills[i].bill_uri);
            var congress_num = billURIToCongress(bills[i].bill_uri);
            $(billTitle).click(function() {
                hideHomePage();
                loadBillPage(congress_API_Key, article_API_Key, bill_id, congress_num);
            });
        })(json.results[0].bills, i);
    }
}

function showHouseBills(json){
    var recentBillsList = document.createElement('ol');
    $("#recentHouseBills").html("");

    for(var i = 0; i < json.results[0].bills.length; i++){
        var billListElement = document.createElement('li');
        var billDiv = document.createElement('div');
        billDiv.setAttribute("height", "34");
        var billTitle = document.createElement('button');
        billTitle.setAttribute("class", "btn btn-info");
        billTitle.setAttribute("height", "34");
        billTitle.textContent = json.results[0].bills[i].title;

        $(billDiv).append(billTitle);
        $(billListElement).append(billDiv);
        $(recentBillsList).append(billListElement);
        $("#recentHouseBills").append(recentBillsList);

        (function (bills, i) {
            var bill_id = billURIToID(bills[i].bill_uri);
            var congress_num = billURIToCongress(bills[i].bill_uri);
            $(billTitle).click(function() {
                hideHomePage();
                loadBillPage(congress_API_Key, article_API_Key, bill_id, congress_num);
            });
        })(json.results[0].bills, i);
    }
}

function showHomePage(){
    $(".container").show();

    var svg = d3.select("svg");

    var stateName =
    ["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
    "ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH",
    "MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT",
    "CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN",
    "WI", "MO", "AR", "OK", "KS", "LS", "VA"];


    uStates.draw("#statesvg", stateName, stateNameHtml);

    $('#carousel').on('slid.bs.carousel', function () {
        $holder = $( "ol li.active" );
        $holder.removeClass('active');
        var idx = $('div.active').index('div.item');
        $('ol.carousel-indicators li[data-slide-to="'+ idx+'"]').addClass('active');
    });

    $('ol.carousel-indicators  li').on("click",function(){
        $('ol.carousel-indicators li.active').removeClass("active");
        $(this).addClass("active");
    });

    createZipSubmitButton();

    getRecentSenateBills();
    getRecentHouseBills();
}

function hideHomePage() {
    $(".container").hide();
}

function createZipSubmitButton(){
    var zipSubmitDiv = document.createElement('div');
    zipSubmitDiv.setAttribute("class", "col-xs-12 col-sm-3 col-md-3 col-lg-3");
    zipSubmitDiv.setAttribute("id", "zipSubmit");

    var submitButton = document.createElement('button');
    submitButton.setAttribute("class", "col-xs-12 btn btn-default");
    submitButton.setAttribute("id", "submitButton");
    submitButton.textContent = "Submit";

    var form = document.getElementById("form");
    form.setAttribute("action", "javascript: onZipSubmit()");

    var formgroup = document.getElementById("formGroup");
    $(zipSubmitDiv).append(submitButton);
    $('#zipSubmit').remove();

    $(formgroup).append(zipSubmitDiv);
}

function onZipSubmit(){
    var zipCodeElement = document.getElementById('zipcode');
    var zipCode = zipCodeElement.value;
    hideHomePage();
    //GRAB ZIP CODE
    getStateZip(zipCode);

}


