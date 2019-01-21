// Time Picker Initialization (I utilized this library to force 24 hour input of time for the first train time)
$("#time-input").timepicker({
    showSeconds: false,
    showMeridian: false,
    defaultTime: false
});

// Firebase Initialization
var config = {
    apiKey: "AIzaSyAqQVCGnWY_Af9Nk0SqusXLw3bL0QEJ0DA",
    authDomain: "sh-trainscheduler.firebaseapp.com",
    databaseURL: "https://sh-trainscheduler.firebaseio.com",
    projectId: "sh-trainscheduler",
    storageBucket: "sh-trainscheduler.appspot.com",
    messagingSenderId: "904641448981"
};
firebase.initializeApp(config);

var database = firebase.database();

// Declare variables in global scope
var trainName;
var destination;
var startTime;
var frequency;
var minutesAway;
var nextArrival;

// Function to calculate next arrival and minutes away
function timeCalc() {
    // Convert start time to minutes
    var startTimeConverted = moment(startTime, "hh:mm");
    // Calculate the time difference between the current time and the start time
    var timeDifference = moment().diff(moment(startTimeConverted), "minutes");
    // Divide by frequency to get remainder
    timeRemaining = timeDifference % parseInt(frequency);
    // Subtract from frequency to determine how many minutes until next train
    minutesAway = parseInt(frequency) - timeRemaining;
    // Add minutes away to current time to get arrival time of next train
    nextArrival = moment().add(minutesAway, "minutes");
};

// Click-handler for adding new trains
$("#submit-button").on("click", function (event) {
    event.preventDefault();

    // Grab user input
    trainName = $("#name-input").val().trim();
    destination = $("#destination-input").val().trim();
    startTime = $("#time-input").val().trim();
    frequency = $("#frequency-input").val().trim();

    // Store as object
    var newTrain = {
        name: trainName,
        dest: destination,
        start: startTime,
        freq: frequency
    };

    // Push to database
    database.ref().push(newTrain);

    // Run timeCalc function to get data from user input
    timeCalc();

    // Clear form input fields
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#time-input").val("");
    $("#frequency-input").val("");
});

// Update table on page load with data from Firebase
database.ref().on("child_added", function (childSnapshot) {

    // Store data from Firebase in variables for easy access
    trainName = childSnapshot.val().name;
    destination = childSnapshot.val().dest;
    startTime = childSnapshot.val().start;
    frequency = childSnapshot.val().freq;
    
    // Run timeCalc function to get data from user input
    timeCalc();

    // Store data in a variable
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(destination),
        $("<td>").text(frequency),
        $("<td>").text(moment(nextArrival).format("HH:mm")),
        $("<td>").text(minutesAway),
    );

    // Aooend to page
    $("#train-schedule > tbody").append(newRow);

    // Errors
}, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
});