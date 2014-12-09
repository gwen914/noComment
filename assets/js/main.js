$(document).ready(function() {
    var ARTICLE_API_KEY = '03d4d30364e0db2f88e8411bbf771227:0:63556623',
        CONGRESS_API_KEY = '7ed7b4fc1a55c0fe13d052fd45b182e8:8:63556623';

    linkInit(CONGRESS_API_KEY, ARTICLE_API_KEY);
    showHomePage();


    //$('a[href*=#]:not([href=#])').click(function() {
    $('#pageWelcome div a').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top
            }, 800);
            return false;
          }
        }
    });

});


function linkInit(C_KEY, A_KEY) {
    $('.billSponsor').click(function() {
        var member_id = $(this).next().text();
        hideBillPage();
        showRepPage(C_KEY, A_KEY, member_id);
    });

    $('.billLink').click(function() {
        var bill_id = $(this).parent().find('.billID').first().text(),
            congress_num = $(this).parent().find('.congressNum').first().text();
        loadBillPage(C_KEY, A_KEY, bill_id, congress_num);
    });
}

function loadBillPage(C_KEY, A_KEY, bill_id, congress_num) {
    var requestURI = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/' + congress_num + '/bills/' + bill_id + '.json?api-key=' + C_KEY;
    $.ajax({
        url: requestURI,
        dataType: 'jsonp',
        success: function(data) {
            showBill(C_KEY, A_KEY, data.results[0], bill_id, congress_num);
        }
    });
}

function hideBillPage() {
    $('#pageContent').find('.bill').remove()
}

function showBill(C_KEY, A_KEY, bill, bill_id, congress_num) {
    var b_clone,
        action_list,
        action_clone,
        sponsor_id = billURIToID(bill.sponsor_uri),
        i;

    b_clone = $('#dummyBill').children('.bill').first().clone(true);
    b_clone.find('.billID').first().text(bill_id);
    b_clone.find('.billTitle').first().text(bill.title);
    b_clone.find('.billSponsor').first().text(bill.sponsor);
    b_clone.find('.billSponsorID').first().text(sponsor_id);
    b_clone.find('.billCode').first().text(bill.bill);
    b_clone.find('.billCommittees').first().text(bill.committees);
    b_clone.find('.billCongress').first().text(bill.congress);
    b_clone.find('.billIntroducedDate').first().text(bill.introduced_date);

    action_list = b_clone.find('.billActions').first();
    if (bill.actions.length == 0) {
        action_list.find('.noActionsText').removeClass('hide');
    } else {
        for (i = bill.actions.length - 1; i >= 0; i--) {
            action_clone = action_list.find('.action').first().clone(true);
            action_clone.find('.actionDate').first().text(bill.actions[i].datetime);
            action_clone.find('.actionText').first().text(bill.actions[i].description);
            action_clone.appendTo(action_list).removeClass('hide');
        }
    }

    b_clone.appendTo('#pageContent');

    showRelatedBills(C_KEY, bill_id, congress_num);
    showRelatedArticles(A_KEY, bill.sponsor + ' ' + bill.committees);
}

function showRelatedBills(C_KEY, bill_id, congress_num) {
    var requestURI = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/' + congress_num + '/bills/' + bill_id + '/related.json?api-key=' + C_KEY,
        related,
        related_list,
        related_clone,
        i;

    $.ajax({
        url: requestURI,
        dataType: 'jsonp',
        success: function(data) {
            related = data.results[0].related_bills;
            related_list = $('.relatedBills').first();
            if (related.length == 0) {
                related_list.find('.noRelatedText').first().removeClass('hide');
            } else {
                for (i = 0; i < Math.min(related.length, 5); i++) {
                    related_clone = related_list.find('.relatedBill').first().clone(true);
                    related_clone.find('.billLink').first().text(related[i].bill);
                    related_clone.find('.billID').first().text(related[i].url_number);
                    related_clone.find('.congressNum').first().text(data.results[0].congress);
                    related_clone.find('.billSponsor').first().text(related[i].sponsor);
                    related_clone.find('.billSponsorID').first().text(related[i].sponsor_id);
                    related_clone.appendTo(related_list).removeClass('hide');
                }
            }
        }
    });
}

function showRelatedArticles(A_KEY, keywords) {
    var requestURI = 'http://api.nytimes.com/svc/search/v2/articlesearch.jsonp?callback=svc_search_v2_articlesearch&q=' + encodeURIComponent(keywords) + '&sort=newest&api-key=' + A_KEY,
        related,
        related_list,
        related_clone,
        i;

    $.ajax({
        url: requestURI,
        dataType: 'jsonp',
        jsonp: false,
        jsonpCallback: 'svc_search_v2_articlesearch',
        success: function(data) {
            related = data.response.docs;
            related_list = $('.relatedArticles').first();
            if (related.length == 0) {
                related_list.find('.noRelatedText').first().removeClass('hide');
            } else {
                for (i = 0; i < Math.min(related.length, 5); i++) {
                    related_clone = related_list.find('.relatedArticle').first().clone(true);
                    related_clone.find('.relatedArticleLink').first().attr('href', related[i].web_url).text(related[i].headline.main);
                    related_clone.appendTo(related_list).removeClass('hide');
                }
            }
        }
    });
}

function billURIToID(bill_uri) {
    return bill_uri.split('/').pop().replace('.json', '');
}

function billURIToCongress(bill_uri) {
    var parts =  bill_uri.split('/');
    return parts[parts.length - 3];
}

function clearContentContainer() {
    $('#pageContent').children().remove();
}

// REPRESENTATIVE

function requestJson(url, callback) {
  $.ajax({
    dataType: 'jsonp',
    url: url,
    success: function(data) {
      callback.call(null, data);
    }
  });
}

function loadRepPage(C_KEY, A_KEY, member_id) {
  var member_bio_url = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/'+member_id+ '.json?api-key='+ C_KEY;
  requestJson(member_bio_url, function(json) {
    var bio = json.results[0];
    var party = bio.current_party;
    color(party);
    var current_role = bio.roles[0];
    document.getElementById('firstName').innerHTML = bio.first_name;
    document.getElementById('lastName').innerHTML = bio.last_name;
    document.getElementById('chamber').innerHTML = current_role.chamber;
    document.getElementById('state').innerHTML = current_role.state;

    $('#website-link').removeClass('hide');
    $('#facebook-link').removeClass('hide');
    $('#twitter-link').removeClass('hide');
    $('#youtube-link').removeClass('hide');

    if (bio.url.length == 0) {
        $('#website-link').addClass('hide');
    }
    else {
        document.getElementById('website-link').href = bio.url;
    }

    if (bio.facebook_id.length == 0) {
        $('#facebook-link').addClass('hide');
    }

    else {
        document.getElementById('facebook-link').href = 'http://www.facebook.com/' + bio.facebook_id;
    }
    
    if (bio.twitter_account.length == 0) {
        $('#twitter-link').addClass('hide');
    }
    else {
        document.getElementById('twitter-link').href = 'http://www.twitter.com/' + bio.twitter_account;
    }

    if (bio.youtube_account.length == 0) {
        $('#youtube-link').addClass('hide');
    }
    else {
        document.getElementById('youtube-link').href = 'http://www.youtube.com/user/' + bio.youtube_account;
    }
    
    $('#state').off("click").click(function() {
        hideRepPage();
        var state;
        $.each(uStatePaths, function(i, item){
            if (item.id == current_role.state) {
                state = item.n;
            };
        });
        getLegislators(state, current_role.state, [0], 0);
    });
    document.getElementById('party').innerHTML = current_role.party == 'D' ? 'Democrat' : 'Republican';
    document.getElementById('seniority').innerHTML = current_role.seniority;
    document.getElementById('missed-pct').innerHTML = current_role.missed_votes_pct;
    document.getElementById('votes-pct').innerHTML = current_role.votes_with_party_pct;

    var committees = current_role.committees[0].name;
    for (i=1; i< current_role.committees.length; i++) {
      committees = committees + ', ' + current_role.committees[i].name;
    }
    document.getElementById('committees-names').innerHTML = committees;
    var bills_sponsored_url = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/' + member_id+ '/bills/introduced.json?api-key=' + C_KEY;
    requestJson(bills_sponsored_url, function(sponsoredJson) {
      var bills = sponsoredJson.results[0].bills;
      for (j=0; j<bills.length; j++) {
        var item = '<li><a class="repBillLink" href="#">'+ bills[j].title + '<span class="repBillURI hide">' + bills[j].bill_uri + '</span><span class="repBillCongress hide">' + bills[j].congress + '</span></a></li>';
        $('#sponsored-list').append(item);
        $('#sponsored-list').find('.repBillLink').last().click(function() {
            var bill_uri = $(this).find('.repBillURI').first().text(),
                congress = $(this).find('.repBillCongress').first().text();

            hideRepPage();
            loadBillPage(C_KEY, A_KEY, billURIToID(bill_uri), congress);
        });
      }
    });

    /*var bills_cosponsored_url = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/' + member_id + '/bills/cosponsored.json?api-key=' + C_KEY;
    requestJson(bills_cosponsored_url, function(cosponsoredJson) {
      var bills2 = cosponsoredJson.results[0].bills;
      //console.log(bills2[0].title);
      for (k=0; k<bills2.length; k++) {
        var bill = bills2[k];
        var loadBillPage = '';// onClick(loadBillPage('+ C_KEY + ', '+ A_KEY + ',' + billURIToID(bill.bill_uri) + ',' + bill.congress + '));';
        var item = '<li><a href="#" '+ loadBillPage + '>'+ bill.title + '</a></li>';
        $('#co-sponsored-list').append(item);
      }
    });*/
  });
}


function color(party) {
  if (party == 'D') {
    $('#name').css('color', 'blue');
  }
  else {
    $('#name').css('color', 'red');
  }
}


function showRepPage(C_KEY, A_KEY, member_id) {
  loadRepPage(C_KEY, A_KEY, member_id);
  $('#repPage').removeClass('hide');
}

function hideRepPage() {
  $('#repPage').addClass('hide');
}