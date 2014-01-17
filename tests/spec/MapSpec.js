// These are very simple tests to check the sanity of some of the main functions.
// Currently there are no UI tests.

describe("Food Truck", function() {
  var search = mapExports.search;
  var squareAroundPoint = mapExports.squareAroundPoint;

  it("should calculate correct square", function() {
    var result = squareAroundPoint(37.5334522, -122.24376679999999, 1);
    var expected = [37.52622372640327, -122.25288217682015, 37.540680673596725, -122.2346514231798];
    expect(result).toEqual(expected);
  });

  it("should find correct search results", function () {
    var items = [];

    runs(function () {
      search('indian', 37.79044964027559, -122.40203008955075, function (foodTruckItem) {
        items.push(foodTruckItem);
      });
    });

    waitsFor(function () {
      return items.length > 0;
    }, "The items should be populated", 1000);

    runs(function () {
      var expected = [
        { location:{ needs_recoding:false, longitude:'-122.395881037809', latitude:'37.7891192216837' },
          status:'APPROVED', expirationdate:'2014-03-15T00:00:00', permit:'13MFF-0060', block:'3720',
          received:'Mar 14 2013 12:50PM', facilitytype:'Truck', blocklot:'3720008',
          locationdescription:'01ST ST: NATOMA ST to HOWARD ST (165 - 199)', cnn:'106000',
          priorpermit:'0', approved:'2013-06-06T17:05:20',
          schedule:'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=13MFF-0060&ExportPDF=1&Filename=13MFF-0060_schedule.pdf',
          address:'400 HOWARD ST', applicant:'Cheese Gone Wild', lot:'008', fooditems:'Grilled Cheese Sandwiches',
          longitude:'-122.395881037818', latitude:'37.7891192079118', objectid:'427795', y:'2115347.095', x:'6013858.06' }
      ];
      expect(items).toEqual(expected);
    });
  });

});
