Dropzone.autoDiscover = false;

$(document).ready(function () {
  // Any additional initialization can go here
});

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Some Message",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  dz.on("complete", function (file) {
    let imageData = file.dataURL;

    var url = "http://127.0.0.1:5001/classify_image";

    $.post(
      url,
      {
        image_data: file.dataURL,
      },
      function (data, status) {
        /* 
            Below is a sample response if you have two faces in an image lets say virat and roger together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    class: "viral_kohli",
                    class_probability: [1.05, 12.67, 22.00, 4.5, 91.56],
                    class_dictionary: {
                        lionel_messi: 0,
                        maria_sharapova: 1,
                        roger_federer: 2,
                        serena_williams: 3,
                        virat_kohli: 4
                    }
                },
                {
                    class: "roder_federer",
                    class_probability: [7.02, 23.7, 52.00, 6.1, 1.62],
                    class_dictionary: {
                        lionel_messi: 0,
                        maria_sharapova: 1,
                        roger_federer: 2,
                        serena_williams: 3,
                        virat_kohli: 4
                    }
                }
            ]
            */
        console.log(data);
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#Profiletable").hide();
          $("#error").show();
          return;
        }
        let players = [
          "lionel_messi",
          "maria_sharapova",
          "roger_federer",
          "serena_williams",
          "virat_kohli",
        ];

        let match = null;
        let bestScore = -1;
        let matchProfile = null; // Placeholder for class_profile if separate
        for (let i = 0; i < data.length; ++i) {
          let maxScoreForThisClass = Math.max(...data[i].class_probability);
          if (maxScoreForThisClass > bestScore) {
            match = data[i];
            bestScore = maxScoreForThisClass; // Adjust based on actual structure
          }
          if (match) {
            $("#error").hide();
            $("#resultHolder").show();
            $("#divClassTable").show();

            // Assuming the class name can be directly used as the image file name.
            // Adjust the path as necessary.
            let imageName = match.class.replaceAll("_", " ").toLowerCase(); // Replace underscores with spaces, convert to lower case if necessary
            let imagePath = `./images/${imageName}.jpeg`; // Change the path and extension as needed

            // Set the image source and show the image
            $("#classImage").attr("src", imagePath).show();

            $("#resultHolder").html($(`[data-player="${match.class}"`).html());
            let classDictionary = match.class_dictionary;
            // The rest of your code to handle displaying other information
          }
        }
        if (match.class_probability) {
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html(
            $(`[data-player="${match.class_probability}"`).html()
          );
          let classDictionary = match.class_dictionary;
          $("#divClassTable").show(); // Ensure the profile table is visible

          // Example: Update the table or elements with class_profile info
          // Adjust based on your actual HTML structure and what class_profile contains
          $("#score_lionel_messi").text(match.class_probability[2]);
          $("#score_maria_sharapova").text(match.class_probability[0]);
          $("#score_roger_federer").text(match.class_probability[4]);
          $("#score_serena_williams").text(match.class_probability[3]);
          $("#score_virat_kohli").text(match.class_probability[1]);
        } else {
          $("#divClassTable").hide();
        }
        if (match.class_profile) {
          $("#Profiletable").show(); // Ensure the profile table is visible

          // Example: Update the table or elements with class_profile info
          // Adjust based on your actual HTML structure and what class_profile contains
          $("#profile_name").text(match.class_profile[0]);
          $("#profile_age").text(match.class_profile[1]);
          $("#profile_sport").text(match.class_profile[2]);
        } else {
          $("#Profiletable").hide();
        }
      }

      // Update the profile details
      //$("#profile_name").text(match.class); // Update this ID to be more generic if necessary
      //$("#profile_age").text(match.class_profile[1]); // Same here
      //$("profile_sports").text(match.class_profile[2]); // And here

      // dz.removeFile(file);
    );
  });

  $("#submitBtn").on("click", function (e) {
    dz.processQueue();
  });
}

$(document).ready(function () {
  console.log("ready!");
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  $("#Profiletable").hide();

  init();
});
