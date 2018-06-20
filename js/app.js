/* STUDENTS IGNORE THIS FUNCTION
 * All this does is create an initial
 * attendance record if one is not found
 * within localStorage.
 */
(function() {
    if (!localStorage.attendance) {
        console.log('Creating attendance records...');
        function getRandom() {
            return (Math.random() >= 0.5);
        }
        // gets a nodelist of student names from the DOM elements with a class of .name-col and stores them in nameColumns
        var nameColumns = $('tbody .name-col'),
        // this sets up an object of named arrays, where by the name is the Student name and the elements of the array are true/false depending on attendance
            attendance = {};
        // loops through the nodeLest of elements and
        nameColumns.each(function() {
            // gets the innertext (the Student names)
            var name = this.innerText;
            // places an empty named array into the object with the value being the array and the student name (innerText) being the key
            attendance[name] = [];

            // loop through named array, calling getRandom() to determine a true/false status of student attendance, and push the results into the array
            for (var i = 0; i <= 11; i++) {
                attendance[name].push(getRandom());
            }
        });
        // Place the attendance object into memory for storage as one long string
        localStorage.attendance = JSON.stringify(attendance);
    }
}());

const dataModule = (function () {
    const data = {
        attendance: JSON.parse(localStorage.attendance)
    }

    return {
        getData: function () {
            return data;
        },
        updateData: function (obj) {
            localStorage.attendance = JSON.stringify(obj);
        }
    }

})();

const UIModule = (function () {
    const DOMStrings = {
        // creates a nodeList of "totals" columns
        $allMissed: $('tbody .missed-col'),
        // creates a nodeList of all checkBoxes in the table
        $allCheckboxes: $('tbody input')
    }

    return {
        // setsup a public method to Count a student's missed days
        countMissing: function() {
            // loop the nodelist and for each .missed-col
            DOMStrings.$allMissed.each(function() {

                // create a nodelist that defines a students row as:
                // [1 name cell, 12 attend cells, 1 missed cell]
                var studentRow = $(this).parent('tr'),
                    // create nodelist of checkboxes in each cell of the row [12 attend cells]
                    dayChecks = $(studentRow).children('td').children('input'),
                    // sets the current value of numMissed to 0 (for the says missed column)
                    numMissed = 0;

                // loop through each row and
                dayChecks.each(function() {
                    // if the input boxes that ARE NOT checked
                    if (!$(this).prop('checked')) {
                        // increment the number of days missed
                        numMissed++;
                    }
                });
                // place the total number of days missed in the .missed-col or the current row when the for loop has completed
                $(this).text(numMissed);
            });
        },
        // method that the appController will have access to
        getDOMStrings: function () {
            // returns the domstrings to as a public
            return DOMStrings;
        }
    }
})();

const appController = (function (dataMdl, UIMdl) {
    // get the domstrings from the UI module
    const DOM = UIMdl.getDOMStrings();
    // get the data from the DataModule
    const data = dataMdl.getData();
    // get the attendance record returned from the dataModule and set it in the variable attendence
    const attendance = data.attendance;

    // initialize a functions to be called by the init() method to setup eventlisteners when the app initializes
    function setupEventListeners () {
        // setup and eventLister for all rows in the table
        $('tr').on('click', function (e) {
            // if the target is NOT an input
            if (e.target.tagName.toUpperCase() !== 'INPUT') {
                // then we arent interested
                return;
            };
            // get the students name from the row the checkbox that was clicked on is located in
            let name = this.firstElementChild.innerText;
            // if the checkbox exists in the nodeList of allCheckboxes, return its position in the nodeList
            // returns a number between 0-59 as there are 60 checkboxes in total
            var idx = $.inArray(e.target, DOM.$allCheckboxes);

            // algorithm to determine the position of the checked box in the student rows (which would be i will equal a number 0-11) from its returned position (idx = 0-59) within the nodeList, $allCheckboxes
            let i = (idx>=0)&&(idx<=11)?(idx):
                (idx>=12)&&(idx<=23)?(idx-12):
                (idx>=24)&&(idx<=35)?(idx-24):
                (idx>=36)&&(idx<=47)?(idx-36):
                (idx>=48)&&(idx<=59)?(idx-48):null;

                // push the value of the clicked checkbox into its correct position of student row that it is located within
                attendance[name][i]= e.target.checked;
                // update the data in local storage
                dataMdl.updateData(attendance);
                // update the total missed days in the UI
                UIMdl.countMissing();

        });
    }

    return {
        init: function () {
            console.log('Application has started!');
            // Check boxes, based on attendance records
            // attendance is an object that is is placed in the function with the property name being the Student name (the name of the array), and the days being the value of the property [the actual array of elements itself] i.e. StudenName: [true, false, true, false]
            $.each(attendance, function(name, days) {
                // find the Student row (node) that contains the Name of the current KEY (studentName) being iterated over and place it into the studentRow variable
                let studentRow = $('tbody .name-col:contains("' + name + '")').parent('tr'),
                    // setup a nodeList of all inputs in the current
                    dayChecks = $(studentRow).children('.attend-col').children('input');
                // loop through the nodeList of inputs, keeping track of the index of the current element
                dayChecks.each(function(index) {
                    // set the checked property of the current node (input) to the value in the array (StudenName: [true, false, true, false]) with the same index
                    $(this).prop('checked', days[index]);
                });

            });
            // count total number of days missed
            UIMdl.countMissing();
            setupEventListeners();
        }
    }
})(dataModule, UIModule);

appController.init();
