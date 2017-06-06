$(function() {
   console.log("Loading animals.");
   function loadAnimals() {
      $.getJSON( "/api/animals/", function ( animals ) {
         var msg = "Nobody is here.";
         if ( animals.length > 0 ) {
            msg = animals[0].name + " the " + animals[0].animal;
         }
         $(".intro-text").text(msg);
      });
   };

   setInterval( loadAnimals, 5000 );

});
